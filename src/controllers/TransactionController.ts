import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { Transaction } from "../entity/Transaction";

export class TransactionController {
    // GET /api/transactions — Get all transactions
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const transactionRepository = getDataSource().getRepository(Transaction);
            const transactions = await transactionRepository.find({ relations: ["account"] });
            res.json({ data: transactions });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/transactions/account/:accountId — Get transactions by account ID
    static async getByAccountId(req: Request, res: Response): Promise<void> {
        try {
            const transactionRepository = getDataSource().getRepository(Transaction);
            const accountId = parseInt(req.params.accountId as string);

            if (isNaN(accountId)) {
                res.status(400).json({ error: "Invalid account ID" });
                return;
            }

            const transactions = await transactionRepository.find({
                where: { accountId },
                relations: ["account"],
            });
            res.json({ data: transactions });
        } catch (error) {
            console.error("Error fetching transactions by account:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

