import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { User } from "../entity/User";
import { Employee } from "../entity/Employee";
import { login as authLogin } from "../services/authService";
import { hashPassword } from "../utils/hashPassword";
import { generateAdminId, generateEmployeeId } from "../utils/helpers";
import { sendVerificationEmail } from "../utils/emailService";
import { AuthRequest } from "../middleware/auth";
import { userLoginSchema, userCreateSchema } from "../validators/userSchema";

const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export class UserController {

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
                createdBy: req.user.id
            } as Partial<User>;
            let user = userRepo.create(createData);

            // ================= ADMIN =================
            if (role === "Admin") {
                const adminData = data as any;

                user.adminId = generateAdminId();
                user.authCode = await hashPassword(adminData.authCode);
                user.accessLevel = adminData.accessLevel;
                user.permissions = JSON.stringify(adminData.permissions);
                user.department = adminData.department;
                user.officeLocation = adminData.officeLocation;
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

            const user = await repo.findOneBy({ id });
            if (!user) {
                res.status(404).json({ error: "User not found" });
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