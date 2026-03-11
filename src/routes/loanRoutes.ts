import { Router } from "express";
import { LoanController } from "../controllers/LoanController";

const router = Router();

router.post("/", LoanController.create);
router.get("/", LoanController.getAll);
router.get("/user/:userId", LoanController.getByUserId);
router.get("/:id", LoanController.getById);
router.put("/:id/approve", LoanController.approve);
router.put("/:id/reject", LoanController.reject);

export default router;
