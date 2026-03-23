import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Auth routes
router.post("/login", UserController.login);

// User CRUD routes
router.post("/", UserController.create);
router.get("/", UserController.getAll);
router.get("/:id", authMiddleware, UserController.getById);
router.put("/:id", authMiddleware, UserController.update);
router.delete("/:id", UserController.delete);

// Password routes
router.post("/change-password-auth", authMiddleware, UserController.changePasswordAuth);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-code", UserController.verifyCode);
router.post("/change-password", UserController.changePassword);

export default router;

