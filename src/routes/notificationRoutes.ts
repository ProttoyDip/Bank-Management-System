import { Request, Response, Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { subscribeToNotifications } from "../utils/notificationHub";

const router = Router();

router.use(authMiddleware);

router.get("/stream", (req: Request, res: Response) => {
    const request = req as AuthRequest;
    const role = String(request.user?.role || "").trim();
    const userId = request.user?.id;

    if (!request.user) {
        res.status(401).json({ success: false, message: "Authentication required" });
        return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (notification: unknown) => {
        res.write(`event: notification\n`);
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
    };

    const unsubscribe = subscribeToNotifications({ role, userId }, send);

    const keepAlive = setInterval(() => {
        res.write(`event: ping\n`);
        res.write(`data: {}\n\n`);
    }, 25000);

    req.on("close", () => {
        clearInterval(keepAlive);
        unsubscribe();
        res.end();
    });
});

export default router;

