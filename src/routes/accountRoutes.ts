import { Router } from "express";
import { AccountController } from "../controllers/AccountController";

const router = Router();

router.post("/", AccountController.create);
router.get("/", AccountController.getAll);
router.get("/:id", AccountController.getById);
router.post("/:id/deposit", AccountController.deposit);
router.post("/:id/withdraw", AccountController.withdraw);

export default router;
