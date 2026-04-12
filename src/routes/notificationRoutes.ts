import { Request, Response, Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { subscribeToNotifications } from "../utils/notificationHub";
import { createUserNotification, toNotificationPayload } from "../utils/notificationService";

const router = Router();

const createNotificationSchema = z.object({
    userId: z.number().int().positive().optional(),
    message: z.string().trim().min(2).max(1000),
    type: z.string().trim().min(2).max(50),
});

router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
    const request = req as AuthRequest;
    if (!request.user?.id) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    try {
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const repo = getDataSource().getRepository(Notification);
        const notifications = await repo.find({
            where: { userId: request.user.id },
            order: { createdAt: "DESC" },
            take: limit,
        });

        return res.json({
            success: true,
            data: notifications.map(toNotificationPayload),
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(500).json({ success: false, message: "Failed to load notifications" });
    }
});

router.post("/", async (req: Request, res: Response) => {
    const request = req as AuthRequest;
    if (!request.user?.id) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const parsed = createNotificationSchema.safeParse(req.body || {});
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid notification payload" });
    }

    try {
        const targetUserId = parsed.data.userId || request.user.id;
        const saved = await createUserNotification({
            userId: targetUserId,
            message: parsed.data.message,
            type: parsed.data.type,
        });

        return res.status(201).json({
            success: true,
            message: "Notification created",
            data: toNotificationPayload(saved),
        });
    } catch (error) {
        console.error("Create notification error:", error);
        return res.status(500).json({ success: false, message: "Failed to create notification" });
    }
});

router.put("/:id/read", async (req: Request, res: Response) => {
    const request = req as AuthRequest;
    if (!request.user?.id) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    try {
        const notificationId = Number(req.params.id);
        if (!Number.isInteger(notificationId) || notificationId <= 0) {
            return res.status(400).json({ success: false, message: "Invalid notification id" });
        }

        const repo = getDataSource().getRepository(Notification);
        const row = await repo.findOne({ where: { id: notificationId } });
        if (!row) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (row.userId !== request.user.id) {
            return res.status(403).json({ success: false, message: "Not allowed to update this notification" });
        }

        row.isRead = true;
        const saved = await repo.save(row);
        return res.json({ success: true, data: toNotificationPayload(saved) });
    } catch (error) {
        console.error("Mark notification read error:", error);
        return res.status(500).json({ success: false, message: "Failed to mark notification as read" });
    }
});

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
