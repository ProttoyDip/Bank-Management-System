import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { Account, AccountType } from "../entity/Account";
import { User } from "../entity/User";
import { Transaction, TransactionType } from "../entity/Transaction";
import { generateReferenceNumber } from "../utils/helpers";

// Generate a unique 10-digit account number
function generateAccountNumber(): string {
    return "BMS" + Date.now().toString().slice(-7) + Math.floor(Math.random() * 100).toString().padStart(2, "0");
}

export class AccountController {
    // POST /api/accounts — Create a new account for a user
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const accountRepository = getDataSource().getRepository(Account);
            const userRepository = getDataSource().getRepository(User);
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
            const accountRepository = getDataSource().getRepository(Account);
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
            const accountRepository = getDataSource().getRepository(Account);
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

    // GET /api/accounts/by-account-number/:accountNumber — Get account by account number
    static async getByAccountNumber(req: Request, res: Response): Promise<void> {
        try {
            const accountRepository = getDataSource().getRepository(Account);
            const accountNumber = req.params.accountNumber as string;

            if (!accountNumber) {
                res.status(400).json({ error: "Account number is required" });
                return;
            }

            const account = await accountRepository.findOne({
                where: { accountNumber },
                relations: ["user"],
            });

            if (!account) {
                res.status(404).json({ error: "Account not found" });
                return;
            }

            res.json({ data: account });
        } catch (error) {
            console.error("Error fetching account by account number:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/accounts/user/:userId — Get accounts by user ID
    static async getByUserId(req: Request, res: Response): Promise<void> {
        try {
            const accountRepository = getDataSource().getRepository(Account);
            const userId = parseInt(req.params.userId as string);

            if (isNaN(userId)) {
                res.status(400).json({ error: "Invalid user ID" });
                return;
            }

            const accounts = await accountRepository.find({
                where: { userId },
                relations: ["user"],
            });

            res.json({ data: accounts });
        } catch (error) {
            console.error("Error fetching accounts by user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // POST /api/accounts/:id/deposit — Deposit money
    static async deposit(req: Request, res: Response): Promise<void> {
        try {
            const accountRepository = getDataSource().getRepository(Account);
            const transactionRepository = getDataSource().getRepository(Transaction);
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

            // Create transaction record
            const transaction = transactionRepository.create({
                accountId: id,
                type: TransactionType.DEPOSIT,
                amount: Number(amount),
                balanceAfter: Number(updatedAccount.balance),
                description: `Deposit to account ${updatedAccount.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
            });
            await transactionRepository.save(transaction);

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
            const accountRepository = getDataSource().getRepository(Account);
            const transactionRepository = getDataSource().getRepository(Transaction);
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

            // Create transaction record
            const transaction = transactionRepository.create({
                accountId: id,
                type: TransactionType.WITHDRAW,
                amount: Number(amount),
                balanceAfter: Number(updatedAccount.balance),
                description: `Withdrawal from account ${updatedAccount.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
            });
            await transactionRepository.save(transaction);

            res.json({
                message: `Successfully withdrew ${amount}`,
                data: updatedAccount,
            });
        } catch (error) {
            console.error("Error withdrawing:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // POST /api/accounts/transfer — Transfer money between accounts
    static async transfer(req: Request, res: Response): Promise<void> {
        const queryRunner = getDataSource().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const accountRepository = queryRunner.manager.getRepository(Account);
            const transactionRepository = queryRunner.manager.getRepository(Transaction);
            const { fromAccountId, toAccountId, amount } = req.body;

            // Validate required fields
            if (!fromAccountId || !toAccountId || !amount) {
                res.status(400).json({ error: "fromAccountId, toAccountId, and amount are required" });
                return;
            }

            if (Number(amount) <= 0) {
                res.status(400).json({ error: "Amount must be positive" });
                return;
            }

            if (Number(fromAccountId) === Number(toAccountId)) {
                res.status(400).json({ error: "Cannot transfer to the same account" });
                return;
            }

            // Get source account
            const fromAccount = await accountRepository.findOneBy({ id: Number(fromAccountId) });
            if (!fromAccount) {
                res.status(404).json({ error: "Source account not found" });
                return;
            }

            // Get destination account
            const toAccount = await accountRepository.findOneBy({ id: Number(toAccountId) });
            if (!toAccount) {
                res.status(404).json({ error: "Destination account not found" });
                return;
            }

            // Check sufficient balance
            if (Number(fromAccount.balance) < Number(amount)) {
                res.status(400).json({ error: "Insufficient balance" });
                return;
            }

            // Debit source account
            fromAccount.balance = Number(fromAccount.balance) - Number(amount);
            await accountRepository.save(fromAccount);

            // Credit destination account
            toAccount.balance = Number(toAccount.balance) + Number(amount);
            await accountRepository.save(toAccount);

            // Create TRANSFER_OUT transaction for source account
            const transferOutTransaction = transactionRepository.create({
                accountId: Number(fromAccountId),
                type: TransactionType.TRANSFER_OUT,
                amount: Number(amount),
                balanceAfter: Number(fromAccount.balance),
                description: `Transfer to account ${toAccount.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
            });
            await transactionRepository.save(transferOutTransaction);

            // Create TRANSFER_IN transaction for destination account
            const transferInTransaction = transactionRepository.create({
                accountId: Number(toAccountId),
                type: TransactionType.TRANSFER_IN,
                amount: Number(amount),
                balanceAfter: Number(toAccount.balance),
                description: `Transfer from account ${fromAccount.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
            });
            await transactionRepository.save(transferInTransaction);

            await queryRunner.commitTransaction();

            res.json({
                message: `Successfully transferred ${amount} to account ${toAccount.accountNumber}`,
                data: {
                    fromAccount: fromAccount,
                    toAccount: toAccount,
                    transferredAmount: Number(amount),
                },
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Error transferring:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            await queryRunner.release();
        }
    }
}

