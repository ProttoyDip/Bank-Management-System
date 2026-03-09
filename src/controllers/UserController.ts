import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { User } from "../entity/User";
import { login as authLogin } from "../services/authService";
import { hashPassword } from "../utils/hashPassword";
import { sendVerificationEmail } from "../utils/emailService";

// verification code generator
const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export class UserController {

    // ===============================
    // LOGIN
    // ===============================
    static async login(req: Request, res: Response): Promise<void> {
        try {

            let { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" });
                return;
            }

            email = email.toLowerCase();

            const result = await authLogin(email, password);

            if (!result.success) {
                res.status(401).json({ error: result.error });
                return;
            }

            res.json({
                message: "Login successful",
                token: result.token,
                user: {
                    id: result.user?.id,
                    name: result.user?.name,
                    email: result.user?.email,
                    role: result.user?.role
                }
            });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // CREATE USER
    // ===============================
    static async create(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);

            let { name, email, phone, address, password, role } = req.body;

            if (!name || !email || !password) {
                res.status(400).json({ error: "Name, email and password are required" });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({ error: "Password must be at least 6 characters" });
                return;
            }

            email = email.toLowerCase();

            const existingUser = await userRepository.findOneBy({ email });

            if (existingUser) {
                res.status(409).json({ error: "User already exists with this email" });
                return;
            }

            const hashedPassword = await hashPassword(password);

            const user = userRepository.create({
                name,
                email,
                phone,
                address,
                password: hashedPassword,
                role: role || "Customer"
            });

            const savedUser = await userRepository.save(user);

            res.status(201).json({
                message: "User created successfully",
                data: savedUser
            });

        } catch (error) {
            console.error("Create user error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // GET ALL USERS
    // ===============================
    static async getAll(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);

            const users = await userRepository.find({
                relations: ["accounts"]
            });

            res.json({ data: users });

        } catch (error) {
            console.error("Fetch users error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // GET USER BY ID
    // ===============================
    static async getById(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);

            const id = Number(req.params.id);

            const user = await userRepository.findOne({
                where: { id },
                relations: ["accounts"]
            });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.json({ data: user });

        } catch (error) {
            console.error("Fetch user error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // UPDATE USER
    // ===============================
    static async update(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);
            const id = Number(req.params.id);

            const user = await userRepository.findOneBy({ id });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            const { name, phone, address } = req.body;

            user.name = name ?? user.name;
            user.phone = phone ?? user.phone;
            user.address = address ?? user.address;

            const updatedUser = await userRepository.save(user);

            res.json({
                message: "User updated successfully",
                data: updatedUser
            });

        } catch (error) {
            console.error("Update user error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // DELETE USER
    // ===============================
    static async delete(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);
            const id = Number(req.params.id);

            const result = await userRepository.delete(id);

            if (result.affected === 0) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.json({
                message: "User deleted successfully"
            });

        } catch (error) {
            console.error("Delete user error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // FORGOT PASSWORD
    // ===============================
    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);
            let { email } = req.body;

            if (!email) {
                res.status(400).json({ error: "Email is required" });
                return;
            }

            email = email.toLowerCase();
            console.log("🔍 Forgot password request for email:", email);

            const user = await userRepository.findOneBy({ email });

            if (!user) {
                console.log("⚠️ User not found for email:", email);
                res.json({
                    message: "If this email exists, a verification code will be sent"
                });
                return;
            }

            console.log("✅ User found:", user.name, "- Generating verification code...");
            const code = generateVerificationCode();

            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 10);

            user.verificationCode = code;
            user.verificationExpiry = expiry;

            await userRepository.save(user);

            const emailSent = await sendVerificationEmail(email, code, user.name);

            if (!emailSent) {
                console.error("Email sending failed for:", email);
                res.status(500).json({ error: "Failed to send verification email. Please try again later." });
                return;
            }

            res.json({
                message: "Verification code sent to email"
            });

        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // VERIFY CODE
    // ===============================
    static async verifyCode(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);

            const { email, code } = req.body;

            if (!email || !code) {
                res.status(400).json({ error: "Email and code required" });
                return;
            }

            const user = await userRepository.findOneBy({ email });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (user.verificationCode !== code) {
                res.status(400).json({ error: "Invalid code" });
                return;
            }

            if (!user.verificationExpiry || new Date() > user.verificationExpiry) {
                res.status(400).json({ error: "Code expired" });
                return;
            }

            res.json({
                message: "Verification successful"
            });

        } catch (error) {
            console.error("Verify code error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // ===============================
    // CHANGE PASSWORD
    // ===============================
    static async changePassword(req: Request, res: Response): Promise<void> {
        try {

            const userRepository = getDataSource().getRepository(User);

            const { email, code, newPassword } = req.body;

            if (!email || !code || !newPassword) {
                res.status(400).json({
                    error: "Email, code and new password required"
                });
                return;
            }

            if (newPassword.length < 6) {
                res.status(400).json({
                    error: "Password must be at least 6 characters"
                });
                return;
            }

            const user = await userRepository.findOneBy({ email });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (user.verificationCode !== code) {
                res.status(400).json({ error: "Invalid verification code" });
                return;
            }

            if (!user.verificationExpiry || new Date() > user.verificationExpiry) {
                res.status(400).json({ error: "Verification code expired" });
                return;
            }

            const hashedPassword = await hashPassword(newPassword);

            user.password = hashedPassword;
            user.verificationCode = null;
            user.verificationExpiry = null;

            await userRepository.save(user);

            res.json({
                message: "Password changed successfully"
            });

        } catch (error) {
            console.error("Change password error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}