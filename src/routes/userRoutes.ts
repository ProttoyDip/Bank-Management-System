import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { UserController } from "../controllers/UserController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import { validate } from '../middleware/validation';
import { userLoginSchema, userCreateSchema } from '../validators/userSchema';
import { getDataSource } from "../data-source";
import { KycRequest, KycStatus } from "../entity/KycRequest";
import { AuthRequest } from "../middleware/auth";


const router = Router();

function resolveUploadsRoot(): string {
	const candidates = [
		path.resolve(process.cwd(), "uploads"),
		path.resolve(process.cwd(), "..", "uploads"),
		path.resolve(__dirname, "..", "..", "uploads"),
		path.resolve(__dirname, "..", "..", "..", "uploads"),
	];

	const existing = candidates.find((candidate) => fs.existsSync(candidate));
	const uploadsRoot = existing || candidates[0];
	if (!fs.existsSync(uploadsRoot)) {
		fs.mkdirSync(uploadsRoot, { recursive: true });
	}

	return uploadsRoot;
}

function sanitizeFileName(name: string): string {
	return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

const kycUploadsDir = path.resolve(resolveUploadsRoot(), "kyc");
if (!fs.existsSync(kycUploadsDir)) {
	fs.mkdirSync(kycUploadsDir, { recursive: true });
}

const kycUpload = multer({
	storage: multer.diskStorage({
		destination: (_req, _file, cb) => cb(null, kycUploadsDir),
		filename: (_req, file, cb) => {
			const ext = path.extname(file.originalname || "");
			const base = path.basename(file.originalname || "document", ext);
			const safeBase = sanitizeFileName(base).slice(0, 60) || "document";
			cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}${ext}`);
		},
	}),
	limits: {
		fileSize: 10 * 1024 * 1024,
		files: 10,
	},
});

// Auth routes (public)
router.post("/", UserController.registerCustomer);
router.post("/login", validate(userLoginSchema), UserController.login);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-code", UserController.verifyCode);
router.post("/change-password", UserController.changePasswordWithCode);

router.get("/me/kyc", authMiddleware, roleMiddleware(["Customer"]), async (req, res) => {
	try {
		const authReq = req as AuthRequest;
		const userId = authReq.user?.id;
		if (!userId) {
			return res.status(401).json({ success: false, message: "Authentication required" });
		}

		const kycRepository = getDataSource().getRepository(KycRequest);
		const requests = await kycRepository.find({
			where: { userId },
			order: { createdAt: "DESC" },
			take: 20,
		});

		return res.json({ success: true, data: requests });
	} catch (error) {
		console.error("Get customer KYC requests error:", error);
		return res.status(500).json({ success: false, message: "Failed to load KYC requests" });
	}
});

router.post("/me/kyc", authMiddleware, roleMiddleware(["Customer"]), kycUpload.array("documents", 10), async (req, res) => {
	try {
		const authReq = req as AuthRequest;
		const userId = authReq.user?.id;
		if (!userId) {
			return res.status(401).json({ success: false, message: "Authentication required" });
		}

		const documentType = String(req.body?.documentType || "").trim();
		const remarks = String(req.body?.remarks || "").trim();
		if (!documentType || documentType.length < 2 || documentType.length > 255) {
			return res.status(400).json({ success: false, message: "documentType is required" });
		}

		const uploadedFiles = (req.files as Express.Multer.File[] | undefined) || [];
		if (uploadedFiles.length === 0) {
			return res.status(400).json({ success: false, message: "At least one document file is required" });
		}

		const kycRepository = getDataSource().getRepository(KycRequest);

		const activeRequest = await kycRepository.findOne({
			where: [
				{ userId, status: KycStatus.PENDING },
				{ userId, status: KycStatus.UNDER_REVIEW_ADMIN },
			],
			order: { createdAt: "DESC" },
		});

		if (activeRequest) {
			return res.status(409).json({
				success: false,
				message: "You already have a KYC request under review",
				data: activeRequest,
			});
		}

		const latestRequest = await kycRepository.findOne({
			where: { userId },
			order: { createdAt: "DESC" },
		});

		if (latestRequest && String(latestRequest.status).toLowerCase() === KycStatus.VERIFIED.toLowerCase()) {
			return res.status(409).json({
				success: false,
				message: "Your KYC is already verified",
				data: latestRequest,
			});
		}

		const requestToSave = kycRepository.create({
			userId,
			status: KycStatus.PENDING,
			documentType,
			documentRef: JSON.stringify({
				documents: uploadedFiles.map((file, index) => ({
					id: `${Date.now()}-${index}`,
					type: documentType,
					filePath: `/uploads/kyc/${file.filename}`,
					fileName: file.originalname || file.filename,
				})),
			}),
			remarks: remarks || null,
			verifiedAt: null,
			verifiedByEmployeeId: null,
		});

		const saved = await kycRepository.save(requestToSave);

		return res.status(201).json({
			success: true,
			message: "KYC submitted successfully",
			data: saved,
		});
	} catch (error) {
		if (error instanceof multer.MulterError) {
			if (error.code === "LIMIT_FILE_SIZE") {
				return res.status(400).json({ success: false, message: "Each file must be 10MB or smaller" });
			}
			return res.status(400).json({ success: false, message: `Upload error: ${error.message}` });
		}

		console.error("Submit customer KYC error:", error);
		return res.status(500).json({ success: false, message: "Failed to submit KYC request" });
	}
});

// Staff creation (Admin only)
router.post("/staff", authMiddleware, roleMiddleware(['Admin']), validate(userCreateSchema), UserController.create);

// Protected CRUD (Admin/Employee for list)
router.get("/", authMiddleware, roleMiddleware(['Admin', 'Employee']), UserController.getAll);
router.get("/:id", authMiddleware, UserController.getById);
router.put("/:id", authMiddleware, UserController.update);
router.delete("/:id", authMiddleware, roleMiddleware(['Admin']), UserController.delete);

// Remove password routes - fix later if needed (methods missing)


export default router;

