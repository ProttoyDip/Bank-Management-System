import { Router } from "express";
import { CardController } from "../controllers/CardController";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Customer routes
router.post("/apply", verifyToken, (req, res) => 
    CardController.applyForCard(req as any, res)
);

router.get("/my-card", verifyToken, (req, res) => 
    CardController.getMyCard(req as any, res)
);

router.get("/application-status", verifyToken, (req, res) => 
    CardController.getApplicationStatus(req as any, res)
);

// Admin routes
router.get("/applications", verifyToken, (req, res) => 
    CardController.getAllApplications(req as any, res)
);

router.get("/stats", verifyToken, (req, res) => 
    CardController.getApplicationStats(req as any, res)
);

router.post("/approve/:id", verifyToken, (req, res) => 
    CardController.approveApplication(req as any, res)
);

router.post("/reject/:id", verifyToken, (req, res) => 
    CardController.rejectApplication(req as any, res)
);

export default router;
