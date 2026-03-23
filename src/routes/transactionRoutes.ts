import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";

const router = Router();

router.get("/", TransactionController.getAll);
router.get("/account/:accountId", TransactionController.getByAccountId);
router.get("/user/:userId", TransactionController.getByUserId);

export default router;
