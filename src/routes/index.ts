import { Router } from "express";
import userRoutes from "./userRoutes";
import accountRoutes from "./accountRoutes";
import loanRoutes from "./loanRoutes";
import transactionRoutes from "./transactionRoutes";
import testEmailRoute from "./testEmailRoute";
import seedRoutes from "./seedRoutes";
import employeeRoutes from "./employeeRoutes";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";
import kycRoutes from "./kycRoutes";
import notificationRoutes from "./notificationRoutes";

const router = Router();

router.get("/", (_req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API - Bank Management System</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
            .container { max-width: 700px; width: 100%; padding: 40px; }
            h1 { font-size: 1.8rem; color: #38bdf8; margin-bottom: 24px; }
            .back { color: #94a3b8; text-decoration: none; font-size: 0.85rem; display: inline-block; margin-bottom: 20px; }
            .back:hover { color: #38bdf8; }
            .section { background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
            .section h3 { color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
            .row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 6px; background: #0f172a; border-radius: 8px; }
            .row:last-child { margin-bottom: 0; }
            .method { padding: 3px 10px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; min-width: 56px; text-align: center; }
            .get { background: #065f46; color: #34d399; }
            .post { background: #713f12; color: #fbbf24; }
            .put { background: #1e3a5f; color: #60a5fa; }
            .delete { background: #7f1d1d; color: #f87171; }
            .row a { color: #e2e8f0; text-decoration: none; font-family: monospace; font-size: 0.9rem; }
            .row a:hover { color: #38bdf8; text-decoration: underline; }
            .desc { color: #64748b; font-size: 0.8rem; margin-left: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <a class="back" href="/">&larr; Back to Home</a>
            <h1>API Reference</h1>

            <div class="section">
                <h3>Users</h3>
                <div class="row"><span class="method post">POST</span><a href="/api/users">/api/users</a><span class="desc">Create user</span></div>
                <div class="row"><span class="method get">GET</span><a href="/api/users">/api/users</a><span class="desc">List all users</span></div>
                <div class="row"><span class="method get">GET</span><a>/api/users/:id</a><span class="desc">Get user by ID</span></div>
                <div class="row"><span class="method put">PUT</span><a>/api/users/:id</a><span class="desc">Update user</span></div>
                <div class="row"><span class="method delete">DELETE</span><a>/api/users/:id</a><span class="desc">Delete user</span></div>
            </div>

            <div class="section">
                <h3>Accounts</h3>
                <div class="row"><span class="method post">POST</span><a href="/api/accounts">/api/accounts</a><span class="desc">Create account</span></div>
                <div class="row"><span class="method get">GET</span><a href="/api/accounts">/api/accounts</a><span class="desc">List all accounts</span></div>
                <div class="row"><span class="method get">GET</span><a>/api/accounts/:id</a><span class="desc">Get account by ID</span></div>
                <div class="row"><span class="method post">POST</span><a>/api/accounts/:id/deposit</a><span class="desc">Deposit money</span></div>
                <div class="row"><span class="method post">POST</span><a>/api/accounts/:id/withdraw</a><span class="desc">Withdraw money</span></div>
            </div>

            <div class="section">
                <h3>Loans</h3>
                <div class="row"><span class="method post">POST</span><a href="/api/loans">/api/loans</a><span class="desc">Apply for a loan</span></div>
                <div class="row"><span class="method get">GET</span><a href="/api/loans">/api/loans</a><span class="desc">List all loans</span></div>
                <div class="row"><span class="method get">GET</span><a>/api/loans/:id</a><span class="desc">Get loan by ID</span></div>
                <div class="row"><span class="method put">PUT</span><a>/api/loans/:id/approve</a><span class="desc">Approve a loan</span></div>
                <div class="row"><span class="method put">PUT</span><a>/api/loans/:id/reject</a><span class="desc">Reject a loan</span></div>
            </div>

            <div class="section">
                <h3>Transactions</h3>
                <div class="row"><span class="method get">GET</span><a href="/api/transactions">/api/transactions</a><span class="desc">List all transactions</span></div>
                <div class="row"><span class="method get">GET</span><a>/api/transactions/account/:accountId</a><span class="desc">Transactions by account</span></div>
            </div>
        </div>
    </body>
    </html>
    `);
});

router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/loans", loanRoutes);
router.use("/transactions", transactionRoutes);
router.use(testEmailRoute);
router.use("/seed", seedRoutes);
router.use("/employee", employeeRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/kyc", kycRoutes);
router.use("/notifications", notificationRoutes);

export default router;
