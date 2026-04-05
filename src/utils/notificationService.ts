import { EntityManager } from "typeorm";
import { getDataSource } from "../data-source";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";
import { publishNotification } from "./notificationHub";

type NotificationInput = {
    userId: number;
    message: string;
    type: string;
};

function normalizeType(type: string): string {
    const normalized = String(type || "").trim().toLowerCase();
    if (!normalized) return "system";
    return normalized;
}

function titleFromType(type: string): string {
    const normalized = normalizeType(type);
    if (normalized === "loan") return "Loan Update";
    if (normalized === "kyc") return "KYC Update";
    if (normalized === "transaction") return "Transaction Update";
    return "System Update";
}

async function resolveUserRole(userId: number, manager?: EntityManager): Promise<string> {
    const repo = (manager || getDataSource().manager).getRepository(User);
    const user = await repo.findOne({
        where: { id: userId },
        select: { role: true },
    });
    return String(user?.role || "Customer");
}

export function toNotificationPayload(notification: Notification) {
    return {
        id: notification.id,
        title: titleFromType(notification.type),
        message: notification.message,
        type: notification.type,
        isRead: Boolean(notification.isRead),
        createdAt: notification.createdAt?.toISOString?.() || new Date().toISOString(),
    };
}

export async function createUserNotification(input: NotificationInput, manager?: EntityManager): Promise<Notification> {
    const repo = (manager || getDataSource().manager).getRepository(Notification);
    const entity = repo.create({
        userId: input.userId,
        message: input.message,
        type: normalizeType(input.type),
        isRead: false,
    });
    const saved = await repo.save(entity);
    const role = await resolveUserRole(input.userId, manager);
    publishNotification({
        id: saved.id,
        title: titleFromType(saved.type),
        message: saved.message,
        type: saved.type,
        isRead: Boolean(saved.isRead),
        createdAt: saved.createdAt?.toISOString?.() || new Date().toISOString(),
    }, { role, userId: input.userId });
    return saved;
}

export async function createRoleNotifications(role: string, message: string, type: string, manager?: EntityManager): Promise<void> {
    const userRepo = (manager || getDataSource().manager).getRepository(User);
    const users = await userRepo.find({
        where: { role },
        select: { id: true, role: true, status: true },
    });

    for (const user of users) {
        if (String(user.status || "Active").toLowerCase() !== "active") {
            continue;
        }
        await createUserNotification({
            userId: user.id,
            message,
            type,
        }, manager);
    }
}
