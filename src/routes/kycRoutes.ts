import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getDataSource } from "../data-source";
import { KycRequest, KycStatus } from "../entity/KycRequest";
import { User } from "../entity/User";
import { saveKycDocument } from "../utils/kycStorage";
import { buildNotification, publishNotification } from "../utils/notificationHub";

const router = Router();

const submitKycSchema = z.object({
    fullName: z.string().trim().min(2).max(120),
    dob: z.string().trim().min(4).max(40),
    address: z.string().trim().min(5).max(255),
    nationalId: z.string().trim().min(3).max(80).optional().nullable(),
    passportNumber: z.string().trim().min(3).max(80).optional().nullable(),
    country: z.string().trim().min(2).max(80),
    transactionIntent: z.string().trim().min(3).max(255),
    idDocument: z.object({
        name: z.string().trim().min(1),
        dataUrl: z.string().min(20),
    }),
    addressDocument: z.object({
        name: z.string().trim().min(1),
        dataUrl: z.string().min(20),
    }),
});

function buildDocumentRef(payload: {
    profile: Record<string, unknown>;
    documents: Array<{
        id: string;
        type: string;
        fileName: string;
        mimeType: string;
        size: number;
        filePath: string;
        isValid: boolean | null;
        validationRemark: string | null;
    }>;
}): string {
    return JSON.stringify({
        profile: payload.profile,
        documents: payload.documents,
    });
}

function enrichKycRequest(request: KycRequest) {
    const parsed = parseKycDetails(request.documentRef);
    return {
        ...request,
        ...parsed.profile,
        profile: parsed.profile,
        documents: parsed.documents,
        submittedDate: request.createdAt,
        fullName: parsed.profile.fullName || request.user?.name || "",
        dob: parsed.profile.dob || null,
        country: parsed.profile.country || null,
        transactionIntent: parsed.profile.transactionIntent || null,
        riskLevel: parsed.profile.riskLevel || undefined,
        riskScore: parsed.profile.riskScore || undefined,
        riskFactors: parsed.profile.riskFactors || undefined,
    };
}

function parseKycDetails(documentRef: string | null): {
    profile: {
        fullName?: string;
        dob?: string;
        address?: string;
        nationalId?: string;
        passportNumber?: string;
        country?: string;
        transactionIntent?: string;
        riskLevel?: string;
        riskScore?: number;
        riskFactors?: string[];
    };
    documents: Array<{
        id: string;
        type: string;
        fileName: string;
        mimeType: string;
        size?: number;
        filePath: string;
        isValid: boolean | null;
        validationRemark: string | null;
    }>;
} {
    if (!documentRef) {
        return { profile: {}, documents: [] };
    }

    try {
        const parsed = JSON.parse(documentRef);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return {
                profile: parsed.profile || {},
                documents: Array.isArray(parsed.documents) ? parsed.documents : [],
            };
        }

        if (Array.isArray(parsed)) {
            return { profile: {}, documents: parsed };
        }
    } catch {
        return { profile: {}, documents: [] };
    }

    return { profile: {}, documents: [] };
}

router.use(authMiddleware);

router.get("/me", async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }

        const repo = getDataSource().getRepository(KycRequest);
        const request = await repo.find({
            where: { userId: req.user.id },
            relations: { user: true },
            order: { createdAt: "DESC" },
            take: 1,
        });

        if (!request.length) {
            res.json({ success: true, data: null });
            return;
        }

        res.json({ success: true, data: enrichKycRequest(request[0]) });
    } catch (error) {
        console.error("Get current KYC error:", error);
        res.status(500).json({ success: false, message: "Failed to load your KYC details" });
    }
});

router.post("/submit", async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = submitKycSchema.safeParse(req.body || {});
    if (!parsed.success) {
        res.status(400).json({ success: false, message: "Invalid KYC submission payload" });
        return;
    }

    try {
        if (!req.user?.id) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }

        if (String(req.user.role || "").toLowerCase() !== "customer") {
            res.status(403).json({ success: false, message: "Only customers can submit KYC" });
            return;
        }

        const dataSource = getDataSource();
        const kycRepo = dataSource.getRepository(KycRequest);
        const userRepo = dataSource.getRepository(User);

        const latest = await kycRepo.find({
            where: { userId: req.user.id },
            order: { createdAt: "DESC" },
            take: 1,
        });

        if (latest[0] && [KycStatus.PENDING, KycStatus.VERIFIED].includes(latest[0].status as KycStatus)) {
            res.status(409).json({
                success: false,
                message: "A KYC submission is already pending or approved for this account",
            });
            return;
        }

        const idDocument = await saveKycDocument(req.user.id, {
            type: "Identity Document",
            name: parsed.data.idDocument.name,
            dataUrl: parsed.data.idDocument.dataUrl,
        });

        const addressDocument = await saveKycDocument(req.user.id, {
            type: "Proof of Address",
            name: parsed.data.addressDocument.name,
            dataUrl: parsed.data.addressDocument.dataUrl,
        });

        const profile = {
            fullName: parsed.data.fullName,
            dob: parsed.data.dob,
            address: parsed.data.address,
            nationalId: parsed.data.nationalId || null,
            passportNumber: parsed.data.passportNumber || null,
            country: parsed.data.country,
            transactionIntent: parsed.data.transactionIntent,
            submittedAt: new Date().toISOString(),
            riskLevel: "Medium",
            riskScore: 50,
            riskFactors: [
                "Initial submission",
                parsed.data.nationalId ? "National ID provided" : "Passport fallback or unavailable",
            ],
        };

        const request = kycRepo.create({
            userId: req.user.id,
            status: KycStatus.PENDING,
            documentType: "Identity Document + Proof of Address",
            documentRef: buildDocumentRef({
                profile,
                documents: [
                    {
                        ...idDocument,
                        isValid: null,
                        validationRemark: null,
                    },
                    {
                        ...addressDocument,
                        isValid: null,
                        validationRemark: null,
                    },
                ],
            }),
            remarks: null,
            verifiedByEmployeeId: null,
            verifiedAt: null,
        });

        const saved = await kycRepo.save(request);

        const user = await userRepo.findOne({ where: { id: req.user.id } });
        if (user) {
            user.address = parsed.data.address;
            const identityNumber = parsed.data.nationalId || parsed.data.passportNumber;
            if (identityNumber) {
                user.nationalId = identityNumber;
            }
            await userRepo.save(user);
        }

        const enriched = enrichKycRequest({
            ...saved,
            user: user || undefined,
        } as KycRequest);

        const customerNotification = buildNotification({
            title: "KYC Submitted",
            message: "Your KYC submission has been received and is awaiting review.",
            type: "System",
        });
        const adminNotification = buildNotification({
            title: "New KYC Submission",
            message: `${parsed.data.fullName} submitted a new KYC request.`,
            type: "Warning",
        });

        publishNotification(customerNotification, { role: "Customer", userId: req.user.id });
        publishNotification(adminNotification, { role: "Admin" });

        res.status(201).json({
            success: true,
            message: "KYC submitted successfully",
            data: enriched,
        });
    } catch (error) {
        console.error("Submit KYC error:", error);
        const message = error instanceof Error ? error.message : "Failed to submit KYC";
        res.status(400).json({ success: false, message });
    }
});

export { enrichKycRequest, parseKycDetails };
export default router;
