import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validate } from "../middleware/validation";
import { userLoginSchema } from "../validators/userSchema";

const router = Router();

router.post("/register", UserController.registerCustomer);
router.post("/login", validate(userLoginSchema), UserController.login);

export default router;
