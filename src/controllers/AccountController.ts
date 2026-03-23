import { Request, Response } from "express";
import { sendTransactionEmail } from "../utils/emailService";
import { getDataSource } from "../data-source";
import { Account } from "../entity/Account";
import { Transaction, TransactionType } from "../entity/Transaction";
import { generateReferenceNumber } from "../utils/helpers";

export class AccountController {
  // ===================== Account Methods =====================

  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, accountNumber, balance = 0 } = req.body;
      if (!userId || !accountNumber) return res.status(400).json({ error: "Missing userId or accountNumber" });

      const accountRepo = getDataSource().getRepository(Account);
      const existing = await accountRepo.findOne({ where: { accountNumber } });
      if (existing) return res.status(400).json({ error: "Account number already exists" });

      const account = accountRepo.create({ userId, accountNumber, balance });
      await accountRepo.save(account);

      return res.json({ message: "Account created", account });
    } catch (error) {
      console.error("Create account error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const accounts = await getDataSource().getRepository(Account).find();
      return res.json({ data: accounts });
    } catch (error) {
      console.error("Get all accounts error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const account = await getDataSource().getRepository(Account).findOne({ where: { id: parseInt(idStr) } });
      if (!account) return res.status(404).json({ error: "Account not found" });
      return res.json({ data: account });
    } catch (error) {
      console.error("Get account by ID error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getByAccountNumber(req: Request, res: Response): Promise<Response> {
    try {
      const accNum = Array.isArray(req.params.accountNumber) ? req.params.accountNumber[0] : req.params.accountNumber;
      const account = await getDataSource().getRepository(Account).findOne({ where: { accountNumber: accNum } });
      if (!account) return res.status(404).json({ error: "Account not found" });
      return res.json({ data: account });
    } catch (error) {
      console.error("Get by account number error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const userIdStr = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const userId = parseInt(userIdStr);
      if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

      const accounts = await getDataSource().getRepository(Account).find({ where: { userId } });
      return res.json({ data: accounts });
    } catch (error) {
      console.error("Get by user ID error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ===================== Transaction Methods =====================

  static async deposit(req: Request, res: Response): Promise<Response> {
    try {
      const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const accountId = parseInt(idStr);
      const { amount, description } = req.body;

      if (isNaN(accountId) || !amount || amount <= 0) return res.status(400).json({ error: "Invalid input" });

      const accountRepo = getDataSource().getRepository(Account);
      const transactionRepo = getDataSource().getRepository(Transaction);

      const account = await accountRepo.findOne({ 
        where: { id: accountId }, 
        relations: ["user"]
      });
      if (!account) return res.status(404).json({ error: "Account not found" });

      account.balance += amount;
      await accountRepo.save(account);

      const transaction = transactionRepo.create({
        account,
        type: TransactionType.DEPOSIT,
        amount,
        balanceAfter: account.balance,
description: description || `Deposit to account ${account.accountNumber}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      await transactionRepo.save(transaction);

      // Send email notification
      try {
        if (account.user && account.user.email) {
          await sendTransactionEmail(account.user.email, {
            type: transaction.type,
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            referenceNumber: transaction.referenceNumber,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString()
          });
          console.log(`✅ Deposit email sent to ${account.user.email}`);
        }
      } catch (emailError) {
        console.error("⚠️ Failed to send deposit email:", emailError);
      }

      return res.json({ message: "Deposit successful", transaction });
    } catch (error) {
      console.error("Deposit error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async withdraw(req: Request, res: Response): Promise<Response> {
    try {
      const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const accountId = parseInt(idStr);
      const { amount, description } = req.body;

      if (isNaN(accountId) || !amount || amount <= 0) return res.status(400).json({ error: "Invalid input" });

      const accountRepo = getDataSource().getRepository(Account);
      const transactionRepo = getDataSource().getRepository(Transaction);

      const account = await accountRepo.findOne({ 
        where: { id: accountId }, 
        relations: ["user"]
      });
      if (!account) return res.status(404).json({ error: "Account not found" });
      if (account.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

      account.balance -= amount;
      await accountRepo.save(account);

      const transaction = transactionRepo.create({
        account,
        type: TransactionType.WITHDRAW,
        amount,
        balanceAfter: account.balance,
description: description || `Withdraw from account ${account.accountNumber}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      await transactionRepo.save(transaction);

      // Send email notification
      try {
        if (account.user && account.user.email) {
          await sendTransactionEmail(account.user.email, {
            type: transaction.type,
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            referenceNumber: transaction.referenceNumber,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString()
          });
          console.log(`✅ Withdraw email sent to ${account.user.email}`);
        }
      } catch (emailError) {
        console.error("⚠️ Failed to send withdraw email:", emailError);
      }

      return res.json({ message: "Withdrawal successful", transaction });
    } catch (error) {
      console.error("Withdraw error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async transfer(req: Request, res: Response): Promise<Response> {
    try {
      const { fromAccountId, toAccountId, amount, description } = req.body;
      if (!fromAccountId || !toAccountId || !amount || amount <= 0)
        return res.status(400).json({ error: "Invalid input" });

      const accountRepo = getDataSource().getRepository(Account);
      const transactionRepo = getDataSource().getRepository(Transaction);

      const fromAccount = await accountRepo.findOne({ 
        where: { id: fromAccountId }, 
        relations: ["user"]
      });
      const toAccount = await accountRepo.findOne({ 
        where: { id: toAccountId }, 
        relations: ["user"]
      });

      if (!fromAccount || !toAccount) return res.status(404).json({ error: "One or both accounts not found" });
      if (fromAccount.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

      fromAccount.balance -= amount;
      toAccount.balance += amount;
      await accountRepo.save([fromAccount, toAccount]);

      const fromTransaction = transactionRepo.create({
        account: fromAccount,
        type: TransactionType.TRANSFER_OUT,
        amount,
        balanceAfter: fromAccount.balance,
        description: description || `Transfer to account ${toAccountId}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      const toTransaction = transactionRepo.create({
        account: toAccount,
        type: TransactionType.TRANSFER_IN,
        amount,
        balanceAfter: toAccount.balance,
        description: description || `Transfer from account ${fromAccountId}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      await transactionRepo.save([fromTransaction, toTransaction]);

      // Send emails to both sender and receiver
      try {
        if (fromAccount.user && fromAccount.user.email) {
          await sendTransactionEmail(fromAccount.user.email, {
            type: fromTransaction.type,
            amount: fromTransaction.amount,
            balanceAfter: fromTransaction.balanceAfter,
            referenceNumber: fromTransaction.referenceNumber,
            description: fromTransaction.description,
            createdAt: fromTransaction.createdAt.toISOString()
          });
          console.log(`✅ Transfer OUT email sent to ${fromAccount.user.email}`);
        }
      } catch (emailError) {
        console.error("⚠️ Failed to send sender transfer email:", emailError);
      }

      try {
        if (toAccount.user && toAccount.user.email) {
          await sendTransactionEmail(toAccount.user.email, {
            type: toTransaction.type,
            amount: toTransaction.amount,
            balanceAfter: toTransaction.balanceAfter,
            referenceNumber: toTransaction.referenceNumber,
            description: toTransaction.description,
            createdAt: toTransaction.createdAt.toISOString()
          }, true);
          console.log(`✅ Transfer IN email sent to ${toAccount.user.email}`);
        }
      } catch (emailError) {
        console.error("⚠️ Failed to send receiver transfer email:", emailError);
      }

      return res.json({ message: "Transfer successful", fromTransaction, toTransaction });
    } catch (error) {
      console.error("Transfer error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ===================== Fetch Transactions =====================

  static async getAllTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const transactions = await getDataSource().getRepository(Transaction).find({ relations: ["account"] });
      return res.json({ data: transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getTransactionsByAccountId(req: Request, res: Response): Promise<Response> {
    try {
      const accountId = parseInt(Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId);
      if (isNaN(accountId)) return res.status(400).json({ error: "Invalid account ID" });

      const transactions = await getDataSource().getRepository(Transaction).find({
        where: { accountId },
        relations: ["account"]
      });

      return res.json({ data: transactions });
    } catch (error) {
      console.error("Error fetching transactions by account:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getTransactionsByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
      if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

      const limit = Math.min(Number(req.query.limit) || 5, 20);
      const accountRepo = getDataSource().getRepository(Account);
      const transactionRepo = getDataSource().getRepository(Transaction);

      const userAccounts = await accountRepo.find({ where: { userId }, select: ["id"] });
      if (!userAccounts.length) return res.json({ data: [] });

      const accountIds = userAccounts.map(acc => acc.id);
      const transactions = await transactionRepo
        .createQueryBuilder("tx")
        .leftJoinAndSelect("tx.account", "account")
        .where("tx.accountId IN (:...accountIds)", { accountIds })
        .orderBy("tx.createdAt", "DESC")
        .take(limit)
        .getMany();

      return res.json({ data: transactions });
    } catch (error) {
      console.error("Error fetching transactions by user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}