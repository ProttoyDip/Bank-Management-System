import { Router } from "express";
import { z } from "zod";
import { UserController } from "../controllers/UserController";
import { validate } from "../middleware/validation";
import { userLoginSchema } from "../validators/userSchema";
import { getDataSource } from "../data-source";
import { EmployeeInvite } from "../entity/EmployeeInvite";
import { User } from "../entity/User";
import { Employee } from "../entity/Employee";
import { hashPassword } from "../utils/hashPassword";
import { generateEmployeeId } from "../utils/helpers";
import { verifyInviteToken } from "../utils/inviteToken";

const router = Router();

const completeInviteSchema = z.object({
	token: z.string().min(10),
	name: z.string().trim().min(2).max(100),
	password: z.string().min(8),
	phone: z.string().trim().max(20).optional(),
});

function getValidInviteOrNull(invite: EmployeeInvite | null, email: string): EmployeeInvite | null {
	if (!invite) {
		return null;
	}

	if (invite.email.toLowerCase() !== email.toLowerCase()) {
		return null;
	}

	if (String(invite.status).toLowerCase() !== "pending") {
		return null;
	}

	if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
		return null;
	}

	return invite;
}

async function generateUniqueEmployeeCode(): Promise<string> {
	const employeeRepository = getDataSource().getRepository(Employee);

	for (let attempt = 0; attempt < 10; attempt += 1) {
		const candidate = generateEmployeeId();
		const exists = await employeeRepository.findOne({ where: { employeeId: candidate } });
		if (!exists) {
			return candidate;
		}
	}

	throw new Error("Failed to generate unique employee ID");
}

router.post("/register", UserController.registerCustomer);
router.post("/login", validate(userLoginSchema), UserController.login);

router.get("/invite/verify", async (req, res) => {
	const token = String(req.query.token || "").trim();
	if (!token) {
		return res.status(400).json({ success: false, message: "Invite token is required" });
	}

	try {
		const payload = verifyInviteToken(token);
		const inviteRepository = getDataSource().getRepository(EmployeeInvite);
		const invite = await inviteRepository.findOne({ where: { id: payload.inviteId } });
		const validInvite = getValidInviteOrNull(invite, payload.email);

		if (!validInvite) {
			return res.status(400).json({ success: false, message: "Invite is invalid, expired, or already used" });
		}

		return res.json({
			success: true,
			data: {
				email: validInvite.email,
				name: validInvite.name,
				department: validInvite.department,
				position: validInvite.position,
				expiresAt: validInvite.expiresAt,
			},
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: "Invalid or expired invite token" });
	}
});

const completeInviteHandler = async (req: any, res: any) => {
	const parsed = completeInviteSchema.safeParse(req.body || {});
	if (!parsed.success) {
		return res.status(400).json({ success: false, message: "Invalid invite completion payload" });
	}

	try {
		const payload = verifyInviteToken(parsed.data.token);
		const dataSource = getDataSource();
		const inviteRepository = dataSource.getRepository(EmployeeInvite);
		const userRepository = dataSource.getRepository(User);
		const employeeRepository = dataSource.getRepository(Employee);

		const invite = await inviteRepository.findOne({ where: { id: payload.inviteId } });
		const validInvite = getValidInviteOrNull(invite, payload.email);
		if (!validInvite) {
			return res.status(400).json({ success: false, message: "Invite is invalid, expired, or already used" });
		}

		const existingUser = await userRepository.findOne({ where: { email: validInvite.email } });
		if (existingUser) {
			const existingRole = String(existingUser.role || "").toLowerCase();
			if (existingRole !== "employee") {
				return res.status(409).json({ success: false, message: "Email already used by another account" });
			}

			validInvite.status = "Accepted";
			validInvite.notes = (validInvite.notes || "")
				.concat(`${validInvite.notes ? " | " : ""}Invite reused by employee ${existingUser.id} on ${new Date().toISOString()}`)
				.slice(0, 255);
			await inviteRepository.save(validInvite);
			return res.status(200).json({
				success: true,
				message: "Employee account already exists. Please login.",
				data: {
					userId: existingUser.id,
					email: existingUser.email,
					alreadyRegistered: true,
				},
			});
		}

		const passwordHash = await hashPassword(parsed.data.password);
		const employeeCode = await generateUniqueEmployeeCode();

		const result = await dataSource.transaction(async (manager) => {
			const transactionalUserRepository = manager.getRepository(User);
			const transactionalEmployeeRepository = manager.getRepository(Employee);
			const transactionalInviteRepository = manager.getRepository(EmployeeInvite);

			const newUser = transactionalUserRepository.create({
				name: parsed.data.name,
				email: validInvite.email,
				password: passwordHash,
				role: "Employee",
				status: "Active",
				phone: parsed.data.phone || undefined,
			});

			const savedUser = await transactionalUserRepository.save(newUser);

			const newEmployee = transactionalEmployeeRepository.create({
				userId: savedUser.id,
				employeeId: employeeCode,
				department: validInvite.department,
				position: validInvite.position,
				salary: Number(validInvite.salary || 0),
				hireDate: new Date(),
				isActive: true,
			});

			const savedEmployee = await transactionalEmployeeRepository.save(newEmployee);

			validInvite.status = "Accepted";
			validInvite.notes = (validInvite.notes || "")
				.concat(`${validInvite.notes ? " | " : ""}Accepted by user ${savedUser.id} on ${new Date().toISOString()}`)
				.slice(0, 255);
			await transactionalInviteRepository.save(validInvite);

			return { savedUser, savedEmployee };
		});

		return res.status(201).json({
			success: true,
			message: "Invite completed successfully. You can now login.",
			data: {
				userId: result.savedUser.id,
				employeeId: result.savedEmployee.employeeId,
				email: result.savedUser.email,
			},
		});
	} catch (error) {
		if (error instanceof Error && error.message.toLowerCase().includes("token")) {
			return res.status(400).json({ success: false, message: "Invalid or expired invite token" });
		}

		console.error("Complete invite error:", error);
		return res.status(500).json({ success: false, message: "Failed to complete invite" });
	}
};

router.post("/invite/complete", completeInviteHandler);
router.post("/invite/accept", completeInviteHandler);

export default router;
