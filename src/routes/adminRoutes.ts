import { Router, Response } from "express";
import { FindOptionsWhere, ILike } from "typeorm";
import { z } from "zod";
import { verifyAdminRole, verifyToken, AuthRequest } from "../middleware/auth";
import { getDataSource } from "../data-source";
import { User } from "../entity/User";
import { Employee } from "../entity/Employee";
import { Account } from "../entity/Account";
import { Loan, LoanStatus } from "../entity/Loan";
import { Transaction, TransactionStatus, TransactionType } from "../entity/Transaction";
import { KycRequest, KycStatus } from "../entity/KycRequest";
import { ActivityLog } from "../entity/ActivityLog";
import { EmployeeInvite } from "../entity/EmployeeInvite";
import { AdminSetting } from "../entity/AdminSetting";
import { Ticket, TicketStatus } from "../entity/Ticket";

const router = Router();
const CUSTOMER_ROLE = "Customer";

router.use(verifyToken, verifyAdminRole);

const inviteEmployeeSchema = z.object({
    email: z.email(),
    name: z.string().trim().min(2).max(100),
    department: z.string().trim().min(2).max(100),
    position: z.string().trim().min(2).max(100),
    salary: z.coerce.number().min(0),
    expiresAt: z.union([z.string(), z.null()]).optional(),
    notes: z.string().trim().max(255).optional(),
});

const employeeStatusSchema = z.object({
    isActive: z.boolean(),
});

const customerStatusSchema = z.object({
    status: z.string().trim().min(3).max(20),
});

const accountStatusSchema = z.object({
    isActive: z.boolean(),
});

const transactionFlagSchema = z.object({
    isFlagged: z.boolean(),
    reason: z.string().trim().max(255).optional(),
    status: z.enum(["Pending", "Approved", "Suspicious"]).optional(),
});

const reverseTransactionSchema = z.object({
    reason: z.string().trim().min(3).max(255),
});

const loanDecisionSchema = z.object({
    remarks: z.string().trim().max(500).optional(),
});

const kycVerifySchema = z.object({
    status: z.enum(["Verified", "Rejected"]),
    remarks: z.string().trim().max(500).optional(),
});

const settingsSchema = z.object({
    settings: z.array(
        z.object({
            settingKey: z.string().trim().min(1).max(100),
            settingValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
            description: z.string().trim().max(1000).optional(),
        })
    ).min(1),
});

function getAdminActorId(req: AuthRequest): number {
    return Number(req.user?.id || 0);
}

async function logAdminAction(req: AuthRequest, action: string, details?: string): Promise<void> {
    try {
        const activityRepository = getDataSource().getRepository(ActivityLog);
        const log = activityRepository.create({
            employeeId: getAdminActorId(req),
            action,
            details: details || null,
        });
        await activityRepository.save(log);
    } catch (error) {
        console.error("Failed to log admin action:", error);
    }
}

function sendValidationError(res: Response, message: string) {
    return res.status(400).json({ error: message });
}

router.get("/session", (req, res) => {
    const request = req as AuthRequest;
    res.json({ message: "Admin session valid", user: request.user });
});

