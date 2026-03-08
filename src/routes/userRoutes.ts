import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

// Auth routes
router.post("/login", UserController.login);

// User CRUD routes
router.post("/", UserController.create);
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

// Password reset routes
router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-code", UserController.verifyCode);
router.post("/change-password", UserController.changePassword);

export default router;
