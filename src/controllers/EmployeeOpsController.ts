import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { AuthRequest } from "../middleware/auth";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { Transaction, TransactionStatus, TransactionType } from "../entity/Transaction";
import { Loan, LoanStatus } from "../entity/Loan";
import { KycRequest, KycStatus } from "../entity/KycRequest";
import { Ticket, TicketStatus } from "../entity/Ticket";
import { ActivityLog } from "../entity/ActivityLog";
import { generateReferenceNumber } from "../utils/helpers";
import { createRoleNotifications } from "../utils/notificationService";

const toMoneyNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const getFlagLimit = (): number => {
    const parsed = Number(process.env.FLAGGED_TRANSACTION_LIMIT ?? "100000");
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 100000;
};

const startOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const parseBoolean = (value: unknown): boolean | null => {
    if (value === undefined || value === null || value === "") return null;
    const str = String(value).trim().toLowerCase();
    if (str === "true" || str === "1") return true;
    if (str === "false" || str === "0") return false;
    return null;
};

const logEmployeeActivity = async (employeeId: number, action: string, details?: string): Promise<void> => {
    await getDataSource().getRepository(ActivityLog).save(
        getDataSource().getRepository(ActivityLog).create({
            employeeId,
            action,
            details: details || null,
        })
    );
};

