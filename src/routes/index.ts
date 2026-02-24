import { Router } from "express";
import userRoutes from "./userRoutes";
import accountRoutes from "./accountRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);

export default router;
