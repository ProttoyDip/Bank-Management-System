import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { User } from "../entity/User";

// Helper function to generate verification code
const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send email (mock implementation)
const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
    // In production, integrate with email service like SendGrid, Nodemailer, etc.
    console.log(`Sending verification code ${code} to ${email}`);
    console.log(`[MOCK EMAIL] Your verification code is: ${code}`);
};

export class UserController {
    // POST /api/users — Create a new user
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const { name, email, phone, address, password } = req.body;

            // Validate required fields
            if (!name || !email) {
                res.status(400).json({ error: "Name and email are required" });
                return;
            }

            // Validate password
            if (!password) {
                res.status(400).json({ error: "Password is required" });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({ error: "Password must be at least 6 characters" });
                return;
            }

            // Check if email already exists
            const existingUser = await userRepository.findOneBy({ email });
            if (existingUser) {
                res.status(409).json({ error: "A user with this email already exists" });
                return;
            }

            const user = userRepository.create({ name, email, phone, address, password });
            const savedUser = await userRepository.save(user);

            res.status(201).json({
                message: "User created successfully",
                data: savedUser,
            });
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/users — Get all users (with their accounts)
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const users = await userRepository.find({ relations: ["accounts"] });
            res.json({ data: users });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/users/:id — Get a single user by ID
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const id = parseInt(req.params.id as string);
            const user = await userRepository.findOne({
                where: { id },
                relations: ["accounts"],
            });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.json({ data: user });
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // PUT /api/users/:id — Update a user
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const id = parseInt(req.params.id as string);
            const user = await userRepository.findOneBy({ id });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            userRepository.merge(user, req.body);
            const updatedUser = await userRepository.save(user);

            res.json({
                message: "User updated successfully",
                data: updatedUser,
            });
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // DELETE /api/users/:id — Delete a user
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const id = parseInt(req.params.id as string);
            const result = await userRepository.delete(id);

            if (result.affected === 0) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.json({ message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // POST /api/users/forgot-password — Send verification code
    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const { email, role } = req.body;

            // Validate required fields
            if (!email || !role) {
                res.status(400).json({ error: "Email and role are required" });
                return;
            }

            // Find user by email
            const user = await userRepository.findOneBy({ email });
            if (!user) {
                // Don't reveal if user exists or not
                res.json({ message: "If the email exists, a verification code will be sent" });
                return;
            }

            // Generate verification code
            const verificationCode = generateVerificationCode();
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + 10); // 10 minutes expiry

            // Save verification code and expiry
            user.verificationCode = verificationCode;
            user.verificationExpiry = expiryDate;
            await userRepository.save(user);

            // Send verification email (mock)
            await sendVerificationEmail(email, verificationCode);

            res.json({ 
                message: "Verification code sent to your email",
                // In production, don't send the code back
                // For testing, we'll send it in development
                ...(process.env.NODE_ENV !== 'production' && { verificationCode: verificationCode })
            });
        } catch (error) {
            console.error("Error in forgot password:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // POST /api/users/verify-code — Verify the code
    static async verifyCode(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const { email, code } = req.body;

            // Validate required fields
            if (!email || !code) {
                res.status(400).json({ error: "Email and verification code are required" });
                return;
            }

            // Find user by email
            const user = await userRepository.findOneBy({ email });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            // Check if code matches
            if (user.verificationCode !== code) {
                res.status(400).json({ error: "Invalid verification code" });
                return;
            }

            // Check if code has expired
            if (!user.verificationExpiry || new Date() > user.verificationExpiry) {
                res.status(400).json({ error: "Verification code has expired" });
                return;
            }

            res.json({ 
                message: "Verification successful",
                userId: user.id
            });
        } catch (error) {
            console.error("Error in verify code:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // POST /api/users/change-password — Change password after verification
    static async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = getDataSource().getRepository(User);
            const { email, code, newPassword } = req.body;

            // Validate required fields
            if (!email || !code || !newPassword) {
                res.status(400).json({ error: "Email, verification code, and new password are required" });
                return;
            }

            // Validate password length
            if (newPassword.length < 6) {
                res.status(400).json({ error: "Password must be at least 6 characters" });
                return;
            }

            // Find user by email
            const user = await userRepository.findOneBy({ email });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            // Check if code matches
            if (user.verificationCode !== code) {
                res.status(400).json({ error: "Invalid verification code" });
                return;
            }

            // Check if code has expired
            if (!user.verificationExpiry || new Date() > user.verificationExpiry) {
                res.status(400).json({ error: "Verification code has expired" });
                return;
            }

            // Update password
            user.password = newPassword;
            user.verificationCode = ""; // Clear verification code
            user.verificationExpiry = null;
            await userRepository.save(user);

            res.json({ message: "Password changed successfully" });
        } catch (error) {
            console.error("Error in change password:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

