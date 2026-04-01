import { Router } from "express";
import { EmployeeOpsController } from "../controllers/EmployeeOpsController";
import { verifyEmployeeRole, verifyToken } from "../middleware/auth";

const router = Router();

router.use(verifyToken, verifyEmployeeRole);

router.get("/dashboard-stats", EmployeeOpsController.getDashboardStats);

router.get("/accounts", EmployeeOpsController.getAccounts);
router.get("/accounts/search", EmployeeOpsController.searchAccounts);
router.put("/accounts/:id/status", EmployeeOpsController.updateAccountStatus);
router.put("/accounts/:id/customer", EmployeeOpsController.updateCustomerInfo);

router.post("/deposit", EmployeeOpsController.deposit);
router.post("/withdraw", EmployeeOpsController.withdraw);
router.post("/transfer", EmployeeOpsController.transfer);

router.get("/transactions", EmployeeOpsController.getTransactions);
router.put("/transactions/:id/status", EmployeeOpsController.reviewTransaction);

router.get("/loans", EmployeeOpsController.getLoans);
router.put("/loans/:id/approve", EmployeeOpsController.approveLoan);
router.put("/loans/:id/reject", EmployeeOpsController.rejectLoan);

router.get("/kyc", EmployeeOpsController.getKyc);
router.put("/kyc/:id/verify", EmployeeOpsController.verifyKyc);

router.get("/tickets", EmployeeOpsController.getTickets);
router.put("/tickets/:id/resolve", EmployeeOpsController.resolveTicket);

router.get("/reports", EmployeeOpsController.getReports);
router.get("/activity-logs", EmployeeOpsController.getActivityLogs);

export default router;
