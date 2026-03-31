import { Request, Response } from "express";
import { sendTransactionEmail } from "../utils/emailService";
import { getDataSource } from "../data-source";
import { Account } from "../entity/Account";
import { Transaction, TransactionType } from "../entity/Transaction";
import { generateAccountNumber, generateReferenceNumber } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import { User } from "../entity/User";

const toMoneyNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export class AccountController {
  // ===================== Account Methods =====================

  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number(req.body.userId);
      const type = req.body.type || "Savings";
      const initialDeposit = toMoneyNumber(req.body.initialDeposit ?? req.body.balance ?? 0);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: "Invalid userId" });
      }
      if (!Number.isFinite(initialDeposit) || initialDeposit < 0) {
        return res.status(400).json({ error: "Invalid initial deposit" });
      }

      const accountRepo = getDataSource().getRepository(Account);
      const userRepo = getDataSource().getRepository(User);
      const user = await userRepo.findOneBy({ id: userId });
      if (!user) return res.status(404).json({ error: "User not found" });

      let accountNumber = req.body.accountNumber || generateAccountNumber();
      for (let i = 0; i < 5; i++) {
        const existing = await accountRepo.findOne({ where: { accountNumber } });
        if (!existing) break;
        accountNumber = generateAccountNumber();
      }

      const account = accountRepo.create({
        userId,
        accountNumber,
        type,
        balance: initialDeposit,
        isActive: true
      });
      await accountRepo.save(account);

      return res.json({ message: "Account created", account });
    } catch (error) {
      console.error("Create account error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const accounts = await getDataSource().getRepository(Account).find({ relations: ["user"] });
      return res.json({ data: accounts });
    } catch (error) {
      console.error("Get all accounts error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const account = await getDataSource().getRepository(Account).findOne({
        where: { id: parseInt(idStr, 10) },
        relations: ["user"]
      });
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
      const account = await getDataSource().getRepository(Account).findOne({ where: { accountNumber: accNum }, relations: ["user"] });
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
      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

      const accounts = await getDataSource().getRepository(Account).find({ where: { userId }, order: { createdAt: "ASC" } });
      return res.json({ data: accounts });
    } catch (error) {
      console.error("Get by user ID error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMyAccount(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" });

      const account = await getDataSource().getRepository(Account).findOne({
        where: { userId: req.user.id, isActive: true },
        order: { createdAt: "ASC" }
      });
      if (!account) return res.status(404).json({ error: "No account found for this user" });
      return res.json({ data: account });
    } catch (error) {
      console.error("Get my account error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMyAccounts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" });
      const accounts = await getDataSource().getRepository(Account).find({
        where: { userId: req.user.id },
        order: { createdAt: "ASC" }
      });
      return res.json({ data: accounts });
    } catch (error) {
      console.error("Get my accounts error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async searchByAccountNumber(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" });
      const accountNumber = String(req.query.accountNumber || "").trim();
      if (!accountNumber) {
        return res.status(400).json({ error: "accountNumber query is required" });
      }

      const account = await getDataSource().getRepository(Account).findOne({
        where: { accountNumber, isActive: true },
        relations: ["user"]
      });

      if (!account) return res.status(404).json({ error: "Account not found" });
      return res.json({
        data: {
          id: account.id,
          accountNumber: account.accountNumber,
          userId: account.userId,
          name: account.user?.name || `User #${account.userId}`,
          isActive: account.isActive
        }
      });
    } catch (error) {
      console.error("Search account error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ===================== Transaction Methods =====================

  static async deposit(req: AuthRequest, res: Response): Promise<Response> {
    const queryRunner = getDataSource().createQueryRunner();
    try {
      const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const accountId = parseInt(idStr, 10);
      const { description } = req.body;
      const amount = toMoneyNumber(req.body.amount);

      if (isNaN(accountId) || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid input" });
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const account = await queryRunner.manager.findOne(Account, {
        where: { id: accountId },
        relations: ["user"]
      });
      if (!account) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({ error: "Account not found" });
      }
      if (req.user?.role === "Customer" && account.userId !== req.user.id) {
        await queryRunner.rollbackTransaction();
        return res.status(403).json({ error: "You can only deposit into your own account" });
      }

      account.balance = toMoneyNumber(account.balance) + amount;
      await queryRunner.manager.save(account);

      const transaction = queryRunner.manager.create(Transaction, {
        account,
        type: TransactionType.DEPOSIT,
        amount,
        balanceAfter: account.balance,
        description: description || `Deposit to account ${account.accountNumber}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      try {
        if (account.user?.email) {
          await sendTransactionEmail(account.user.email, {
            type: transaction.type,
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            referenceNumber: transaction.referenceNumber,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString()
          });
        }
      } catch (emailError) {
        console.error("Failed to send deposit email:", emailError);
      }

      return res.json({ message: "Deposit successful", transaction });
    } catch (error) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      console.error("Deposit error:", error);
      return res.status(500).json({ error: "Internal server error" });
    } finally {
      if (!queryRunner.isReleased) await queryRunner.release();
    }
  }

  static async withdraw(req: AuthRequest, res: Response): Promise<Response> {
    const queryRunner = getDataSource().createQueryRunner();
    try {
      const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const accountId = parseInt(idStr, 10);
      const { description } = req.body;
      const amount = toMoneyNumber(req.body.amount);

      if (isNaN(accountId) || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid input" });
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const account = await queryRunner.manager.findOne(Account, {
        where: { id: accountId },
        relations: ["user"]
      });
      if (!account) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({ error: "Account not found" });
      }
      if (req.user?.role === "Customer" && account.userId !== req.user.id) {
        await queryRunner.rollbackTransaction();
        return res.status(403).json({ error: "You can only withdraw from your own account" });
      }
      if (toMoneyNumber(account.balance) < amount) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ error: "Insufficient balance" });
      }

      account.balance = toMoneyNumber(account.balance) - amount;
      await queryRunner.manager.save(account);

      const transaction = queryRunner.manager.create(Transaction, {
        account,
        type: TransactionType.WITHDRAW,
        amount,
        balanceAfter: account.balance,
        description: description || `Withdraw from account ${account.accountNumber}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      try {
        if (account.user?.email) {
          await sendTransactionEmail(account.user.email, {
            type: transaction.type,
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            referenceNumber: transaction.referenceNumber,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString()
          });
        }
      } catch (emailError) {
        console.error("Failed to send withdraw email:", emailError);
      }

      return res.json({ message: "Withdrawal successful", transaction });
    } catch (error) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      console.error("Withdraw error:", error);
      return res.status(500).json({ error: "Internal server error" });
    } finally {
      if (!queryRunner.isReleased) await queryRunner.release();
    }
  }

  static async transfer(req: AuthRequest, res: Response): Promise<Response> {
    const queryRunner = getDataSource().createQueryRunner();
    try {
      let fromAccountId = toMoneyNumber(req.body.fromAccountId);
      const toAccountId = toMoneyNumber(req.body.toAccountId);
      const amount = toMoneyNumber(req.body.amount);
      const { description } = req.body;

      if (!Number.isInteger(toAccountId) || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid input" });
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (req.user?.role === "Customer") {
        if (!Number.isInteger(fromAccountId)) {
          const firstAccount = await queryRunner.manager.findOne(Account, {
            where: { userId: req.user.id, isActive: true },
            order: { createdAt: "ASC" }
          });
          if (!firstAccount) {
            await queryRunner.rollbackTransaction();
            return res.status(404).json({ error: "No account found for this user" });
          }
          fromAccountId = firstAccount.id;
        }
      }

      if (!Number.isInteger(fromAccountId)) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ error: "Invalid input" });
      }
      if (fromAccountId === toAccountId) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ error: "Cannot transfer to the same account" });
      }

      const fromAccount = await queryRunner.manager.findOne(Account, {
        where: { id: fromAccountId },
        relations: ["user"]
      });
      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { id: toAccountId },
        relations: ["user"]
      });

      if (!fromAccount || !toAccount) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({ error: "One or both accounts not found" });
      }
      if (req.user?.role === "Customer" && fromAccount.userId !== req.user.id) {
        await queryRunner.rollbackTransaction();
        return res.status(403).json({ error: "You can only transfer from your own account" });
      }
      if (toMoneyNumber(fromAccount.balance) < amount) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ error: "Insufficient balance" });
      }

      fromAccount.balance = toMoneyNumber(fromAccount.balance) - amount;
      toAccount.balance = toMoneyNumber(toAccount.balance) + amount;
      await queryRunner.manager.save([fromAccount, toAccount]);

      const fromTransaction = queryRunner.manager.create(Transaction, {
        account: fromAccount,
        type: TransactionType.TRANSFER_OUT,
        amount,
        balanceAfter: fromAccount.balance,
        description: description || `Transfer to account ${toAccount.accountNumber}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      const toTransaction = queryRunner.manager.create(Transaction, {
        account: toAccount,
        type: TransactionType.TRANSFER_IN,
        amount,
        balanceAfter: toAccount.balance,
        description: description || `Transfer from account ${fromAccount.accountNumber}`,
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date()
      });

      await queryRunner.manager.save([fromTransaction, toTransaction]);
      await queryRunner.commitTransaction();

      try {
        if (fromAccount.user?.email) {
          await sendTransactionEmail(fromAccount.user.email, {
            type: fromTransaction.type,
            amount: fromTransaction.amount,
            balanceAfter: fromTransaction.balanceAfter,
            referenceNumber: fromTransaction.referenceNumber,
            description: fromTransaction.description,
            createdAt: fromTransaction.createdAt.toISOString()
          });
        }
      } catch (emailError) {
        console.error("Failed to send sender transfer email:", emailError);
      }

      try {
        if (toAccount.user?.email) {
          await sendTransactionEmail(toAccount.user.email, {
            type: toTransaction.type,
            amount: toTransaction.amount,
            balanceAfter: toTransaction.balanceAfter,
            referenceNumber: toTransaction.referenceNumber,
            description: toTransaction.description,
            createdAt: toTransaction.createdAt.toISOString()
          }, true);
        }
      } catch (emailError) {
        console.error("Failed to send receiver transfer email:", emailError);
      }

      return res.json({ message: "Transfer successful", fromTransaction, toTransaction });
    } catch (error) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      console.error("Transfer error:", error);
      return res.status(500).json({ error: "Internal server error" });
    } finally {
      if (!queryRunner.isReleased) await queryRunner.release();
    }
  }
}
