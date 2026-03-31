import { Router } from "express";
import { verifyAdminRole, verifyToken } from "../middleware/auth";

const router = Router();

router.use(verifyToken, verifyAdminRole);

router.get("/session", (req, res) => {
    res.json({ message: "Admin session valid" });
});

export default router;
