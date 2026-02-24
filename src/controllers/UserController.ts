import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export class UserController {
    // POST /api/users — Create a new user
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const { name, email, phone, address } = req.body;

            // Validate required fields
            if (!name || !email) {
                res.status(400).json({ error: "Name and email are required" });
                return;
            }

            // Check if email already exists
            const existingUser = await userRepository.findOneBy({ email });
            if (existingUser) {
                res.status(409).json({ error: "A user with this email already exists" });
                return;
            }

            const user = userRepository.create({ name, email, phone, address });
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
            const userRepository = AppDataSource.getRepository(User);
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
            const userRepository = AppDataSource.getRepository(User);
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
            const userRepository = AppDataSource.getRepository(User);
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
            const userRepository = AppDataSource.getRepository(User);
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
}
