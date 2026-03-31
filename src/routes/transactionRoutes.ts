import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", TransactionController.getAll);
router.get("/account/:accountId", TransactionController.getByAccountId);
router.get("/user/:userId", TransactionController.getByUserId);
router.get("/my-transactions", authMiddleware, TransactionController.getMyTransactions);

export default router;
