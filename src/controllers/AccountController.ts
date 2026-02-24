import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Account, AccountType } from "../entity/Account";
import { User } from "../entity/User";

const accountRepository = AppDataSource.getRepository(Account);
const userRepository = AppDataSource.getRepository(User);

// Generate a unique 10-digit account number
function generateAccountNumber(): string {
    return "BMS" + Date.now().toString().slice(-7) + Math.floor(Math.random() * 100).toString().padStart(2, "0");
}

export class AccountController {
    // POST /api/accounts — Create a new account for a user
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { userId, type } = req.body;

            if (!userId) {
                res.status(400).json({ error: "userId is required" });
                return;
            }

            // Validate account type
            const validTypes = Object.values(AccountType);
            if (type && !validTypes.includes(type)) {
                res.status(400).json({
                    error: `Invalid account type. Must be one of: ${validTypes.join(", ")}`,
                });
                return;
            }

            // Check if user exists
            const user = await userRepository.findOneBy({ id: userId });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            const account = accountRepository.create({
                accountNumber: generateAccountNumber(),
                type: type || AccountType.SAVINGS,
                balance: 0,
                userId,
            });

            const savedAccount = await accountRepository.save(account);

            res.status(201).json({
                message: "Account created successfully",
                data: savedAccount,
            });
        } catch (error) {
            console.error("Error creating account:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/accounts — Get all accounts
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const accounts = await accountRepository.find({ relations: ["user"] });
            res.json({ data: accounts });
        } catch (error) {
            console.error("Error fetching accounts:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/accounts/:id — Get account by ID
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string);
            const account = await accountRepository.findOne({
                where: { id },
                relations: ["user"],
            });

            if (!account) {
                res.status(404).json({ error: "Account not found" });
                return;
            }

            res.json({ data: account });
        } catch (error) {
            console.error("Error fetching account:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // POST /api/accounts/:id/deposit — Deposit money
    static async deposit(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string);
            const { amount } = req.body;

            if (!amount || amount <= 0) {
                res.status(400).json({ error: "A positive amount is required" });
                return;
            }

            const account = await accountRepository.findOneBy({ id });
            if (!account) {
                res.status(404).json({ error: "Account not found" });
                return;
            }

            account.balance = Number(account.balance) + Number(amount);
            const updatedAccount = await accountRepository.save(account);

            res.json({
                message: `Successfully deposited ${amount}`,
                data: updatedAccount,
            });
        } catch (error) {
            console.error("Error depositing:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // POST /api/accounts/:id/withdraw — Withdraw money
    static async withdraw(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string);
            const { amount } = req.body;

            if (!amount || amount <= 0) {
                res.status(400).json({ error: "A positive amount is required" });
                return;
            }

            const account = await accountRepository.findOneBy({ id });
            if (!account) {
                res.status(404).json({ error: "Account not found" });
                return;
            }

            if (Number(account.balance) < Number(amount)) {
                res.status(400).json({ error: "Insufficient balance" });
                return;
            }

            account.balance = Number(account.balance) - Number(amount);
            const updatedAccount = await accountRepository.save(account);

            res.json({
                message: `Successfully withdrew ${amount}`,
                data: updatedAccount,
            });
        } catch (error) {
            console.error("Error withdrawing:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
