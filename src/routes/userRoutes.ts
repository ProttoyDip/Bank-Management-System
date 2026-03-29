import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import { validate } from '../middleware/validation';
import { userLoginSchema, userCreateSchema } from '../validators/userSchema';


const router = Router();

// Auth routes (public)
router.post("/login", validate(userLoginSchema), UserController.login);

// Staff creation (Admin only)
router.post("/staff", authMiddleware, roleMiddleware(['Admin']), validate(userCreateSchema), UserController.create);

// Protected CRUD (Admin/Employee for list)
router.get("/", authMiddleware, roleMiddleware(['Admin', 'Employee']), UserController.getAll);
router.get("/:id", authMiddleware, UserController.getById);
router.put("/:id", authMiddleware, UserController.update);
router.delete("/:id", authMiddleware, roleMiddleware(['Admin']), UserController.delete);

// Remove password routes - fix later if needed (methods missing)


export default router;