router.get("/dashboard-stats", async (_req, res) => {
    try {
        const dataSource = getDataSource();
        const userRepository = dataSource.getRepository(User);
        const employeeRepository = dataSource.getRepository(Employee);
        const accountRepository = dataSource.getRepository(Account);
        const transactionRepository = dataSource.getRepository(Transaction);
        const loanRepository = dataSource.getRepository(Loan);

        const [totalCustomers, totalEmployees, totalAccounts, totalTransactions, pendingLoans, balanceResult, recentTransactions, summaryRows] = await Promise.all([
            userRepository.count({ where: { role: CUSTOMER_ROLE } }),
            employeeRepository.count({ where: { isActive: true } }),
            accountRepository.count(),
            transactionRepository.count(),
            loanRepository.count({ where: { status: LoanStatus.PENDING } }),
            accountRepository
                .createQueryBuilder("account")
                .select("COALESCE(SUM(account.balance), 0)", "totalBankBalance")
                .getRawOne(),
            transactionRepository.find({
                relations: { account: true },
                order: { createdAt: "DESC" },
                take: 5,
            }),
            transactionRepository
                .createQueryBuilder("transaction")
                .select("transaction.type", "type")
                .addSelect("COUNT(transaction.id)", "count")
                .addSelect("COALESCE(SUM(transaction.amount), 0)", "amount")
                .groupBy("transaction.type")
                .getRawMany(),
        ]);

        res.json({
            success: true,
            data: {
                totalCustomers,
                totalEmployees,
                totalAccounts,
                totalTransactions,
                pendingLoans,
                totalBankBalance: Number(balanceResult?.totalBankBalance || 0),
                recentTransactions: recentTransactions.map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    amount: tx.amount,
                    balanceAfter: tx.balanceAfter,
                    referenceNumber: tx.referenceNumber,
                    createdAt: tx.createdAt,
                    accountNumber: tx.account?.accountNumber || 'N/A',
                })),
                transactionSummary: summaryRows.map((row) => ({
                    type: row.type,
                    count: Number(row.count || 0),
                    amount: Number(row.amount || 0),
                })),
            },
        });
    } catch (error) {
        console.error("Admin dashboard stats error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard statistics" });
    }
});

router.post("/invite-employee", async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return sendValidationError(res, "Valid email is required");
    }

    try {
        const dataSource = getDataSource();
        const inviteRepository = dataSource.getRepository(EmployeeInvite);
        const userRepository = dataSource.getRepository(User);

        const emailLower = email.toLowerCase();
        const existingInvite = await inviteRepository.findOne({ where: { email: emailLower, status: "Pending" } });
        if (existingInvite) {
            return res.status(409).json({ success: false, message: "A pending invite already exists for this email" });
        }

        const existingUser = await userRepository.findOne({ where: { email: emailLower } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "A user with this email already exists" });
        }

        const invite = inviteRepository.create({
            email: emailLower,
            name: 'Employee',
            department: 'General',
            position: 'Employee',
            salary: 0,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            notes: `Invited to join as Employee on ${new Date().toISOString()}`,
            status: "Pending",
            createdByAdminId: getAdminActorId(req),
        });

        const savedInvite = await inviteRepository.save(invite);
        await logAdminAction(req, "INVITE_EMPLOYEE", `Employee invite sent to ${emailLower}`);

        res.status(201).json({ success: true, data: savedInvite, message: "Employee invitation sent successfully" });
    } catch (error) {
        console.error("Invite employee error:", error);
        res.status(500).json({ success: false, message: "Failed to send employee invite" });
    }
});

router.get("/invites", async (_req, res) => {
    try {
        const invites = await getDataSource().getRepository(EmployeeInvite).find({
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: invites });
    } catch (error) {
        console.error("Get invites error:", error);
        res.status(500).json({ success: false, message: "Failed to load invites" });
    }
});

router.delete("/invites/:id", async (req, res) => {
    try {
        const inviteRepository = getDataSource().getRepository(EmployeeInvite);
        const invite = await inviteRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!invite) {
            return res.status(404).json({ success: false, message: "Invite not found" });
        }

        await inviteRepository.remove(invite);
        await logAdminAction(req, "DELETE_EMPLOYEE_INVITE", `Invite for ${invite.email} deleted`);

        res.json({ success: true, data: invite, message: "Invite deleted successfully" });
    } catch (error) {
        console.error("Delete invite error:", error);
        res.status(500).json({ success: false, message: "Failed to delete invite" });
    }
});

