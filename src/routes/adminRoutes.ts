import { Router, Response } from "express";
import { Brackets, FindOptionsWhere, ILike } from "typeorm";
import { z } from "zod";
import { verifyAdminRole, verifyToken, AuthRequest, requireSuperAdmin } from "../middleware/auth";
import { getDataSource } from "../data-source";
import { User } from "../entity/User";
import { Employee } from "../entity/Employee";
import { Account } from "../entity/Account";
import { Loan, LoanStatus } from "../entity/Loan";
import { Transaction, TransactionStatus, TransactionType } from "../entity/Transaction";
import { KycRequest, KycStatus } from "../entity/KycRequest";
import { ActivityLog } from "../entity/ActivityLog";
import { EmployeeInvite } from "../entity/EmployeeInvite";
import { AdminSetting } from "../entity/AdminSetting";
import { Ticket, TicketStatus } from "../entity/Ticket";
import { hashPassword } from "../utils/hashPassword";
import { generateAdminId } from "../utils/helpers";
import { sendEmployeeInviteEmail, sendKycDecisionEmail, getEmailDiagnostics } from "../utils/emailService";
import { generateInviteToken } from "../utils/inviteToken";
import { buildNotification, publishNotification } from "../utils/notificationHub";

const router = Router();
const CUSTOMER_ROLE = "Customer";

router.use(verifyToken, verifyAdminRole);

const inviteEmployeeSchema = z.object({
    email: z.email(),
    name: z.string().trim().min(2).max(100),
    department: z.string().trim().min(2).max(100),
    position: z.string().trim().min(2).max(100),
    salary: z.coerce.number().min(0),
    expiresAt: z.union([z.string(), z.null()]).optional(),
    notes: z.string().trim().max(255).optional(),
});

const employeeStatusSchema = z.object({
    isActive: z.boolean(),
});

const customerStatusSchema = z.object({
    status: z.string().trim().min(3).max(20),
});

const accountStatusSchema = z.object({
    isActive: z.boolean(),
});

const transactionFlagSchema = z.object({
    isFlagged: z.boolean(),
    reason: z.string().trim().max(255).optional(),
    status: z.enum(["Pending", "Approved", "Suspicious"]).optional(),
});

const reverseTransactionSchema = z.object({
    reason: z.string().trim().min(3).max(255),
});

const loanDecisionSchema = z.object({
    remarks: z.string().trim().max(500).optional(),
});

const kycVerifySchema = z.object({
    status: z.enum(["Verified", "Rejected"]),
    remarks: z.string().trim().max(500).optional(),
});

const settingsSchema = z.object({
    settings: z.array(
        z.object({
            settingKey: z.string().trim().min(1).max(100),
            settingValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
            description: z.string().trim().max(1000).optional(),
        })
    ).min(1),
});

const createAdminSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.email(),
    password: z.string().min(8),
    phone: z.string().trim().max(20).optional(),
    nationalId: z.string().trim().min(5).max(50).optional(),
    department: z.string().trim().min(2).max(100).optional(),
    officeLocation: z.string().trim().min(2).max(100).optional(),
    accessLevel: z.enum(["Super Admin", "Manager Admin"]).default("Manager Admin"),
    permissions: z.array(z.string().trim().min(1)).optional(),
});

function getAdminActorId(req: AuthRequest): number {
    return Number(req.user?.id || 0);
}

async function logAdminAction(req: AuthRequest, action: string, details?: string): Promise<void> {
    try {
        const activityRepository = getDataSource().getRepository(ActivityLog);
        const log = activityRepository.create({
            employeeId: getAdminActorId(req),
            action,
            details: details || null,
        });
        await activityRepository.save(log);
    } catch (error) {
        console.error("Failed to log admin action:", error);
    }
}

function sendValidationError(res: Response, message: string) {
    return res.status(400).json({ error: message });
}

function buildInviteUrl(token: string): string {
    const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    return `${frontendBase}/accept-invite?token=${encodeURIComponent(token)}`;
}

type KycDocumentPreview = {
    id: string;
    type: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    isValid: boolean | null;
    validationRemark: string | null;
};

type KycProfile = {
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
    submittedAt?: string;
};

function parseDateInput(value: unknown): Date | null {
    const date = new Date(String(value || "").trim());
    return Number.isNaN(date.getTime()) ? null : date;
}

