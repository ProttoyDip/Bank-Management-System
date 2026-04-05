import { Request, Response } from "express";
import { getDataSource } from "../data-source";
import { Loan, LoanStatus, LoanType } from "../entity/Loan";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { generateLoanNumber, calculateEMI } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import { createRoleNotifications } from "../utils/notificationService";

export class LoanController {
    // POST /api/loans — Create a new loan
    static async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const loanRepository = getDataSource().getRepository(Loan);
            const userRepository = getDataSource().getRepository(User);
            const accountRepository = getDataSource().getRepository(Account);
            const { type, amount, interestRate, duration } = req.body;

            const tokenUserId = req.user?.id;
            const tokenRole = req.user?.role;
            let userId = Number(req.body.userId);
            let accountId = Number(req.body.accountId);

            if (!tokenUserId) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            if (tokenRole === "Customer") {
                userId = tokenUserId;
            }

            if (!amount || !interestRate || !duration) {
                res.status(400).json({ error: "amount, interestRate, and duration are required" });
                return;
            }

            // Validate loan type
            const validTypes = Object.values(LoanType);
            if (type && !validTypes.includes(type)) {
                res.status(400).json({
                    error: `Invalid loan type. Must be one of: ${validTypes.join(", ")}`,
                });
                return;
            }

            // Check if user exists
            const user = await userRepository.findOneBy({ id: userId });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (!accountId && tokenRole === "Customer") {
                const defaultAccount = await accountRepository.findOne({
                    where: { userId, isActive: true },
                    order: { createdAt: "ASC" }
                });
                if (!defaultAccount) {
                    res.status(404).json({ error: "No active account found for this user" });
                    return;
                }
                accountId = defaultAccount.id;
            }

            // Check if account exists
            const account = await accountRepository.findOneBy({ id: accountId });
            if (!account) {
                res.status(404).json({ error: "Account not found" });
                return;
            }

            if (tokenRole === "Customer" && account.userId !== tokenUserId) {
                res.status(403).json({ error: "You can only apply loan against your own account" });
                return;
            }

            const monthlyPayment = calculateEMI(Number(amount), Number(interestRate), Number(duration));

            const loan = loanRepository.create({
                loanNumber: generateLoanNumber(),
                userId,
                accountId,
                type: type || LoanType.PERSONAL,
                amount,
                interestRate,
                duration,
                monthlyPayment: Math.round(monthlyPayment * 100) / 100,
                remainingBalance: amount,
                status: LoanStatus.PENDING,
                startDate: null,
                endDate: null,
            });

            const savedLoan = await loanRepository.save(loan);
            await createRoleNotifications(
                "Employee",
                `New loan application ${savedLoan.loanNumber} requires employee review.`,
                "loan"
            );

            res.status(201).json({
                message: "Loan application created successfully",
                data: savedLoan,
            });
        } catch (error) {
            console.error("Error creating loan:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/loans — Get all loans
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const loanRepository = getDataSource().getRepository(Loan);
            const loans = await loanRepository.find({ relations: ["user", "account"] });
            res.json({ data: loans });
        } catch (error) {
            console.error("Error fetching loans:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/loans/user/:userId — Get loans by user ID
    static async getByUserId(req: Request, res: Response): Promise<void> {
        try {
            const loanRepository = getDataSource().getRepository(Loan);
            const userId = parseInt(req.params.userId as string);

            if (isNaN(userId)) {
                res.status(400).json({ error: "Invalid user ID" });
                return;
            }

            const loans = await loanRepository.find({
                where: { userId },
                relations: ["user", "account"],
            });

            res.json({ data: loans });
        } catch (error) {
            console.error("Error fetching loans by user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /api/loans/:id — Get loan by ID
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const loanRepository = getDataSource().getRepository(Loan);
            const id = parseInt(req.params.id as string);

            if (isNaN(id)) {
                res.status(400).json({ error: "Invalid loan ID" });
                return;
            }

            const loan = await loanRepository.findOne({
                where: { id },
                relations: ["user", "account"],
            });

            if (!loan) {
                res.status(404).json({ error: "Loan not found" });
                return;
            }

            res.json({ data: loan });
        } catch (error) {
            console.error("Error fetching loan:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // PUT /api/loans/:id/approve — Approve a pending loan
    static async approve(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            error: "Direct loan approval is disabled. Use employee review then admin approval flow.",
        });
    }

    // PUT /api/loans/:id/reject — Reject a pending loan
    static async reject(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            error: "Direct loan rejection is disabled. Use employee review workflow.",
        });
    }
}
