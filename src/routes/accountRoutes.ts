import { Router } from "express";
import { AccountController } from "../controllers/AccountController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Account CRUD
router.post("/", authMiddleware, AccountController.create);
router.get("/", authMiddleware, AccountController.getAll);
router.get("/my-account", authMiddleware, AccountController.getMyAccount);
router.get("/my-accounts", authMiddleware, AccountController.getMyAccounts);
router.get("/search", authMiddleware, AccountController.searchByAccountNumber);
router.get("/by-account-number/:accountNumber", authMiddleware, AccountController.getByAccountNumber);
router.get("/user/:userId", authMiddleware, AccountController.getByUserId);
router.get("/:id", authMiddleware, AccountController.getById);

// Transactions
router.post("/:id/deposit", authMiddleware, AccountController.deposit);
router.post("/:id/withdraw", authMiddleware, AccountController.withdraw);
router.post("/transfer", authMiddleware, AccountController.transfer);

export default router;