function inferFileName(filePath: string, fallbackType: string): string {
    const trimmed = String(filePath || "").trim();
    if (!trimmed) {
        return `${fallbackType.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    }

    const segments = trimmed.split(/[\\/]/);
    return segments[segments.length - 1] || `${fallbackType.toLowerCase().replace(/\s+/g, "-")}.pdf`;
}

function inferMimeType(filePath: string): string {
    const lower = String(filePath || "").toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".pdf")) return "application/pdf";
    return "application/octet-stream";
}

function parseDocumentPreview(documentType: string | null, documentRef: string | null): KycDocumentPreview[] {
    if (!documentRef) {
        return [];
    }

    const fallbackType = documentType || "Document";
    try {
        const parsed = JSON.parse(documentRef);
        const documents = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.documents)
                ? parsed.documents
                : parsed?.documents
                    ? [parsed.documents]
                    : parsed
                        ? [parsed]
                        : [];

        return documents.map((document: any, index: number) => {
            const filePath = String(document.filePath || document.path || document.url || documentRef);
            const type = String(document.type || document.documentType || fallbackType);
            return {
                id: String(document.id || `${fallbackType}-${index + 1}`),
                type,
                filePath,
                fileName: inferFileName(filePath, type),
                mimeType: inferMimeType(filePath),
                isValid: typeof document.isValid === "boolean" ? document.isValid : null,
                validationRemark: document.validationRemark || document.note || null,
            };
        });
    } catch {
        const filePath = documentRef;
        return [
            {
                id: "primary-document",
                type: fallbackType,
                filePath,
                fileName: inferFileName(filePath, fallbackType),
                mimeType: inferMimeType(filePath),
                isValid: null,
                validationRemark: null,
            },
        ];
    }
}

function parseKycProfile(documentRef: string | null): KycProfile {
    if (!documentRef) {
        return {};
    }

    try {
        const parsed = JSON.parse(documentRef);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return (parsed.profile || {}) as KycProfile;
        }
    } catch {
        return {};
    }

    return {};
}

function serializeDocumentPreview(documents: KycDocumentPreview[]): string {
    if (!documents.length) {
        return "";
    }

    return JSON.stringify(documents.map((document) => ({
        id: document.id,
        type: document.type,
        filePath: document.filePath,
        fileName: document.fileName,
        mimeType: document.mimeType,
        isValid: document.isValid,
        validationRemark: document.validationRemark,
    })));
}

function deriveRiskLevel(request: KycRequest): { score: number; level: "Low" | "Medium" | "High"; factors: string[] } {
    const factors: string[] = [];
    let score = 25;
    const profile = parseKycProfile(request.documentRef);

    if (!request.documentType) {
        score += 20;
        factors.push("Missing document type");
    }

    if (!request.documentRef) {
        score += 30;
        factors.push("No document attachment");
    }

    if (!request.user?.address) {
        score += 10;
        factors.push("No address on profile");
    }

    if (!request.user?.nationalId) {
        score += 10;
        factors.push("No national ID recorded");
    }

    if (!profile.country) {
        score += 8;
        factors.push("No country provided");
    }

    if (!profile.transactionIntent) {
        score += 8;
        factors.push("No transaction intent provided");
    }

    if (request.status === KycStatus.REJECTED) {
        score += 20;
        factors.push("Previously rejected");
    }

    const normalizedRemarks = String(request.remarks || "").toLowerCase();
    if (normalizedRemarks.includes("mismatch") || normalizedRemarks.includes("fraud") || normalizedRemarks.includes("blurry")) {
        score += 15;
        factors.push("Review remarks indicate data issues");
    }

    score = Math.max(5, Math.min(95, score));

    const level = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
    return { score, level, factors };
}

function buildKycTimeline(request: KycRequest): Array<{
    label: string;
    at: Date | string;
    status: string;
    comment?: string;
}> {
    const documents = parseDocumentPreview(request.documentType, request.documentRef);
    const timeline: Array<{
        label: string;
        at: Date | string;
        status: string;
        comment?: string;
    }> = [
        {
            label: "Submitted",
            at: request.createdAt,
            status: String(KycStatus.PENDING),
            comment: request.documentType ? `Submitted ${request.documentType}` : "KYC request submitted",
        },
    ];

    if (documents.length > 0) {
        timeline.push({
            label: "Documents Uploaded",
            at: request.createdAt,
            status: "Document Review",
            comment: `${documents.length} document${documents.length === 1 ? "" : "s"} attached`,
        });
    }

    if (request.verifiedAt) {
        timeline.push({
            label: request.status === KycStatus.REJECTED ? "Rejected" : "Approved",
            at: request.verifiedAt,
            status: String(request.status),
            comment: request.remarks || "Reviewed by admin",
        });
    }

    return timeline;
}

function enrichKycRequest(request: KycRequest) {
    const profile = parseKycProfile(request.documentRef);
    const risk = deriveRiskLevel(request);
    const documents = parseDocumentPreview(request.documentType, request.documentRef);

    return {
        ...request,
        ...profile,
        profile,
        user: request.user
            ? {
                ...request.user,
                fullName: request.user.name,
            }
            : request.user,
        fullName: request.user?.name || "",
        dob: profile.dob || null,
        country: profile.country || null,
        transactionIntent: profile.transactionIntent || null,
        submittedDate: request.createdAt,
        riskLevel: risk.level,
        riskScore: risk.score,
        riskFactors: risk.factors,
        documents,
        timeline: buildKycTimeline(request),
    };
}

async function sendKycDecisionNotice(request: KycRequest): Promise<void> {
    if (!request.user?.email) {
        return;
    }

    await sendKycDecisionEmail(request.user.email, {
        userName: request.user.name || request.user.email,
        status: request.status === KycStatus.REJECTED ? "Rejected" : "Approved",
        remarks: request.remarks,
        riskLevel: deriveRiskLevel(request).level,
    });
}

async function getAdminDashboardStats() {
    const dataSource = getDataSource();
    const userRepository = dataSource.getRepository(User);
    const employeeRepository = dataSource.getRepository(Employee);
    const accountRepository = dataSource.getRepository(Account);
    const transactionRepository = dataSource.getRepository(Transaction);
    const loanRepository = dataSource.getRepository(Loan);
    const kycRepository = dataSource.getRepository(KycRequest);

    const [totalCustomers, totalEmployees, totalAccounts, totalTransactions, pendingLoans, balanceResult, recentTransactions, summaryRows, kycCounts, totalKyc] = await Promise.all([
        userRepository.count({ where: { role: CUSTOMER_ROLE } }),
        employeeRepository.count({ where: { isActive: true } }),
        accountRepository.count(),
        transactionRepository.count(),
        loanRepository.count({ where: { status: LoanStatus.PENDING } }),
        accountRepository
            .createQueryBuilder("account")
            .select("COALESCE(SUM(account.balance), 0)", "totalBankBalance")
            .getRawOne(),
        transactionRepository.find({
            relations: { account: true },
            order: { createdAt: "DESC" },
            take: 5,
        }),
        transactionRepository
            .createQueryBuilder("transaction")
            .select("transaction.type", "type")
            .addSelect("COUNT(transaction.id)", "count")
            .addSelect("COALESCE(SUM(transaction.amount), 0)", "amount")
            .groupBy("transaction.type")
            .getRawMany(),
        kycRepository
            .createQueryBuilder("kyc")
            .select("kyc.status", "status")
            .addSelect("COUNT(kyc.id)", "count")
            .groupBy("kyc.status")
            .getRawMany(),
        kycRepository.count(),
    ]);

    const kycStatusSummary = kycCounts.reduce<Record<string, number>>((acc, row) => {
        acc[String(row.status || "Unknown")] = Number(row.count || 0);
        return acc;
    }, {});
    const pendingKyc = kycStatusSummary[KycStatus.PENDING] || 0;
    const approvedKyc = kycStatusSummary[KycStatus.VERIFIED] || 0;
    const rejectedKyc = kycStatusSummary[KycStatus.REJECTED] || 0;

    return {
        totalCustomers,
        totalEmployees,
        totalAccounts,
        totalTransactions,
        pendingLoans,
        totalBankBalance: Number(balanceResult?.totalBankBalance || 0),
        totalKyc,
        pendingKyc,
        approvedKyc,
        rejectedKyc,
        kycStatusSummary,
        kycApprovalRate: totalKyc > 0 ? Number(((approvedKyc / totalKyc) * 100).toFixed(2)) : 0,
        recentTransactions: recentTransactions.map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            balanceAfter: tx.balanceAfter,
            referenceNumber: tx.referenceNumber,
            createdAt: tx.createdAt,
            accountNumber: tx.account?.accountNumber || 'N/A',
        })),
        transactionSummary: summaryRows.map((row) => ({
            type: row.type,
            count: Number(row.count || 0),
            amount: Number(row.amount || 0),
        })),
    };
}

async function applyKycDecision(req: AuthRequest, res: Response, decision: "Approved" | "Rejected"): Promise<Response | void> {
    const parsed = kycVerifySchema.safeParse({
        status: decision === "Approved" ? "Verified" : "Rejected",
        remarks: req.body?.remarks,
    });

    if (!parsed.success) {
        return sendValidationError(res, "Invalid KYC verification payload");
    }

    try {
        const dataSource = getDataSource();
        const kycRepository = dataSource.getRepository(KycRequest);
        const userRepository = dataSource.getRepository(User);
        const accountRepository = dataSource.getRepository(Account);

        const request = await kycRepository.findOne({
            where: { id: Number(req.params.id) },
            relations: { user: true },
        });

        if (!request) {
            return res.status(404).json({ error: "KYC request not found" });
        }

        request.status = decision === "Approved" ? KycStatus.VERIFIED : KycStatus.REJECTED;
        request.remarks = parsed.data.remarks || null;
        request.verifiedByEmployeeId = getAdminActorId(req);
        request.verifiedAt = new Date();

        await kycRepository.save(request);

        if (request.userId) {
            const user = await userRepository.findOne({ where: { id: request.userId }, relations: { accounts: true } });
            if (user) {
                user.status = decision === "Approved" ? "Active" : "Frozen";
                await userRepository.save(user);

                if (decision === "Rejected") {
                    const accounts = Array.isArray(user.accounts) ? user.accounts : [];
                    for (const account of accounts) {
                        account.isActive = false;
                        await accountRepository.save(account);
                    }
                }
            }
        }

        await logAdminAction(
            req,
            decision === "Approved" ? "APPROVE_KYC" : "REJECT_KYC",
            `KYC ${request.id} ${decision.toLowerCase()}`
        );

        try {
            await sendKycDecisionNotice(request);
        } catch (emailError) {
            console.error("KYC notification email failed:", emailError);
        }

        const notification = buildNotification({
            title: `KYC ${decision}`,
            message: decision === "Approved"
                ? "Your KYC submission has been approved."
                : "Your KYC submission has been rejected. Please review the remarks and resubmit if needed.",
            type: decision === "Approved" ? "System" : "Warning",
        });
        publishNotification(notification, { role: "Customer", userId: request.userId });
        publishNotification(buildNotification({
            title: "KYC Decision Recorded",
            message: `Admin marked KYC ${request.id} as ${decision.toLowerCase()}.`,
            type: "System",
        }), { role: "Admin" });

        return res.json({
            success: true,
            message: `KYC ${decision.toLowerCase()} successfully`,
            data: enrichKycRequest(request),
        });
    } catch (error) {
        console.error("KYC decision error:", error);
        return res.status(500).json({ error: "Failed to update KYC request" });
    }
}

router.get("/session", (req, res) => {
    const request = req as AuthRequest;
    res.json({ message: "Admin session valid", user: request.user });
});

router.get("/dashboard-stats", async (_req, res) => {
    try {
        const data = await getAdminDashboardStats();
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Admin dashboard stats error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard statistics" });
    }
});

router.get("/stats", async (_req, res) => {
    try {
        const data = await getAdminDashboardStats();
        res.json({ success: true, data });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ success: false, message: "Failed to load admin stats" });
    }
});

router.post("/invite-employee", requireSuperAdmin, async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return sendValidationError(res, "Valid email is required");
    }

    try {
        const dataSource = getDataSource();
        const inviteRepository = dataSource.getRepository(EmployeeInvite);
        const userRepository = dataSource.getRepository(User);

        const emailLower = email.toLowerCase();
        const existingInvite = await inviteRepository.findOne({ where: { email: emailLower, status: "Pending" } });
        if (existingInvite) {
            return res.status(409).json({ success: false, message: "A pending invite already exists for this email" });
        }

        const existingUser = await userRepository.findOne({ where: { email: emailLower } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "A user with this email already exists" });
        }

        const invite = inviteRepository.create({
            email: emailLower,
            name: 'Employee',
            department: 'General',
            position: 'Employee',
            salary: 0,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            notes: `Invited to join as Employee on ${new Date().toISOString()}`,
            status: "Pending",
            createdByAdminId: getAdminActorId(req),
        });

        const savedInvite = await inviteRepository.save(invite);
        const inviteToken = generateInviteToken({
            inviteId: savedInvite.id,
            email: emailLower,
        });
        const inviteUrl = buildInviteUrl(inviteToken);

        const emailSent = await sendEmployeeInviteEmail(emailLower, {
            role: "Employee",
            expiresAt: savedInvite.expiresAt ? savedInvite.expiresAt.toISOString() : undefined,
            inviteUrl,
        });
        await logAdminAction(req, "INVITE_EMPLOYEE", `Employee invite sent to ${emailLower}`);

        res.status(201).json({
            success: true,
            data: savedInvite,
            emailSent,
            message: emailSent
                ? "Employee invitation sent successfully"
                : "Employee invite created, but email could not be sent. Check SMTP configuration.",
        });
    } catch (error) {
        console.error("Invite employee error:", error);
        res.status(500).json({ success: false, message: "Failed to send employee invite" });
    }
});

router.post("/invites/:id/resend", requireSuperAdmin, async (req, res) => {
    try {
        const inviteRepository = getDataSource().getRepository(EmployeeInvite);
        const invite = await inviteRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!invite) {
            return res.status(404).json({ success: false, message: "Invite not found" });
        }

        if (String(invite.status).toLowerCase() !== "pending") {
            return res.status(400).json({ success: false, message: "Only pending invites can be resent" });
        }

        if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
            invite.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await inviteRepository.save(invite);
        }

        const inviteToken = generateInviteToken({
            inviteId: invite.id,
            email: invite.email,
        });

        const emailSent = await sendEmployeeInviteEmail(invite.email, {
            recipientName: invite.name,
            role: invite.position || "Employee",
            expiresAt: invite.expiresAt ? invite.expiresAt.toISOString() : undefined,
            inviteUrl: buildInviteUrl(inviteToken),
        });

        await logAdminAction(req, "RESEND_EMPLOYEE_INVITE", `Employee invite resent to ${invite.email}`);

        return res.json({
            success: true,
            emailSent,
            data: invite,
            message: emailSent
                ? "Invite email resent successfully"
                : "Invite exists, but email could not be sent. Check SMTP configuration.",
        });
    } catch (error) {
        console.error("Resend invite error:", error);
        return res.status(500).json({ success: false, message: "Failed to resend invite" });
    }
});

router.get("/smtp-diagnostics", requireSuperAdmin, async (_req, res) => {
    try {
        const diagnostics = await getEmailDiagnostics();
        res.json({ success: true, data: diagnostics });
    } catch (error) {
        console.error("SMTP diagnostics error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch SMTP diagnostics" });
    }
});

router.get("/invites", requireSuperAdmin, async (_req, res) => {
    try {
        const invites = await getDataSource().getRepository(EmployeeInvite).find({
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: invites });
    } catch (error) {
        console.error("Get invites error:", error);
        res.status(500).json({ success: false, message: "Failed to load invites" });
    }
});

router.delete("/invites/:id", requireSuperAdmin, async (req, res) => {
    try {
        const inviteRepository = getDataSource().getRepository(EmployeeInvite);
        const invite = await inviteRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!invite) {
            return res.status(404).json({ success: false, message: "Invite not found" });
        }

        await inviteRepository.remove(invite);
        await logAdminAction(req, "DELETE_EMPLOYEE_INVITE", `Invite for ${invite.email} deleted`);

        res.json({ success: true, data: invite, message: "Invite deleted successfully" });
    } catch (error) {
        console.error("Delete invite error:", error);
        res.status(500).json({ success: false, message: "Failed to delete invite" });
    }
});

router.get("/employees", async (_req, res) => {
    try {
        const rows = await getDataSource()
            .createQueryBuilder(Employee, "employee")
            .leftJoin("employee.user", "user")
            .select([
                "employee.id",
                "employee.userId",
                "employee.employeeId",
                "employee.department",
                "employee.position",
                "employee.salary",
                "employee.hireDate",
                "employee.isActive",
                "employee.createdAt",
                "employee.updatedAt",
                "user.id",
                "user.name",
                "user.email",
                "user.phone",
                "user.address",
                "user.status",
            ])
            .orderBy("employee.createdAt", "DESC")
            .getRawMany();

        const employees = rows.map((row) => ({
            id: Number(row.employee_id),
            userId: Number(row.employee_userId),
            employeeId: row.employee_employeeId,
            department: row.employee_department,
            position: row.employee_position,
            salary: Number(row.employee_salary || 0),
            hireDate: row.employee_hireDate,
            isActive: Boolean(row.employee_isActive),
            createdAt: row.employee_createdAt,
            updatedAt: row.employee_updatedAt,
            name: row.user_name,
            email: row.user_email,
            phone: row.user_phone,
            address: row.user_address,
            status: row.user_status,
            user: {
                id: Number(row.user_id),
                name: row.user_name,
                email: row.user_email,
                phone: row.user_phone,
                address: row.user_address,
                status: row.user_status,
            },
        }));

        res.json({ success: true, data: employees });
    } catch (error) {
        console.error("Get employees error:", error);
        res.status(500).json({ success: false, message: "Failed to load employees" });
    }
});

router.patch("/employees/:id/status", requireSuperAdmin, async (req, res) => {
    const { status } = req.body;
    const normalizedStatus = String(status || '').toUpperCase();
    const isActive = normalizedStatus === 'ACTIVE';

    try {
        const employeeRepository = getDataSource().getRepository(Employee);
        const employee = await employeeRepository
            .createQueryBuilder("employee")
            .leftJoin("employee.user", "user")
            .select([
                "employee.id",
                "employee.userId",
                "employee.employeeId",
                "employee.department",
                "employee.position",
                "employee.salary",
                "employee.hireDate",
                "employee.isActive",
                "employee.createdAt",
                "employee.updatedAt",
                "user.id",
                "user.name",
                "user.email",
                "user.phone",
                "user.address",
                "user.status",
            ])
            .where("employee.id = :id", { id: Number(req.params.id) })
            .getOne();

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        employee.isActive = isActive;
        const updated = await employeeRepository.save(employee);

        await logAdminAction(
            req,
            "UPDATE_EMPLOYEE_STATUS",
            `Employee ${employee.id} status changed to ${normalizedStatus}`
        );

        res.json({ success: true, data: updated, message: "Employee status updated successfully" });
    } catch (error) {
        console.error("Update employee status error:", error);
        res.status(500).json({ success: false, message: "Failed to update employee status" });
    }
});

router.get("/customers", async (_req, res) => {
    try {
        const customers = await getDataSource().getRepository(User).find({
            where: { role: CUSTOMER_ROLE },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error("Get customers error:", error);
        res.status(500).json({ success: false, message: "Failed to load customers" });
    }
});

router.get("/customers/search", async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();

        if (!q) {
            return res.json({ success: true, data: [] });
        }

        const customerRepository = getDataSource().getRepository(User);
        const where: FindOptionsWhere<User>[] = [
            { role: CUSTOMER_ROLE, name: ILike(`%${q}%`) as unknown as string },
            { role: CUSTOMER_ROLE, email: ILike(`%${q}%`) as unknown as string },
            { role: CUSTOMER_ROLE, phone: ILike(`%${q}%`) as unknown as string },
            { role: CUSTOMER_ROLE, nationalId: ILike(`%${q}%`) as unknown as string },
        ];

        const customers = await customerRepository.find({
            where,
            order: { createdAt: "DESC" },
            take: 50,
        });

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error("Search customers error:", error);
        res.status(500).json({ success: false, message: "Failed to search customers" });
    }
});

router.patch("/customers/:id/status", async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return sendValidationError(res, "Status is required");
    }

    try {
        const userRepository = getDataSource().getRepository(User);
        const customer = await userRepository.findOne({
            where: { id: Number(req.params.id), role: CUSTOMER_ROLE },
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        customer.status = status;
        const updated = await userRepository.save(customer);

        await logAdminAction(req, "UPDATE_CUSTOMER_STATUS", `Customer ${customer.id} status changed to ${customer.status}`);

        res.json({ success: true, data: updated, message: "Customer status updated successfully" });
    } catch (error) {
        console.error("Update customer status error:", error);
        res.status(500).json({ success: false, message: "Failed to update customer status" });
    }
});

router.delete("/customers/:id", async (req, res) => {
    try {
        const userRepository = getDataSource().getRepository(User);
        const customer = await userRepository.findOne({
            where: { id: Number(req.params.id), role: CUSTOMER_ROLE },
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        await userRepository.remove(customer);
        await logAdminAction(req, "DELETE_CUSTOMER", `Customer ${customer.id} deleted`);

        res.json({ success: true, data: customer, message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Delete customer error:", error);
        res.status(500).json({ success: false, message: "Failed to delete customer" });
    }
});

router.get("/accounts", async (_req, res) => {
    try {
        const accounts = await getDataSource().getRepository(Account).find({
            relations: { user: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: accounts });
    } catch (error) {
        console.error("Get accounts error:", error);
        res.status(500).json({ success: false, message: "Failed to load accounts" });
    }
});

router.patch("/accounts/:id/status", async (req, res) => {
    const { status } = req.body;
    const statusMap: Record<string, boolean> = { ACTIVE: true, INACTIVE: false, FROZEN: false, CLOSED: false };
    const normalizedStatus = String(status || '').toUpperCase();
    const isActive = statusMap[normalizedStatus];

    if (typeof isActive === 'undefined') {
        return sendValidationError(res, "Invalid status. Must be ACTIVE, INACTIVE, FROZEN, or CLOSED");
    }

    try {
        const accountRepository = getDataSource().getRepository(Account);
        const account = await accountRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        account.isActive = isActive;
        const updated = await accountRepository.save(account);

        await logAdminAction(
            req,
            "UPDATE_ACCOUNT_STATUS",
            `Account ${account.id} status changed to ${normalizedStatus}`
        );

        res.json({ success: true, data: updated, message: "Account status updated successfully" });
    } catch (error) {
        console.error("Update account status error:", error);
        res.status(500).json({ success: false, message: "Failed to update account status" });
    }
});

router.get("/transactions", async (_req, res) => {
    try {
        const transactions = await getDataSource().getRepository(Transaction).find({
            relations: { account: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({ success: false, message: "Failed to load transactions" });
    }
});

router.patch("/transactions/:id/flag", async (req, res) => {
    const { flagged, reason } = req.body;

    try {
        const transactionRepository = getDataSource().getRepository(Transaction);
        const transaction = await transactionRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        transaction.isFlagged = Boolean(flagged);
        transaction.flagReason = flagged ? (reason || "Manually flagged by admin") : null;
        transaction.status = flagged ? TransactionStatus.SUSPICIOUS : TransactionStatus.APPROVED;
        transaction.reviewedByEmployeeId = getAdminActorId(req);
        transaction.reviewedAt = new Date();

        const updated = await transactionRepository.save(transaction);

        await logAdminAction(
            req,
            "FLAG_TRANSACTION",
            `Transaction ${transaction.id} flagged=${transaction.isFlagged}`
        );

        res.json({ success: true, data: updated, message: "Transaction flag updated successfully" });
    } catch (error) {
        console.error("Flag transaction error:", error);
        res.status(500).json({ success: false, message: "Failed to update transaction flag" });
    }
});

router.post("/transactions/:id/reverse", async (req, res) => {
    const { reason } = req.body || {};

    if (!reason || typeof reason !== "string" || !reason.trim()) {
        return res.status(400).json({ success: false, message: "Reason is required" });
    }

    const parsed = reverseTransactionSchema.safeParse({ reason });

    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Reason must be between 3 and 255 characters" });
    }

    try {
        const dataSource = getDataSource();
        const actorId = getAdminActorId(req);

        const result = await dataSource.transaction(async (manager) => {
            const transactionRepository = manager.getRepository(Transaction);
            const accountRepository = manager.getRepository(Account);

            const originalTransaction = await transactionRepository.findOne({
                where: { id: Number(req.params.id) },
            });

            if (!originalTransaction) {
                throw new Error("TRANSACTION_NOT_FOUND");
            }

            if ((originalTransaction.description || "").includes("Reversal for transaction")) {
                throw new Error("TRANSACTION_ALREADY_REVERSED");
            }

            const account = await accountRepository.findOne({
                where: { id: originalTransaction.accountId },
            });

            if (!account) {
                throw new Error("ACCOUNT_NOT_FOUND");
            }

            let adjustment = 0;
            let reverseType = TransactionType.DEPOSIT;

            if ([TransactionType.DEPOSIT, TransactionType.TRANSFER_IN, TransactionType.LOAN_DISBURSEMENT].includes(originalTransaction.type)) {
                adjustment = -Number(originalTransaction.amount);
                reverseType = TransactionType.WITHDRAW;
            } else {
                adjustment = Number(originalTransaction.amount);
                reverseType = TransactionType.DEPOSIT;
            }

            const nextBalance = Number(account.balance) + adjustment;
            if (nextBalance < 0) {
                throw new Error("INSUFFICIENT_BALANCE_FOR_REVERSAL");
            }

            account.balance = nextBalance;
            await accountRepository.save(account);

            const reversal = transactionRepository.create({
                accountId: account.id,
                type: reverseType,
                amount: Number(originalTransaction.amount),
                balanceAfter: nextBalance,
                description: `Reversal for transaction ${originalTransaction.referenceNumber}: ${parsed.data.reason}`,
                referenceNumber: `REV-${originalTransaction.referenceNumber}-${Date.now()}`,
                status: TransactionStatus.APPROVED,
                isFlagged: false,
                flagReason: null,
                reviewedByEmployeeId: actorId,
                reviewedAt: new Date(),
                createdByEmployeeId: actorId,
            });

            const savedReversal = await transactionRepository.save(reversal);

            originalTransaction.isFlagged = true;
            originalTransaction.flagReason = `Reversed by admin: ${parsed.data.reason}`;
            originalTransaction.reviewedByEmployeeId = actorId;
            originalTransaction.reviewedAt = new Date();
            await transactionRepository.save(originalTransaction);

            return { originalTransaction, reversal: savedReversal, account };
        });

        await logAdminAction(
            req,
            "REVERSE_TRANSACTION",
            `Transaction ${req.params.id} reversed with reversal transaction ${result.reversal.id}`
        );

        res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "TRANSACTION_NOT_FOUND") {
                return res.status(404).json({ success: false, message: "Transaction not found" });
            }

            if (error.message === "ACCOUNT_NOT_FOUND") {
                return res.status(404).json({ success: false, message: "Account not found" });
            }

            if (error.message === "TRANSACTION_ALREADY_REVERSED") {
                return res.status(409).json({ success: false, message: "Transaction already reversed" });
            }

            if (error.message === "INSUFFICIENT_BALANCE_FOR_REVERSAL") {
                return res.status(400).json({ success: false, message: "Insufficient account balance to reverse this transaction" });
            }
        }

        console.log("Reverse error:", error);
        res.status(500).json({ success: false, message: "Failed to reverse transaction" });
    }
});

router.get("/loans", async (_req, res) => {
    try {
        const loans = await getDataSource().getRepository(Loan).find({
            relations: { user: true, account: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: loans });
    } catch (error) {
        console.error("Get loans error:", error);
        res.status(500).json({ success: false, message: "Failed to load loans" });
    }
});

router.put("/loans/:id/approve", async (req, res) => {
    const { remarks } = req.body || {};

    if (!remarks || typeof remarks !== "string" || !remarks.trim()) {
        return res.status(400).json({ success: false, message: "Remarks is required" });
    }

    try {
        const dataSource = getDataSource();
        const actorId = getAdminActorId(req);

        const result = await dataSource.transaction(async (manager) => {
            const loanRepository = manager.getRepository(Loan);
            const accountRepository = manager.getRepository(Account);
            const transactionRepository = manager.getRepository(Transaction);

            const loan = await loanRepository.findOne({ where: { id: Number(req.params.id) } });

            if (!loan) {
                throw new Error("LOAN_NOT_FOUND");
            }

            if (loan.status !== LoanStatus.UNDER_REVIEW_ADMIN) {
                throw new Error("LOAN_NOT_READY_FOR_ADMIN_APPROVAL");
            }

            const account = await accountRepository.findOne({ where: { id: loan.accountId } });
            if (!account) {
                throw new Error("ACCOUNT_NOT_FOUND");
            }

            const nextBalance = Number(account.balance) + Number(loan.amount);
            account.balance = nextBalance;
            await accountRepository.save(account);

            loan.status = LoanStatus.APPROVED;
            loan.remarks = remarks.trim();
            loan.reviewedByEmployeeId = actorId;
            loan.reviewedAt = new Date();
            loan.startDate = new Date();
            await loanRepository.save(loan);

            const disbursement = transactionRepository.create({
                accountId: account.id,
                type: TransactionType.LOAN_DISBURSEMENT,
                amount: Number(loan.amount),
                balanceAfter: nextBalance,
                description: `Loan approved and disbursed: ${loan.loanNumber}`,
                referenceNumber: `LOAN-${loan.loanNumber}-${Date.now()}`,
                status: TransactionStatus.APPROVED,
                isFlagged: false,
                flagReason: null,
                reviewedByEmployeeId: actorId,
                reviewedAt: new Date(),
                createdByEmployeeId: actorId,
            });

            const savedDisbursement = await transactionRepository.save(disbursement);

            return { loan, account, disbursement: savedDisbursement };
        });

        await logAdminAction(req, "APPROVE_LOAN", `Loan ${req.params.id} approved`);

        res.json({ success: true, data: result, message: "Loan approved successfully" });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "LOAN_NOT_FOUND") {
                return res.status(404).json({ success: false, message: "Loan not found" });
            }

            if (error.message === "LOAN_NOT_PENDING") {
                return res.status(400).json({ success: false, message: "Only pending loans can be approved" });
            }

            if (error.message === "LOAN_NOT_READY_FOR_ADMIN_APPROVAL") {
                return res.status(400).json({ success: false, message: "Loan must be employee-reviewed before admin approval" });
            }

            if (error.message === "ACCOUNT_NOT_FOUND") {
                return res.status(404).json({ success: false, message: "Linked account not found" });
            }
        }

        console.error("Approve loan error:", error);
        res.status(500).json({ success: false, message: "Failed to approve loan" });
    }
});

router.put("/loans/:id/reject", async (req, res) => {
    const { remarks } = req.body || {};

    try {
        const loanRepository = getDataSource().getRepository(Loan);
        const loan = await loanRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        if (loan.status !== LoanStatus.UNDER_REVIEW_ADMIN) {
            return res.status(400).json({ success: false, message: "Loan must be employee-reviewed before admin decision" });
        }

        loan.status = LoanStatus.REJECTED;
        loan.remarks = typeof remarks === "string" && remarks.trim() ? remarks.trim() : (loan.remarks || null);
        loan.reviewedByEmployeeId = getAdminActorId(req);
        loan.reviewedAt = new Date();

        const updated = await loanRepository.save(loan);
        await logAdminAction(req, "REJECT_LOAN", `Loan ${loan.id} rejected`);

        res.json({ success: true, data: updated, message: "Loan rejected successfully" });
    } catch (error) {
        console.error("Reject loan error:", error);
        res.status(500).json({ success: false, message: "Failed to reject loan" });
    }
});

router.get("/kyc", async (req, res) => {
    try {
        const repository = getDataSource().getRepository(KycRequest);
        const status = String(req.query.status || "").trim();
        const search = String(req.query.search || req.query.q || "").trim().toLowerCase();
        const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit || "25"), 10) || 25));
        const dateFrom = parseDateInput(req.query.dateFrom);
        const dateTo = parseDateInput(req.query.dateTo);

        const qb = repository
            .createQueryBuilder("kyc")
            .leftJoinAndSelect("kyc.user", "user");

        if (status && status.toUpperCase() !== "ALL") {
            qb.andWhere("UPPER(kyc.status) = :status", { status: status.toUpperCase() });
        }

        if (search) {
            qb.andWhere(new Brackets((subQuery) => {
                subQuery
                    .where("LOWER(user.name) LIKE :search", { search: `%${search}%` })
                    .orWhere("LOWER(user.email) LIKE :search", { search: `%${search}%` })
                    .orWhere("LOWER(kyc.documentType) LIKE :search", { search: `%${search}%` })
                    .orWhere("LOWER(kyc.documentRef) LIKE :search", { search: `%${search}%` })
                    .orWhere("LOWER(kyc.remarks) LIKE :search", { search: `%${search}%` });
            }));
        }

        if (dateFrom) {
            qb.andWhere("kyc.createdAt >= :dateFrom", { dateFrom });
        }

        if (dateTo) {
            qb.andWhere("kyc.createdAt <= :dateTo", { dateTo });
        }

        const [items, total] = await qb
            .orderBy("kyc.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const [pending, approved, rejected] = await Promise.all([
            repository.count({ where: { status: KycStatus.PENDING } }),
            repository.count({ where: { status: KycStatus.VERIFIED } }),
            repository.count({ where: { status: KycStatus.REJECTED } }),
        ]);

        res.json({
            success: true,
            data: items.map(enrichKycRequest),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total,
                pending,
                approved,
                rejected,
                approvalRate: total > 0 ? Number(((approved / total) * 100).toFixed(2)) : 0,
            },
        });
    } catch (error) {
        console.error("Get KYC error:", error);
        res.status(500).json({ success: false, message: "Failed to load KYC requests" });
    }
});

router.get("/kyc/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const repository = getDataSource().getRepository(KycRequest);
        const request = await repository.findOne({
            where: { id },
            relations: { user: true },
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "KYC request not found" });
        }

        const logs = await getDataSource().getRepository(ActivityLog)
            .createQueryBuilder("log")
            .where("LOWER(log.details) LIKE :needle", { needle: `%kyc ${id}%` })
            .orderBy("log.createdAt", "DESC")
            .take(20)
            .getMany();

        res.json({
            success: true,
            data: {
                ...enrichKycRequest(request),
                auditTrail: logs,
            },
        });
    } catch (error) {
        console.error("Get KYC details error:", error);
        res.status(500).json({ success: false, message: "Failed to load KYC details" });
    }
});

router.patch("/kyc/:id/documents/:documentId", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const documentId = String(req.params.documentId || "").trim();
        const isValid = typeof req.body?.isValid === "boolean" ? req.body.isValid : null;
        const validationRemark = String(req.body?.remarks || req.body?.validationRemark || "").trim() || null;

        const repository = getDataSource().getRepository(KycRequest);
        const request = await repository.findOne({
            where: { id },
            relations: { user: true },
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "KYC request not found" });
        }

        const documents = parseDocumentPreview(request.documentType, request.documentRef);
        const updatedDocuments = documents.map((document) => (
            document.id === documentId
                ? { ...document, isValid, validationRemark }
                : document
        ));

        request.documentRef = serializeDocumentPreview(updatedDocuments);
        await repository.save(request);

        await logAdminAction(
            req as AuthRequest,
            "VALIDATE_KYC_DOCUMENT",
            `KYC ${request.id} document ${documentId} marked ${isValid ? "valid" : "invalid"}`
        );

        return res.json({
            success: true,
            message: "Document validation updated successfully",
            data: enrichKycRequest(request),
        });
    } catch (error) {
        console.error("Validate KYC document error:", error);
        return res.status(500).json({ success: false, message: "Failed to validate document" });
    }
});

router.post("/kyc/:id/approve", async (req, res) => applyKycDecision(req as AuthRequest, res, "Approved"));

router.post("/kyc/:id/reject", async (req, res) => applyKycDecision(req as AuthRequest, res, "Rejected"));

router.put("/kyc/:id/verify", async (req, res) => {
    const status = String(req.body?.status || "Verified").trim().toLowerCase();
    return status === "rejected"
        ? applyKycDecision(req as AuthRequest, res, "Rejected")
        : applyKycDecision(req as AuthRequest, res, "Approved");
});

router.get("/fraud-alerts", async (_req, res) => {
    try {
        const suspiciousTransactions = await getDataSource().getRepository(Transaction).find({
            where: [
                { isFlagged: true },
                { status: TransactionStatus.SUSPICIOUS },
            ],
            relations: { account: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: suspiciousTransactions });
    } catch (error) {
        console.error("Get fraud alerts error:", error);
        res.status(500).json({ success: false, message: "Failed to load fraud alerts" });
    }
});

router.get("/reports", async (_req, res) => {
    try {
        const dataSource = getDataSource();
        const accountRepository = dataSource.getRepository(Account);
        const loanRepository = dataSource.getRepository(Loan);
        const transactionRepository = dataSource.getRepository(Transaction);
        const ticketRepository = dataSource.getRepository(Ticket);

        const [balanceSummary, accountTypeSummary, loanStatusSummary, transactionTypeSummary, openTickets] = await Promise.all([
            accountRepository
                .createQueryBuilder("account")
                .select("COUNT(account.id)", "totalAccounts")
                .addSelect("COALESCE(SUM(account.balance), 0)", "totalBalance")
                .addSelect("COALESCE(AVG(account.balance), 0)", "averageBalance")
                .getRawOne(),
            accountRepository
                .createQueryBuilder("account")
                .select("account.type", "type")
                .addSelect("COUNT(account.id)", "count")
                .addSelect("COALESCE(SUM(account.balance), 0)", "balance")
                .groupBy("account.type")
                .getRawMany(),
            loanRepository
                .createQueryBuilder("loan")
                .select("loan.status", "status")
                .addSelect("COUNT(loan.id)", "count")
                .addSelect("COALESCE(SUM(loan.amount), 0)", "amount")
                .groupBy("loan.status")
                .getRawMany(),
            transactionRepository
                .createQueryBuilder("transaction")
                .select("transaction.type", "type")
                .addSelect("COUNT(transaction.id)", "count")
                .addSelect("COALESCE(SUM(transaction.amount), 0)", "amount")
                .groupBy("transaction.type")
                .getRawMany(),
            ticketRepository.count({ where: { status: TicketStatus.OPEN } }),
        ]);

        res.json({
            success: true,
            data: {
                balanceSummary: {
                    totalAccounts: Number(balanceSummary?.totalAccounts || 0),
                    totalBalance: Number(balanceSummary?.totalBalance || 0),
                    averageBalance: Number(balanceSummary?.averageBalance || 0),
                },
                accountTypeSummary: accountTypeSummary.map((row) => ({
                    type: row.type,
                    count: Number(row.count || 0),
                    balance: Number(row.balance || 0),
                })),
                loanStatusSummary: loanStatusSummary.map((row) => ({
                    status: row.status,
                    count: Number(row.count || 0),
                    amount: Number(row.amount || 0),
                })),
                transactionTypeSummary: transactionTypeSummary.map((row) => ({
                    type: row.type,
                    count: Number(row.count || 0),
                    amount: Number(row.amount || 0),
                })),
                openTickets,
            },
        });
    } catch (error) {
        console.error("Get reports error:", error);
        res.status(500).json({ success: false, message: "Failed to load reports" });
    }
});

router.get("/settings", async (_req, res) => {
    try {
        const settings = await getDataSource().getRepository(AdminSetting).find({
            order: { settingKey: "ASC" },
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ success: false, message: "Failed to load settings" });
    }
});

router.put("/settings", requireSuperAdmin, async (req, res) => {
    const parsed = settingsSchema.safeParse(req.body);

    if (!parsed.success) {
        return sendValidationError(res, "Invalid settings payload");
    }

    try {
        const settingRepository = getDataSource().getRepository(AdminSetting);
        const actorId = getAdminActorId(req);
        const savedSettings: AdminSetting[] = [];

        for (const item of parsed.data.settings) {
            let setting = await settingRepository.findOne({ where: { settingKey: item.settingKey } });

            if (!setting) {
                setting = settingRepository.create({
                    settingKey: item.settingKey,
                });
            }

            setting.settingValue = item.settingValue === null ? null : String(item.settingValue);
            setting.description = item.description || setting.description || null;
            setting.updatedByAdminId = actorId;

            savedSettings.push(await settingRepository.save(setting));
        }

        await logAdminAction(req, "UPDATE_SETTINGS", `Updated ${savedSettings.length} admin settings`);

        res.json(savedSettings);
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ error: "Failed to update settings" });
    }
});

router.post("/create-admin", requireSuperAdmin, async (req, res) => {
    const parsed = createAdminSchema.safeParse(req.body);

    if (!parsed.success) {
        return sendValidationError(res, "Invalid create-admin payload");
    }

    try {
        const userRepository = getDataSource().getRepository(User);
        const email = parsed.data.email.trim().toLowerCase();

        const existing = await userRepository.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: "A user with this email already exists" });
        }

        const hashedPassword = await hashPassword(parsed.data.password);
        const admin = userRepository.create({
            name: parsed.data.name,
            email,
            phone: parsed.data.phone || null,
            nationalId: parsed.data.nationalId || null,
            department: parsed.data.department || null,
            officeLocation: parsed.data.officeLocation || null,
            password: hashedPassword,
            role: "Admin",
            status: "Active",
            adminId: generateAdminId(),
            accessLevel: parsed.data.accessLevel,
            permissions: JSON.stringify(parsed.data.permissions || []),
            createdBy: getAdminActorId(req),
        } as Partial<User>);

        const saved = await userRepository.save(admin);

        await logAdminAction(req, "CREATE_ADMIN", `Created admin account for ${saved.email}`);

        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data: {
                id: saved.id,
                name: saved.name,
                email: saved.email,
                role: saved.role,
                accessLevel: saved.accessLevel,
                adminId: saved.adminId,
            },
        });
    } catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ success: false, message: "Failed to create admin" });
    }
});

router.get("/logs", async (_req, res) => {
    try {
        const logs = await getDataSource().getRepository(ActivityLog).find({
            order: { createdAt: "DESC" },
            take: 200,
        });

        res.json({ success: true, data: logs });
    } catch (error) {
        console.error("Get logs error:", error);
        res.status(500).json({ success: false, message: "Failed to load logs" });
    }
});

export default router;