router.get("/employees", async (_req, res) => {
    try {
        const employees = await getDataSource().getRepository(Employee).find({
            relations: { user: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: employees });
    } catch (error) {
        console.error("Get employees error:", error);
        res.status(500).json({ success: false, message: "Failed to load employees" });
    }
});

router.patch("/employees/:id/status", async (req, res) => {
    const { status } = req.body;
    const normalizedStatus = String(status || '').toUpperCase();
    const isActive = normalizedStatus === 'ACTIVE';

    try {
        const employeeRepository = getDataSource().getRepository(Employee);
        const employee = await employeeRepository.findOne({
            where: { id: Number(req.params.id) },
            relations: { user: true },
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        employee.isActive = isActive;
        const updated = await employeeRepository.save(employee);

        await logAdminAction(
            req,
            "UPDATE_EMPLOYEE_STATUS",
            `Employee ${employee.id} status changed to ${normalizedStatus}`
        );

        res.json({ success: true, data: updated, message: "Employee status updated successfully" });
    } catch (error) {
        console.error("Update employee status error:", error);
        res.status(500).json({ success: false, message: "Failed to update employee status" });
    }
});

router.get("/customers", async (_req, res) => {
    try {
        const customers = await getDataSource().getRepository(User).find({
            where: { role: CUSTOMER_ROLE },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error("Get customers error:", error);
        res.status(500).json({ success: false, message: "Failed to load customers" });
    }
});

router.get("/customers/search", async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();

        if (!q) {
            return res.json({ success: true, data: [] });
        }

        const customerRepository = getDataSource().getRepository(User);
        const where: FindOptionsWhere<User>[] = [
            { role: CUSTOMER_ROLE, name: ILike(`%${q}%`) as unknown as string },
            { role: CUSTOMER_ROLE, email: ILike(`%${q}%`) as unknown as string },
            { role: CUSTOMER_ROLE, phone: ILike(`%${q}%`) as unknown as string },
            { role: CUSTOMER_ROLE, nationalId: ILike(`%${q}%`) as unknown as string },
        ];

        const customers = await customerRepository.find({
            where,
            order: { createdAt: "DESC" },
            take: 50,
        });

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error("Search customers error:", error);
        res.status(500).json({ success: false, message: "Failed to search customers" });
    }
});

router.patch("/customers/:id/status", async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return sendValidationError(res, "Status is required");
    }

    try {
        const userRepository = getDataSource().getRepository(User);
        const customer = await userRepository.findOne({
            where: { id: Number(req.params.id), role: CUSTOMER_ROLE },
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        customer.status = status;
        const updated = await userRepository.save(customer);

        await logAdminAction(req, "UPDATE_CUSTOMER_STATUS", `Customer ${customer.id} status changed to ${customer.status}`);

        res.json({ success: true, data: updated, message: "Customer status updated successfully" });
    } catch (error) {
        console.error("Update customer status error:", error);
        res.status(500).json({ success: false, message: "Failed to update customer status" });
    }
});

router.delete("/customers/:id", async (req, res) => {
    try {
        const userRepository = getDataSource().getRepository(User);
        const customer = await userRepository.findOne({
            where: { id: Number(req.params.id), role: CUSTOMER_ROLE },
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        await userRepository.remove(customer);
        await logAdminAction(req, "DELETE_CUSTOMER", `Customer ${customer.id} deleted`);

        res.json({ success: true, data: customer, message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Delete customer error:", error);
        res.status(500).json({ success: false, message: "Failed to delete customer" });
    }
});

router.get("/accounts", async (_req, res) => {
    try {
        const accounts = await getDataSource().getRepository(Account).find({
            relations: { user: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: accounts });
    } catch (error) {
        console.error("Get accounts error:", error);
        res.status(500).json({ success: false, message: "Failed to load accounts" });
    }
});

router.patch("/accounts/:id/status", async (req, res) => {
    const { status } = req.body;
    const statusMap: Record<string, boolean> = { ACTIVE: true, INACTIVE: false, FROZEN: false, CLOSED: false };
    const normalizedStatus = String(status || '').toUpperCase();
    const isActive = statusMap[normalizedStatus];

    if (typeof isActive === 'undefined') {
        return sendValidationError(res, "Invalid status. Must be ACTIVE, INACTIVE, FROZEN, or CLOSED");
    }

    try {
        const accountRepository = getDataSource().getRepository(Account);
        const account = await accountRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        account.isActive = isActive;
        const updated = await accountRepository.save(account);

        await logAdminAction(
            req,
            "UPDATE_ACCOUNT_STATUS",
            `Account ${account.id} status changed to ${normalizedStatus}`
        );

        res.json({ success: true, data: updated, message: "Account status updated successfully" });
    } catch (error) {
        console.error("Update account status error:", error);
        res.status(500).json({ success: false, message: "Failed to update account status" });
    }
});

router.get("/transactions", async (_req, res) => {
    try {
        const transactions = await getDataSource().getRepository(Transaction).find({
            relations: { account: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({ success: false, message: "Failed to load transactions" });
    }
});

router.patch("/transactions/:id/flag", async (req, res) => {
    const { flagged, reason } = req.body;

    try {
        const transactionRepository = getDataSource().getRepository(Transaction);
        const transaction = await transactionRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        transaction.isFlagged = Boolean(flagged);
        transaction.flagReason = flagged ? (reason || "Manually flagged by admin") : null;
        transaction.status = flagged ? TransactionStatus.SUSPICIOUS : TransactionStatus.APPROVED;
        transaction.reviewedByEmployeeId = getAdminActorId(req);
        transaction.reviewedAt = new Date();

        const updated = await transactionRepository.save(transaction);

        await logAdminAction(
            req,
            "FLAG_TRANSACTION",
            `Transaction ${transaction.id} flagged=${transaction.isFlagged}`
        );

        res.json({ success: true, data: updated, message: "Transaction flag updated successfully" });
    } catch (error) {
        console.error("Flag transaction error:", error);
        res.status(500).json({ success: false, message: "Failed to update transaction flag" });
    }
});

router.post("/transactions/:id/reverse", async (req, res) => {
    const parsed = reverseTransactionSchema.safeParse(req.body);

    if (!parsed.success) {
        return sendValidationError(res, "Invalid reverse transaction payload");
    }

    try {
        const dataSource = getDataSource();
        const actorId = getAdminActorId(req);

        const result = await dataSource.transaction(async (manager) => {
            const transactionRepository = manager.getRepository(Transaction);
            const accountRepository = manager.getRepository(Account);

            const originalTransaction = await transactionRepository.findOne({
                where: { id: Number(req.params.id) },
            });

            if (!originalTransaction) {
                throw new Error("TRANSACTION_NOT_FOUND");
            }

            if ((originalTransaction.description || "").includes("Reversal for transaction")) {
                throw new Error("TRANSACTION_ALREADY_REVERSED");
            }

            const account = await accountRepository.findOne({
                where: { id: originalTransaction.accountId },
            });

            if (!account) {
                throw new Error("ACCOUNT_NOT_FOUND");
            }

            let adjustment = 0;
            let reverseType = TransactionType.DEPOSIT;

            if ([TransactionType.DEPOSIT, TransactionType.TRANSFER_IN, TransactionType.LOAN_DISBURSEMENT].includes(originalTransaction.type)) {
                adjustment = -Number(originalTransaction.amount);
                reverseType = TransactionType.WITHDRAW;
            } else {
                adjustment = Number(originalTransaction.amount);
                reverseType = TransactionType.DEPOSIT;
            }

            const nextBalance = Number(account.balance) + adjustment;
            if (nextBalance < 0) {
                throw new Error("INSUFFICIENT_BALANCE_FOR_REVERSAL");
            }

            account.balance = nextBalance;
            await accountRepository.save(account);

            const reversal = transactionRepository.create({
                accountId: account.id,
                type: reverseType,
                amount: Number(originalTransaction.amount),
                balanceAfter: nextBalance,
                description: `Reversal for transaction ${originalTransaction.referenceNumber}: ${parsed.data.reason}`,
                referenceNumber: `REV-${originalTransaction.referenceNumber}-${Date.now()}`,
                status: TransactionStatus.APPROVED,
                isFlagged: false,
                flagReason: null,
                reviewedByEmployeeId: actorId,
                reviewedAt: new Date(),
                createdByEmployeeId: actorId,
            });

            const savedReversal = await transactionRepository.save(reversal);

            originalTransaction.isFlagged = true;
            originalTransaction.flagReason = `Reversed by admin: ${parsed.data.reason}`;
            originalTransaction.reviewedByEmployeeId = actorId;
            originalTransaction.reviewedAt = new Date();
            await transactionRepository.save(originalTransaction);

            return { originalTransaction, reversal: savedReversal, account };
        });

        await logAdminAction(
            req,
            "REVERSE_TRANSACTION",
            `Transaction ${req.params.id} reversed with reversal transaction ${result.reversal.id}`
        );

        res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "TRANSACTION_NOT_FOUND") {
                return res.status(404).json({ error: "Transaction not found" });
            }

            if (error.message === "ACCOUNT_NOT_FOUND") {
                return res.status(404).json({ error: "Account not found" });
            }

            if (error.message === "TRANSACTION_ALREADY_REVERSED") {
                return res.status(409).json({ error: "Transaction already reversed" });
            }

            if (error.message === "INSUFFICIENT_BALANCE_FOR_REVERSAL") {
                return res.status(400).json({ error: "Insufficient account balance to reverse this transaction" });
            }
        }

        console.error("Reverse transaction error:", error);
        res.status(500).json({ error: "Failed to reverse transaction" });
    }
});

router.get("/loans", async (_req, res) => {
    try {
        const loans = await getDataSource().getRepository(Loan).find({
            relations: { user: true, account: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: loans });
    } catch (error) {
        console.error("Get loans error:", error);
        res.status(500).json({ success: false, message: "Failed to load loans" });
    }
});

router.put("/loans/:id/approve", async (req, res) => {
    const { remarks } = req.body;

    try {
        const dataSource = getDataSource();
        const actorId = getAdminActorId(req);

        const result = await dataSource.transaction(async (manager) => {
            const loanRepository = manager.getRepository(Loan);
            const accountRepository = manager.getRepository(Account);
            const transactionRepository = manager.getRepository(Transaction);

            const loan = await loanRepository.findOne({ where: { id: Number(req.params.id) } });

            if (!loan) {
                throw new Error("LOAN_NOT_FOUND");
            }

            if (loan.status !== LoanStatus.PENDING) {
                throw new Error("LOAN_NOT_PENDING");
            }

            const account = await accountRepository.findOne({ where: { id: loan.accountId } });
            if (!account) {
                throw new Error("ACCOUNT_NOT_FOUND");
            }

            const nextBalance = Number(account.balance) + Number(loan.amount);
            account.balance = nextBalance;
            await accountRepository.save(account);

            loan.status = LoanStatus.APPROVED;
            loan.remarks = remarks || loan.remarks || null;
            loan.reviewedByEmployeeId = actorId;
            loan.reviewedAt = new Date();
            loan.startDate = new Date();
            await loanRepository.save(loan);

            const disbursement = transactionRepository.create({
                accountId: account.id,
                type: TransactionType.LOAN_DISBURSEMENT,
                amount: Number(loan.amount),
                balanceAfter: nextBalance,
                description: `Loan approved and disbursed: ${loan.loanNumber}`,
                referenceNumber: `LOAN-${loan.loanNumber}-${Date.now()}`,
                status: TransactionStatus.APPROVED,
                isFlagged: false,
                flagReason: null,
                reviewedByEmployeeId: actorId,
                reviewedAt: new Date(),
                createdByEmployeeId: actorId,
            });

            const savedDisbursement = await transactionRepository.save(disbursement);

            return { loan, account, disbursement: savedDisbursement };
        });

        await logAdminAction(req, "APPROVE_LOAN", `Loan ${req.params.id} approved`);

        res.json({ success: true, data: result, message: "Loan approved successfully" });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "LOAN_NOT_FOUND") {
                return res.status(404).json({ success: false, message: "Loan not found" });
            }

            if (error.message === "LOAN_NOT_PENDING") {
                return res.status(400).json({ success: false, message: "Only pending loans can be approved" });
            }

            if (error.message === "ACCOUNT_NOT_FOUND") {
                return res.status(404).json({ success: false, message: "Linked account not found" });
            }
        }

        console.error("Approve loan error:", error);
        res.status(500).json({ success: false, message: "Failed to approve loan" });
    }
});

router.put("/loans/:id/reject", async (req, res) => {
    const { remarks } = req.body;

    try {
        const loanRepository = getDataSource().getRepository(Loan);
        const loan = await loanRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        if (loan.status !== LoanStatus.PENDING) {
            return res.status(400).json({ success: false, message: "Only pending loans can be rejected" });
        }

        loan.status = LoanStatus.REJECTED;
        loan.remarks = remarks || loan.remarks || null;
        loan.reviewedByEmployeeId = getAdminActorId(req);
        loan.reviewedAt = new Date();

        const updated = await loanRepository.save(loan);
        await logAdminAction(req, "REJECT_LOAN", `Loan ${loan.id} rejected`);

        res.json({ success: true, data: updated, message: "Loan rejected successfully" });
    } catch (error) {
        console.error("Reject loan error:", error);
        res.status(500).json({ success: false, message: "Failed to reject loan" });
    }
});

router.get("/kyc", async (_req, res) => {
    try {
        const requests = await getDataSource().getRepository(KycRequest).find({
            relations: { user: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error("Get KYC error:", error);
        res.status(500).json({ success: false, message: "Failed to load KYC requests" });
    }
});

router.put("/kyc/:id/verify", async (req, res) => {
    const parsed = kycVerifySchema.safeParse(req.body);

    if (!parsed.success) {
        return sendValidationError(res, "Invalid KYC verification payload");
    }

    try {
        const kycRepository = getDataSource().getRepository(KycRequest);
        const request = await kycRepository.findOne({ where: { id: Number(req.params.id) } });

        if (!request) {
            return res.status(404).json({ error: "KYC request not found" });
        }

        request.status = parsed.data.status === "Verified" ? KycStatus.VERIFIED : KycStatus.REJECTED;
        request.remarks = parsed.data.remarks || null;
        request.verifiedByEmployeeId = getAdminActorId(req);
        request.verifiedAt = new Date();

        await kycRepository.save(request);
        await logAdminAction(req, "VERIFY_KYC", `KYC ${request.id} updated to ${request.status}`);

        res.json(request);
    } catch (error) {
        console.error("Verify KYC error:", error);
        res.status(500).json({ error: "Failed to verify KYC request" });
    }
});

router.get("/fraud-alerts", async (_req, res) => {
    try {
        const suspiciousTransactions = await getDataSource().getRepository(Transaction).find({
            where: [
                { isFlagged: true },
                { status: TransactionStatus.SUSPICIOUS },
            ],
            relations: { account: true },
            order: { createdAt: "DESC" },
        });

        res.json({ success: true, data: suspiciousTransactions });
    } catch (error) {
        console.error("Get fraud alerts error:", error);
        res.status(500).json({ success: false, message: "Failed to load fraud alerts" });
    }
});

router.get("/reports", async (_req, res) => {
    try {
        const dataSource = getDataSource();
        const accountRepository = dataSource.getRepository(Account);
        const loanRepository = dataSource.getRepository(Loan);
        const transactionRepository = dataSource.getRepository(Transaction);
        const ticketRepository = dataSource.getRepository(Ticket);

        const [balanceSummary, accountTypeSummary, loanStatusSummary, transactionTypeSummary, openTickets] = await Promise.all([
            accountRepository
                .createQueryBuilder("account")
                .select("COUNT(account.id)", "totalAccounts")
                .addSelect("COALESCE(SUM(account.balance), 0)", "totalBalance")
                .addSelect("COALESCE(AVG(account.balance), 0)", "averageBalance")
                .getRawOne(),
            accountRepository
                .createQueryBuilder("account")
                .select("account.type", "type")
                .addSelect("COUNT(account.id)", "count")
                .addSelect("COALESCE(SUM(account.balance), 0)", "balance")
                .groupBy("account.type")
                .getRawMany(),
            loanRepository
                .createQueryBuilder("loan")
                .select("loan.status", "status")
                .addSelect("COUNT(loan.id)", "count")
                .addSelect("COALESCE(SUM(loan.amount), 0)", "amount")
                .groupBy("loan.status")
                .getRawMany(),
            transactionRepository
                .createQueryBuilder("transaction")
                .select("transaction.type", "type")
                .addSelect("COUNT(transaction.id)", "count")
                .addSelect("COALESCE(SUM(transaction.amount), 0)", "amount")
                .groupBy("transaction.type")
                .getRawMany(),
            ticketRepository.count({ where: { status: TicketStatus.OPEN } }),
        ]);

        res.json({
            success: true,
            data: {
                balanceSummary: {
                    totalAccounts: Number(balanceSummary?.totalAccounts || 0),
                    totalBalance: Number(balanceSummary?.totalBalance || 0),
                    averageBalance: Number(balanceSummary?.averageBalance || 0),
                },
                accountTypeSummary: accountTypeSummary.map((row) => ({
                    type: row.type,
                    count: Number(row.count || 0),
                    balance: Number(row.balance || 0),
                })),
                loanStatusSummary: loanStatusSummary.map((row) => ({
                    status: row.status,
                    count: Number(row.count || 0),
                    amount: Number(row.amount || 0),
                })),
                transactionTypeSummary: transactionTypeSummary.map((row) => ({
                    type: row.type,
                    count: Number(row.count || 0),
                    amount: Number(row.amount || 0),
                })),
                openTickets,
            },
        });
    } catch (error) {
        console.error("Get reports error:", error);
        res.status(500).json({ success: false, message: "Failed to load reports" });
    }
});

router.get("/settings", async (_req, res) => {
    try {
        const settings = await getDataSource().getRepository(AdminSetting).find({
            order: { settingKey: "ASC" },
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ success: false, message: "Failed to load settings" });
    }
});

router.put("/settings", async (req, res) => {
    const parsed = settingsSchema.safeParse(req.body);

    if (!parsed.success) {
        return sendValidationError(res, "Invalid settings payload");
    }

    try {
        const settingRepository = getDataSource().getRepository(AdminSetting);
        const actorId = getAdminActorId(req);
        const savedSettings: AdminSetting[] = [];

        for (const item of parsed.data.settings) {
            let setting = await settingRepository.findOne({ where: { settingKey: item.settingKey } });

            if (!setting) {
                setting = settingRepository.create({
                    settingKey: item.settingKey,
                });
            }

            setting.settingValue = item.settingValue === null ? null : String(item.settingValue);
            setting.description = item.description || setting.description || null;
            setting.updatedByAdminId = actorId;

            savedSettings.push(await settingRepository.save(setting));
        }

        await logAdminAction(req, "UPDATE_SETTINGS", `Updated ${savedSettings.length} admin settings`);

        res.json(savedSettings);
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ error: "Failed to update settings" });
    }
});

router.get("/logs", async (_req, res) => {
    try {
        const logs = await getDataSource().getRepository(ActivityLog).find({
            order: { createdAt: "DESC" },
            take: 200,
        });

        res.json({ success: true, data: logs });
    } catch (error) {
        console.error("Get logs error:", error);
        res.status(500).json({ success: false, message: "Failed to load logs" });
    }
});

export default router;