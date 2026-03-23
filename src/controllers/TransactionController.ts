import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { Transaction } from "../entity/Transaction";
import { Account } from "../entity/Account";

export class TransactionController {
  // ===================== GET ALL TRANSACTIONS =====================
  // GET /api/transactions — Get all transactions
  static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const transactionRepo = getDataSource().getRepository(Transaction);
      const transactions = await transactionRepo.find({
        relations: ["account"],
        order: { createdAt: "DESC" }
      });
      return res.json({ data: transactions });
    } catch (error) {
      console.error("Get all transactions error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ===================== GET TRANSACTIONS BY ACCOUNT ID =====================
  // GET /api/transactions/account/:accountId
  static async getByAccountId(req: Request, res: Response): Promise<Response> {
    try {
      const accountIdStr = Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId;
      const accountId = parseInt(accountIdStr);
      if (isNaN(accountId)) return res.status(400).json({ error: "Invalid account ID" });

      const transactionRepo = getDataSource().getRepository(Transaction);
      const transactions = await transactionRepo.find({
        where: { accountId },
        relations: ["account"],
        order: { createdAt: "DESC" }
      });

      return res.json({ data: transactions });
    } catch (error) {
      console.error("Get transactions by account ID error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ===================== GET TRANSACTIONS BY USER ID =====================
  // GET /api/transactions/user/:userId — Get all transactions for user's accounts
  static async getByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const userIdStr = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const userId = parseInt(userIdStr);
      if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

      const accountRepo = getDataSource().getRepository(Account);
      const transactionRepo = getDataSource().getRepository(Transaction);

      const userAccounts = await accountRepo.find({ where: { userId }, select: ["id"] });
      if (!userAccounts.length) return res.json({ data: [] });

      const accountIds = userAccounts.map(acc => acc.id);
      const limit = Math.min(Number(req.query.limit) || 20, 50);

      const transactions = await transactionRepo
        .createQueryBuilder("tx")
        .leftJoinAndSelect("tx.account", "account")
        .where("tx.accountId IN (:...accountIds)", { accountIds })
        .orderBy("tx.createdAt", "DESC")
        .take(limit)
        .getMany();

      return res.json({ data: transactions });
    } catch (error) {
      console.error("Get transactions by user ID error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

