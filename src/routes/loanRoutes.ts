import { Router } from "express";
import { LoanController } from "../controllers/LoanController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, LoanController.create);
router.get("/", authMiddleware, LoanController.getAll);
router.get("/user/:userId", authMiddleware, LoanController.getByUserId);
router.get("/:id", authMiddleware, LoanController.getById);
router.put("/:id/approve", authMiddleware, LoanController.approve);
router.put("/:id/reject", authMiddleware, LoanController.reject);

export default router;
