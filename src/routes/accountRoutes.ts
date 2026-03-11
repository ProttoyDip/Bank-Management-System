import { Router } from "express";
import { AccountController } from "../controllers/AccountController";

const router = Router();

router.post("/", AccountController.create);
router.get("/", AccountController.getAll);
router.get("/by-account-number/:accountNumber", AccountController.getByAccountNumber);
router.get("/user/:userId", AccountController.getByUserId);
router.get("/:id", AccountController.getById);
router.post("/:id/deposit", AccountController.deposit);
router.post("/:id/withdraw", AccountController.withdraw);
router.post("/transfer", AccountController.transfer);

export default router;
