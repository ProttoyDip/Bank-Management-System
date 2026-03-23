import { Router } from "express";
import { AccountController } from "../controllers/AccountController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Account CRUD
router.post("/", AccountController.create);
router.get("/", AccountController.getAll);
router.get("/by-account-number/:accountNumber", AccountController.getByAccountNumber);
router.get("/user/:userId", AccountController.getByUserId);
router.get("/:id", AccountController.getById);

// Transactions
router.post("/:id/deposit", authMiddleware, AccountController.deposit);
router.post("/:id/withdraw", authMiddleware, AccountController.withdraw);
router.post("/transfer", authMiddleware, AccountController.transfer);

export default router;