export class EmployeeOpsController {
    static async getDashboardStats(_req: AuthRequest, res: Response): Promise<Response> {
        try {
            const flagLimit = getFlagLimit();
            const txRepo = getDataSource().getRepository(Transaction);
            const todayStart = startOfDay(new Date());
            const todayEnd = endOfDay(new Date());

            const [totalCustomers, totalAccounts, totalTransactionsToday, pendingLoans, flaggedTransactions] = await Promise.all([
                getDataSource().getRepository(User)
                    .createQueryBuilder("user")
                    .where("UPPER(user.role) = :role", { role: "CUSTOMER" })
                    .getCount(),
                getDataSource().getRepository(Account).count(),
                txRepo.createQueryBuilder("tx")
                    .where("tx.createdAt >= :todayStart AND tx.createdAt <= :todayEnd", { todayStart, todayEnd })
                    .getCount(),
                getDataSource().getRepository(Loan)
                    .createQueryBuilder("loan")
                    .where("UPPER(loan.status) = :status", { status: "PENDING" })
                    .getCount(),
                txRepo.createQueryBuilder("tx")
                    .where("tx.isFlagged = :flagged OR tx.amount >= :flagLimit", { flagged: true, flagLimit })
                    .getCount(),
            ]);

            return res.json({
                data: {
                    totalCustomers,
                    totalAccounts,
                    totalTransactionsToday,
                    pendingLoanApplications: pendingLoans,
                    flaggedTransactions,
                }
            });
        } catch (error) {
            console.error("Employee dashboard stats error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async getAccounts(req: Request, res: Response): Promise<Response> {
        try {
            const accountRepo = getDataSource().getRepository(Account);
            const q = String(req.query.q || "").trim();
            const qb = accountRepo
                .createQueryBuilder("account")
                .leftJoinAndSelect("account.user", "user")
                .orderBy("account.createdAt", "DESC");

            if (q) {
                const like = `%${q}%`;
                qb.where("account.accountNumber LIKE :like", { like })
                    .orWhere("user.name LIKE :like", { like })
                    .orWhere("user.email LIKE :like", { like });
            }

            const accounts = await qb.getMany();
            return res.json({ data: accounts });
        } catch (error) {
            console.error("Employee accounts fetch error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async searchAccounts(req: Request, res: Response): Promise<Response> {
        req.query.q = req.query.q ?? req.query.query;
        return EmployeeOpsController.getAccounts(req, res);
    }

    static async updateAccountStatus(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const accountId = Number(req.params.id);
            const isActive = parseBoolean(req.body?.isActive);
            if (!Number.isInteger(accountId) || accountId <= 0) {
                return res.status(400).json({ error: "Invalid account id" });
            }
            if (isActive === null) {
                return res.status(400).json({ error: "isActive must be true or false" });
            }

            const accountRepo = getDataSource().getRepository(Account);
            const account = await accountRepo.findOne({ where: { id: accountId }, relations: ["user"] });
            if (!account) {
                return res.status(404).json({ error: "Account not found" });
            }

            account.isActive = isActive;
            const updated = await accountRepo.save(account);
            await logEmployeeActivity(
                req.user!.employeeId!,
                isActive ? "Activated Account" : "Froze Account",
                `Account ${account.accountNumber}`
            );

            return res.json({ message: "Account status updated", data: updated });
        } catch (error) {
            console.error("Update account status error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async updateCustomerInfo(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const accountId = Number(req.params.id);
            if (!Number.isInteger(accountId) || accountId <= 0) {
                return res.status(400).json({ error: "Invalid account id" });
            }

            const allowedFields: Array<keyof User> = ["name", "email", "phone", "address"];
            const updates: Partial<User> = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    (updates[field] as unknown) = req.body[field];
                }
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: "No valid customer fields provided" });
            }

            const account = await getDataSource().getRepository(Account).findOne({
                where: { id: accountId },
                relations: ["user"],
            });
            if (!account || !account.user) {
                return res.status(404).json({ error: "Account or customer not found" });
            }

            if (updates.email) {
                updates.email = String(updates.email).trim().toLowerCase();
            }
            Object.assign(account.user, updates);
            const savedUser = await getDataSource().getRepository(User).save(account.user);

            await logEmployeeActivity(
                req.user!.employeeId!,
                "Updated Customer Info",
                `Customer ${savedUser.id} via account ${account.accountNumber}`
            );

            return res.json({ message: "Customer info updated", data: savedUser });
        } catch (error) {
            console.error("Update customer info error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async deposit(req: AuthRequest, res: Response): Promise<Response> {
        const queryRunner = getDataSource().createQueryRunner();
        try {
            const accountNumber = String(req.body?.accountNumber || "").trim();
            const amount = toMoneyNumber(req.body?.amount);
            const description = String(req.body?.description || "").trim();

            if (!accountNumber || !Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({ error: "accountNumber and positive amount are required" });
            }

            await queryRunner.connect();
            await queryRunner.startTransaction();

            const account = await queryRunner.manager.findOne(Account, { where: { accountNumber }, relations: ["user"] });
            if (!account) {
                await queryRunner.rollbackTransaction();
                return res.status(404).json({ error: "Account not found" });
            }
            if (!account.isActive) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({ error: "Account is frozen" });
            }

            const nextBalance = toMoneyNumber(account.balance) + amount;
            account.balance = nextBalance;
            await queryRunner.manager.save(account);

            const flagLimit = getFlagLimit();
            const isFlagged = amount >= flagLimit;
            const tx = queryRunner.manager.create(Transaction, {
                accountId: account.id,
                type: TransactionType.DEPOSIT,
                amount,
                balanceAfter: nextBalance,
                description: description || `Counter deposit for ${account.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
                status: isFlagged ? TransactionStatus.PENDING : TransactionStatus.APPROVED,
                isFlagged,
                flagReason: isFlagged ? `Amount exceeded limit (${flagLimit})` : null,
                createdByEmployeeId: req.user!.employeeId!,
            });
            const savedTx = await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();

            await logEmployeeActivity(
                req.user!.employeeId!,
                "Processed Deposit",
                `Account ${account.accountNumber}, amount ${amount}`
            );

            return res.json({ message: "Deposit successful", data: savedTx });
        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
            console.error("Employee deposit error:", error);
            return res.status(500).json({ error: "Internal server error" });
        } finally {
            if (!queryRunner.isReleased) await queryRunner.release();
        }
    }

    static async withdraw(req: AuthRequest, res: Response): Promise<Response> {
        const queryRunner = getDataSource().createQueryRunner();
        try {
            const accountNumber = String(req.body?.accountNumber || "").trim();
            const amount = toMoneyNumber(req.body?.amount);
            const description = String(req.body?.description || "").trim();

            if (!accountNumber || !Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({ error: "accountNumber and positive amount are required" });
            }

            await queryRunner.connect();
            await queryRunner.startTransaction();

            const account = await queryRunner.manager.findOne(Account, { where: { accountNumber }, relations: ["user"] });
            if (!account) {
                await queryRunner.rollbackTransaction();
                return res.status(404).json({ error: "Account not found" });
            }
            if (!account.isActive) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({ error: "Account is frozen" });
            }

            const currentBalance = toMoneyNumber(account.balance);
            if (currentBalance < amount) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({ error: "Insufficient balance" });
            }

            const nextBalance = currentBalance - amount;
            account.balance = nextBalance;
            await queryRunner.manager.save(account);

            const flagLimit = getFlagLimit();
            const isFlagged = amount >= flagLimit;
            const tx = queryRunner.manager.create(Transaction, {
                accountId: account.id,
                type: TransactionType.WITHDRAW,
                amount,
                balanceAfter: nextBalance,
                description: description || `Counter withdrawal for ${account.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
                status: isFlagged ? TransactionStatus.PENDING : TransactionStatus.APPROVED,
                isFlagged,
                flagReason: isFlagged ? `Amount exceeded limit (${flagLimit})` : null,
                createdByEmployeeId: req.user!.employeeId!,
            });
            const savedTx = await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();

            await logEmployeeActivity(
                req.user!.employeeId!,
                "Processed Withdrawal",
                `Account ${account.accountNumber}, amount ${amount}`
            );

            return res.json({ message: "Withdrawal successful", data: savedTx });
        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
            console.error("Employee withdraw error:", error);
            return res.status(500).json({ error: "Internal server error" });
        } finally {
            if (!queryRunner.isReleased) await queryRunner.release();
        }
    }

    static async getTransactions(req: Request, res: Response): Promise<Response> {
        try {
            const date = String(req.query.date || "").trim();
            const type = String(req.query.type || "").trim();
            const status = String(req.query.status || "").trim();
            const flagged = parseBoolean(req.query.flagged);
            const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);

            const txRepo = getDataSource().getRepository(Transaction);
            const qb = txRepo
                .createQueryBuilder("tx")
                .leftJoinAndSelect("tx.account", "account")
                .leftJoinAndSelect("account.user", "user")
                .orderBy("tx.createdAt", "DESC")
                .take(limit);

            if (date) {
                const parsedDate = new Date(date);
                if (Number.isNaN(parsedDate.getTime())) {
                    return res.status(400).json({ error: "Invalid date format" });
                }
                qb.andWhere("tx.createdAt >= :start AND tx.createdAt <= :end", {
                    start: startOfDay(parsedDate),
                    end: endOfDay(parsedDate),
                });
            }

            if (type) {
                const normalized = type.toLowerCase();
                if (normalized === "transfer") {
                    qb.andWhere("tx.type IN (:...types)", { types: [TransactionType.TRANSFER_IN, TransactionType.TRANSFER_OUT] });
                } else if (normalized === "deposit") {
                    qb.andWhere("tx.type = :txType", { txType: TransactionType.DEPOSIT });
                } else if (normalized === "withdraw") {
                    qb.andWhere("tx.type = :txType", { txType: TransactionType.WITHDRAW });
                } else {
                    qb.andWhere("tx.type = :txType", { txType: type });
                }
            }

            if (status) {
                qb.andWhere("UPPER(tx.status) = :status", { status: status.toUpperCase() });
            }

            if (flagged !== null) {
                qb.andWhere("tx.isFlagged = :flagged", { flagged });
            }

            const transactions = await qb.getMany();
            return res.json({ data: transactions });
        } catch (error) {
            console.error("Employee get transactions error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async reviewTransaction(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const transactionId = Number(req.params.id);
            const status = String(req.body?.status || "").trim();
            const remarks = String(req.body?.remarks || "").trim();
            const normalized = status.toLowerCase();

            if (!Number.isInteger(transactionId) || transactionId <= 0) {
                return res.status(400).json({ error: "Invalid transaction id" });
            }
            if (normalized !== "approved" && normalized !== "suspicious") {
                return res.status(400).json({ error: "status must be Approved or Suspicious" });
            }

            const txRepo = getDataSource().getRepository(Transaction);
            const tx = await txRepo.findOne({ where: { id: transactionId }, relations: ["account"] });
            if (!tx) {
                return res.status(404).json({ error: "Transaction not found" });
            }

            const nextStatus = normalized === "approved" ? TransactionStatus.APPROVED : TransactionStatus.SUSPICIOUS;
            tx.status = nextStatus;
            tx.reviewedByEmployeeId = req.user!.employeeId!;
            tx.reviewedAt = new Date();
            tx.isFlagged = nextStatus === TransactionStatus.SUSPICIOUS ? true : tx.isFlagged;
            tx.flagReason = remarks || tx.flagReason;
            const updated = await txRepo.save(tx);

            await logEmployeeActivity(
                req.user!.employeeId!,
                nextStatus === TransactionStatus.APPROVED ? "Approved Transaction" : "Marked Suspicious Transaction",
                `TX ${tx.referenceNumber}`
            );

            return res.json({ message: "Transaction status updated", data: updated });
        } catch (error) {
            console.error("Review transaction error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async transfer(req: AuthRequest, res: Response): Promise<Response> {
        const queryRunner = getDataSource().createQueryRunner();
        try {
            const senderAccountNumber = String(req.body?.senderAccountNumber || "").trim();
            const receiverAccountNumber = String(req.body?.receiverAccountNumber || "").trim();
            const amount = toMoneyNumber(req.body?.amount);
            const description = String(req.body?.description || "").trim();

            if (!senderAccountNumber || !receiverAccountNumber || !Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({ error: "senderAccountNumber, receiverAccountNumber, amount are required" });
            }
            if (senderAccountNumber === receiverAccountNumber) {
                return res.status(400).json({ error: "Cannot transfer to the same account" });
            }

            await queryRunner.connect();
            await queryRunner.startTransaction();

            const fromAccount = await queryRunner.manager.findOne(Account, {
                where: { accountNumber: senderAccountNumber },
                relations: ["user"],
            });
            const toAccount = await queryRunner.manager.findOne(Account, {
                where: { accountNumber: receiverAccountNumber },
                relations: ["user"],
            });

            if (!fromAccount || !toAccount) {
                await queryRunner.rollbackTransaction();
                return res.status(404).json({ error: "One or both accounts not found" });
            }
            if (!fromAccount.isActive || !toAccount.isActive) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({ error: "Sender or receiver account is frozen" });
            }

            const senderBalance = toMoneyNumber(fromAccount.balance);
            if (senderBalance < amount) {
                await queryRunner.rollbackTransaction();
                return res.status(400).json({ error: "Insufficient balance in sender account" });
            }

            fromAccount.balance = senderBalance - amount;
            toAccount.balance = toMoneyNumber(toAccount.balance) + amount;
            await queryRunner.manager.save([fromAccount, toAccount]);

            const flagLimit = getFlagLimit();
            const isFlagged = amount >= flagLimit;
            const transferStatus = isFlagged ? TransactionStatus.PENDING : TransactionStatus.APPROVED;

            const outTx = queryRunner.manager.create(Transaction, {
                accountId: fromAccount.id,
                type: TransactionType.TRANSFER_OUT,
                amount,
                balanceAfter: fromAccount.balance,
                description: description || `Transfer to ${toAccount.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
                status: transferStatus,
                isFlagged,
                flagReason: isFlagged ? `Amount exceeded limit (${flagLimit})` : null,
                createdByEmployeeId: req.user!.employeeId!,
            });
            const inTx = queryRunner.manager.create(Transaction, {
                accountId: toAccount.id,
                type: TransactionType.TRANSFER_IN,
                amount,
                balanceAfter: toAccount.balance,
                description: description || `Transfer from ${fromAccount.accountNumber}`,
                referenceNumber: generateReferenceNumber(),
                status: transferStatus,
                isFlagged,
                flagReason: isFlagged ? `Amount exceeded limit (${flagLimit})` : null,
                createdByEmployeeId: req.user!.employeeId!,
            });

            const savedTransactions = await queryRunner.manager.save([outTx, inTx]);
            await queryRunner.commitTransaction();

            await logEmployeeActivity(
                req.user!.employeeId!,
                "Processed Transfer",
                `${fromAccount.accountNumber} -> ${toAccount.accountNumber}, amount ${amount}`
            );

            return res.json({
                message: "Transfer successful",
                data: {
                    senderAccount: fromAccount.accountNumber,
                    receiverAccount: toAccount.accountNumber,
                    amount,
                    transactions: savedTransactions,
                }
            });
        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
            console.error("Employee transfer error:", error);
            return res.status(500).json({ error: "Internal server error" });
        } finally {
            if (!queryRunner.isReleased) await queryRunner.release();
        }
    }

    static async getLoans(req: Request, res: Response): Promise<Response> {
        try {
            const status = String(req.query.status || "").trim();
            const loanRepo = getDataSource().getRepository(Loan);
            const qb = loanRepo
                .createQueryBuilder("loan")
                .leftJoinAndSelect("loan.user", "user")
                .leftJoinAndSelect("loan.account", "account")
                .orderBy("loan.createdAt", "DESC");

            if (status) {
                qb.where("UPPER(loan.status) = :status", { status: status.toUpperCase() });
            }

            const loans = await qb.getMany();
            return res.json({ data: loans });
        } catch (error) {
            console.error("Employee loans fetch error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    private static async updateLoanStatus(req: AuthRequest, res: Response, status: LoanStatus): Promise<Response> {
        try {
            const loanId = Number(req.params.id);
            const remarks = String(req.body?.remarks || "").trim();
            if (!Number.isInteger(loanId) || loanId <= 0) {
                return res.status(400).json({ error: "Invalid loan id" });
            }

            const loanRepo = getDataSource().getRepository(Loan);
            const loan = await loanRepo.findOneBy({ id: loanId });
            if (!loan) {
                return res.status(404).json({ error: "Loan not found" });
            }
            if (String(loan.status).toLowerCase() !== LoanStatus.PENDING.toLowerCase()) {
                return res.status(400).json({ error: "Only pending loans can be reviewed" });
            }

            loan.status = status;
            loan.remarks = remarks || loan.remarks;
            loan.reviewedByEmployeeId = req.user!.employeeId!;
            loan.reviewedAt = new Date();
            if (status === LoanStatus.UNDER_REVIEW_ADMIN) {
                loan.startDate = null;
                loan.endDate = null;
            }

            const updated = await loanRepo.save(loan);
            if (status === LoanStatus.UNDER_REVIEW_ADMIN) {
                await createRoleNotifications(
                    "Admin",
                    `Loan ${loan.loanNumber} is employee-approved and awaiting admin decision.`,
                    "loan"
                );
            }
            await logEmployeeActivity(
                req.user!.employeeId!,
                status === LoanStatus.UNDER_REVIEW_ADMIN ? "Forwarded Loan To Admin Review" : "Rejected Loan",
                `Loan ${loan.loanNumber}`
            );

            return res.json({ message: `Loan ${status.toLowerCase()}`, data: updated });
        } catch (error) {
            console.error("Employee update loan status error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async approveLoan(req: AuthRequest, res: Response): Promise<Response> {
        return EmployeeOpsController.updateLoanStatus(req, res, LoanStatus.UNDER_REVIEW_ADMIN);
    }

    static async rejectLoan(req: AuthRequest, res: Response): Promise<Response> {
        return EmployeeOpsController.updateLoanStatus(req, res, LoanStatus.REJECTED);
    }

    static async getKyc(req: Request, res: Response): Promise<Response> {
        try {
            const status = String(req.query.status || "").trim() || KycStatus.PENDING;
            const rows = await getDataSource().getRepository(KycRequest).find({
                where: { status },
                relations: ["user"],
                order: { createdAt: "DESC" }
            });
            return res.json({ data: rows });
        } catch (error) {
            console.error("Employee get KYC error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async verifyKyc(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const remarks = String(req.body?.remarks || "").trim();
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ error: "Invalid KYC id" });
            }

            const repo = getDataSource().getRepository(KycRequest);
            const row = await repo.findOneBy({ id });
            if (!row) {
                return res.status(404).json({ success: false, message: "KYC request not found" });
            }

            if (row.status !== KycStatus.PENDING) {
                return res.status(400).json({ success: false, message: "Only pending KYC can be employee-approved" });
            }

            row.status = KycStatus.EMPLOYEE_APPROVED;
            row.remarks = remarks || row.remarks;
            row.verifiedByEmployeeId = req.user!.employeeId!;
            row.verifiedAt = new Date();
            const updated = await repo.save(row);
            await createRoleNotifications(
                "Admin",
                `KYC ${row.id} was employee-approved and is awaiting final admin verification.`,
                "kyc"
            );

            await logEmployeeActivity(req.user!.employeeId!, "Employee Approved KYC", `KYC ${id}`);
            return res.json({ success: true, message: "KYC employee-approved", data: updated });
        } catch (error) {
            console.error("Verify KYC error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async getTickets(req: Request, res: Response): Promise<Response> {
        try {
            const status = String(req.query.status || "").trim();
            const repo = getDataSource().getRepository(Ticket);
            const qb = repo
                .createQueryBuilder("ticket")
                .leftJoinAndSelect("ticket.user", "user")
                .orderBy("ticket.createdAt", "DESC");

            if (status) {
                qb.where("UPPER(ticket.status) = :status", { status: status.toUpperCase() });
            }

            const tickets = await qb.getMany();
            return res.json({ data: tickets });
        } catch (error) {
            console.error("Get tickets error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async resolveTicket(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            const responseText = String(req.body?.response || "").trim();
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ error: "Invalid ticket id" });
            }
            if (!responseText) {
                return res.status(400).json({ error: "response is required" });
            }

            const repo = getDataSource().getRepository(Ticket);
            const ticket = await repo.findOneBy({ id });
            if (!ticket) {
                return res.status(404).json({ error: "Ticket not found" });
            }

            ticket.status = TicketStatus.RESOLVED;
            ticket.response = responseText;
            ticket.resolvedByEmployeeId = req.user!.employeeId!;
            ticket.resolvedAt = new Date();
            const updated = await repo.save(ticket);

            await logEmployeeActivity(req.user!.employeeId!, "Resolved Support Ticket", `Ticket ${id}`);
            return res.json({ message: "Ticket resolved", data: updated });
        } catch (error) {
            console.error("Resolve ticket error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async getReports(_req: Request, res: Response): Promise<Response> {
        try {
            const txRepo = getDataSource().getRepository(Transaction);
            const loanRepo = getDataSource().getRepository(Loan);
            const now = new Date();
            const todayStart = startOfDay(now);
            const todayEnd = endOfDay(now);

            const todayTransactions = await txRepo.createQueryBuilder("tx")
                .where("tx.createdAt >= :start AND tx.createdAt <= :end", { start: todayStart, end: todayEnd })
                .getMany();

            const dailyReport = {
                date: todayStart.toISOString().slice(0, 10),
                totalCount: todayTransactions.length,
                totalAmount: todayTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
                byType: {
                    deposit: todayTransactions.filter((tx) => tx.type === TransactionType.DEPOSIT).length,
                    withdraw: todayTransactions.filter((tx) => tx.type === TransactionType.WITHDRAW).length,
                    transfer: todayTransactions.filter((tx) =>
                        tx.type === TransactionType.TRANSFER_IN || tx.type === TransactionType.TRANSFER_OUT
                    ).length,
                }
            };

            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const monthlyTx = await txRepo.createQueryBuilder("tx")
                .where("tx.createdAt >= :start AND tx.createdAt < :end", { start: currentMonthStart, end: nextMonthStart })
                .getMany();

            const monthlySummary = {
                month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
                totalCount: monthlyTx.length,
                totalAmount: monthlyTx.reduce((sum, tx) => sum + Number(tx.amount), 0),
                deposits: monthlyTx.filter((tx) => tx.type === TransactionType.DEPOSIT).reduce((sum, tx) => sum + Number(tx.amount), 0),
                withdrawals: monthlyTx.filter((tx) => tx.type === TransactionType.WITHDRAW).reduce((sum, tx) => sum + Number(tx.amount), 0),
                transfers: monthlyTx.filter((tx) => tx.type === TransactionType.TRANSFER_IN || tx.type === TransactionType.TRANSFER_OUT)
                    .reduce((sum, tx) => sum + Number(tx.amount), 0),
            };

            const allLoans = await loanRepo.find();
            const loanStatistics = {
                totalApplications: allLoans.length,
                pending: allLoans.filter((l) => String(l.status).toLowerCase() === LoanStatus.PENDING.toLowerCase()).length,
                approved: allLoans.filter((l) => String(l.status).toLowerCase() === LoanStatus.APPROVED.toLowerCase()).length,
                rejected: allLoans.filter((l) => String(l.status).toLowerCase() === LoanStatus.REJECTED.toLowerCase()).length,
                totalLoanAmount: allLoans.reduce((sum, l) => sum + Number(l.amount), 0),
            };

            const last7Days: Array<{ date: string; totalCount: number; totalAmount: number }> = [];
            for (let i = 6; i >= 0; i--) {
                const day = new Date(now);
                day.setDate(now.getDate() - i);
                const start = startOfDay(day);
                const end = endOfDay(day);
                const txs = await txRepo.createQueryBuilder("tx")
                    .where("tx.createdAt >= :start AND tx.createdAt <= :end", { start, end })
                    .getMany();
                last7Days.push({
                    date: start.toISOString().slice(0, 10),
                    totalCount: txs.length,
                    totalAmount: txs.reduce((sum, tx) => sum + Number(tx.amount), 0),
                });
            }

            return res.json({
                data: {
                    dailyReport,
                    monthlySummary,
                    loanStatistics,
                    trendLast7Days: last7Days,
                }
            });
        } catch (error) {
            console.error("Employee reports error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async getActivityLogs(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 300);
            const logs = await getDataSource().getRepository(ActivityLog).find({
                where: { employeeId: req.user!.employeeId! },
                order: { createdAt: "DESC" },
                take: limit,
            });
            return res.json({ data: logs });
        } catch (error) {
            console.error("Get activity logs error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
