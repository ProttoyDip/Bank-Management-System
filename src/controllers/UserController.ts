import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { User } from "../entity/User";
import { Employee } from "../entity/Employee";
import { Account } from "../entity/Account";
import { login as authLogin } from "../services/authService";
import { hashPassword } from "../utils/hashPassword";
import { generateEmployeeId, generateAccountNumber } from "../utils/helpers";
import { sendVerificationEmail } from "../utils/emailService";
import { AuthRequest } from "../middleware/auth";
import { userLoginSchema, userCreateSchema, customerRegisterSchema } from "../validators/userSchema";

const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const getFixedAdminEmail = (): string => String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export class UserController {
    // FORGOT PASSWORD - SEND VERIFICATION CODE
    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const email = String(req.body?.email || "").trim().toLowerCase();
            const role = String(req.body?.role || "").trim().toLowerCase();
            const fixedAdminEmail = getFixedAdminEmail();

            if (!email) {
                res.status(400).json({ error: "Email is required" });
                return;
            }
            if (fixedAdminEmail && email === fixedAdminEmail) {
                res.status(403).json({ error: "Password reset is disabled for fixed admin" });
                return;
            }

            const userRepo = getDataSource().getRepository(User);
            const user = await userRepo.findOne({ where: { email } });

            if (!user) {
                res.status(404).json({ error: "No account found with this email" });
                return;
            }

            if (role && user.role?.toLowerCase() !== role) {
                res.status(400).json({ error: "Selected role does not match this account" });
                return;
            }

            const code = generateVerificationCode();
            user.verificationCode = code;
            user.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
            await userRepo.save(user);

            const sent = await sendVerificationEmail(user.email, code, user.name);
            if (!sent) {
                res.status(500).json({ error: "Failed to send verification code email" });
                return;
            }

            res.json({ message: "Verification code sent to your email" });
        } catch (error: any) {
            console.error("Forgot password error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // VERIFY RESET CODE
    static async verifyCode(req: Request, res: Response): Promise<void> {
        try {
            const email = String(req.body?.email || "").trim().toLowerCase();
            const code = String(req.body?.code || "").trim();

            if (!email || !code) {
                res.status(400).json({ error: "Email and verification code are required" });
                return;
            }

            const userRepo = getDataSource().getRepository(User);
            const user = await userRepo.findOne({ where: { email } });

            if (!user || !user.verificationCode || !user.verificationExpiry) {
                res.status(400).json({ error: "Invalid verification request" });
                return;
            }

            if (user.verificationCode !== code) {
                res.status(400).json({ error: "Invalid verification code" });
                return;
            }

            if (new Date(user.verificationExpiry).getTime() < Date.now()) {
                res.status(400).json({ error: "Verification code has expired" });
                return;
            }

            res.json({ message: "Code verified successfully" });
        } catch (error: any) {
            console.error("Verify code error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // CHANGE PASSWORD VIA RESET CODE
    static async changePasswordWithCode(req: Request, res: Response): Promise<void> {
        try {
            const email = String(req.body?.email || "").trim().toLowerCase();
            const code = String(req.body?.code || "").trim();
            const newPassword = String(req.body?.newPassword || "");

            if (!email || !code || !newPassword) {
                res.status(400).json({ error: "Email, code, and newPassword are required" });
                return;
            }

            if (newPassword.length < 8) {
                res.status(400).json({ error: "Password must be at least 8 characters" });
                return;
            }

            const userRepo = getDataSource().getRepository(User);
            const user = await userRepo.findOne({ where: { email } });

            if (!user || !user.verificationCode || !user.verificationExpiry) {
                res.status(400).json({ error: "Invalid reset request" });
                return;
            }

            if (user.verificationCode !== code) {
                res.status(400).json({ error: "Invalid verification code" });
                return;
            }

            if (new Date(user.verificationExpiry).getTime() < Date.now()) {
                res.status(400).json({ error: "Verification code has expired" });
                return;
            }

            user.password = await hashPassword(newPassword);
            user.verificationCode = null;
            user.verificationExpiry = null;
            await userRepo.save(user);

            res.json({ message: "Password changed successfully" });
        } catch (error: any) {
            console.error("Change password with code error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // LOGIN
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = userLoginSchema.parse(req.body);
            const result = await authLogin(email, password);

            if (!result.success) {
                res.status(401).json({ error: result.error });
                return;
            }

            res.json({
                message: "Login successful",
                token: result.token,
                user: result.user
            });

        } catch (error: unknown) {
            console.error("Login error:", error);
            res.status(500).json({ error: (error as Error)?.message || "Internal server error" });
        }
    }

    // CREATE USER
    static async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== "Admin") {
                res.status(403).json({ error: "Only Admin can create users" });
                return;
            }

            const data = userCreateSchema.parse(req.body);
            if (String(data.role || "").toLowerCase() === "admin") {
                res.status(403).json({ error: "Unauthorized role selection" });
                return;
            }
            const userRepo = getDataSource().getRepository(User);
            const employeeRepo = getDataSource().getRepository(Employee);

            const { role, password, ...userData } = data;
            const email = userData.email.toLowerCase();

            const exists = await userRepo.findOneBy({ email });
            if (exists) {
                res.status(409).json({ error: "User already exists" });
                return;
            }

            const hashedPassword = await hashPassword(password);

            // ✅ FIXED: All type conversions for User entity
            const createData = {
                ...userData,
                securityQuestions: (data as any).securityQuestions ? JSON.stringify((data as any).securityQuestions) : undefined,
                permissions: (data as any).permissions ? JSON.stringify((data as any).permissions) : undefined,
                email,
                password: hashedPassword,
                role,
                status: "Active",
                createdBy: Number.isInteger(Number(req.user?.id)) ? Number(req.user?.id) : null
            } as Partial<User>;
            let user = userRepo.create(createData);

            // ================= ADMIN =================
            if (role === "Admin") {
                res.status(403).json({ error: "Unauthorized role selection" });
                return;
            }

            // ✅ FIX: save single user (NOT array)
            const savedUser = await userRepo.save(user);

            // ================= EMPLOYEE =================
            if (role === "Employee") {
                const empData = data as any;

                const employee = employeeRepo.create({
                    userId: savedUser.id,
                    employeeId: generateEmployeeId(),
                    department: empData.department,
                    position: empData.position,
                    salary: empData.salary || 0,
                    hireDate: new Date(empData.hireDate),
                    dateOfBirth: new Date(empData.dateOfBirth),
                    gender: empData.gender,
                    presentAddress: empData.presentAddress,
                    permanentAddress: empData.permanentAddress,
                    branchId: empData.branchId,
                    employmentType: empData.employmentType,
                    dailyTransactionLimit: empData.dailyTransactionLimit,
                    permissions: JSON.stringify(empData.permissions),
                    isActive: true
                });

                await employeeRepo.save(employee);
            }

            res.status(201).json({
                message: `${role} created successfully`,
                data: savedUser
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.errors?.[0]?.message || "Validation failed"
            });
        }
    }

    // PUBLIC CUSTOMER REGISTRATION
    static async registerCustomer(req: Request, res: Response): Promise<void> {
        const queryRunner = getDataSource().createQueryRunner();
        try {
            const requestedRole = String(req.body?.role || "").trim().toLowerCase();
            if (requestedRole === "admin") {
                res.status(403).json({ error: "Unauthorized role selection" });
                return;
            }

            const data = customerRegisterSchema.parse(req.body);
            const email = data.email.toLowerCase();

            await queryRunner.connect();
            await queryRunner.startTransaction();

            const userRepo = queryRunner.manager.getRepository(User);
            const accountRepo = queryRunner.manager.getRepository(Account);

            const exists = await userRepo.findOneBy({ email });
            if (exists) {
                await queryRunner.rollbackTransaction();
                res.status(409).json({ error: "User already exists" });
                return;
            }

            const hashedPassword = await hashPassword(data.password);

            const user = userRepo.create({
                name: data.name,
                email,
                phone: data.phone,
                address: data.address,
                password: hashedPassword,
                role: "Customer",
                status: "Active"
            });

            const savedUser = await userRepo.save(user);

            // Create default customer account during registration
            let accountNumber = generateAccountNumber();
            // Extremely low collision chance; still guard with a small retry loop.
            for (let i = 0; i < 5; i++) {
                const existingAccount = await accountRepo.findOneBy({ accountNumber });
                if (!existingAccount) {
                    break;
                }
                accountNumber = generateAccountNumber();
            }

            const account = accountRepo.create({
                userId: savedUser.id,
                accountNumber,
                type: data.accountType || "Savings",
                balance: Number(data.initialDeposit ?? 2000),
                isActive: true
            });
            const savedAccount = await accountRepo.save(account);
            await queryRunner.commitTransaction();

            res.status(201).json({
                message: "Customer created successfully",
                data: {
                    ...savedUser,
                    accounts: [savedAccount]
                }
            });
        } catch (error: any) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            res.status(400).json({
                error: error.errors?.[0]?.message || "Validation failed"
            });
        } finally {
            if (!queryRunner.isReleased) {
                await queryRunner.release();
            }
        }
    }

    // GET ALL USERS
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const users = await getDataSource()
                .getRepository(User)
                .find({ relations: ["accounts"] });

            res.json({ data: users });

        } catch (error: unknown) {
            console.error("Get all users error:", error);
            res.status(500).json({ error: (error as Error)?.message || "Internal server error" });
        }
    }

    // GET USER BY ID
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

            const user = await getDataSource()
                .getRepository(User)
                .findOne({
                    where: { id },
                    relations: ["accounts"]
                });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.json({ data: user });

        } catch {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // UPDATE
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const repo = getDataSource().getRepository(User);
            const id = Number(req.params.id);
            const fixedAdminEmail = getFixedAdminEmail();

            const user = await repo.findOneBy({ id });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            if (fixedAdminEmail && user.email.toLowerCase() === fixedAdminEmail) {
                res.status(403).json({ error: "Fixed admin record cannot be modified" });
                return;
            }

            Object.assign(user, req.body);

            const updated = await repo.save(user);

            res.json({
                message: "User updated",
                data: updated
            });

        } catch {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // DELETE
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const fixedAdminEmail = getFixedAdminEmail();

            if (fixedAdminEmail) {
                const user = await getDataSource().getRepository(User).findOneBy({ id });
                if (user && user.email.toLowerCase() === fixedAdminEmail) {
                    res.status(403).json({ error: "Fixed admin record cannot be deleted" });
                    return;
                }
            }

            const result = await getDataSource()
                .getRepository(User)
                .delete(id);

            if (!result.affected) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.json({ message: "Deleted successfully" });

        } catch {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
