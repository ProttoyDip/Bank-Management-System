export type NotificationMessage = {
    id: string | number;
    title: string;
    message: string;
    type: string;
    transactionId?: number;
    isRead?: boolean;
    createdAt: string;
};

type NotificationTarget = {
    role?: string;
    userId?: number;
};

type Subscriber = {
    target: NotificationTarget;
    send: (notification: NotificationMessage) => void;
};

const subscribers = new Set<Subscriber>();

function matchesTarget(subscriberTarget: NotificationTarget, target: NotificationTarget): boolean {
    if (subscriberTarget.userId && target.userId && subscriberTarget.userId !== target.userId) {
        return false;
    }

    if (subscriberTarget.role && target.role && subscriberTarget.role.toLowerCase() !== target.role.toLowerCase()) {
        return false;
    }

    if (subscriberTarget.userId && !target.userId) {
        return false;
    }

    if (subscriberTarget.role && !target.role) {
        return false;
    }

    return true;
}

export function subscribeToNotifications(
    target: NotificationTarget,
    send: (notification: NotificationMessage) => void
): () => void {
    const subscriber: Subscriber = { target, send };
    subscribers.add(subscriber);
    return () => {
        subscribers.delete(subscriber);
    };
}

export function publishNotification(notification: NotificationMessage, target: NotificationTarget): void {
    for (const subscriber of subscribers) {
        if (matchesTarget(subscriber.target, target)) {
            subscriber.send(notification);
        }
    }
}

export function buildNotification(payload: {
    title: string;
    message: string;
    type: string;
    transactionId?: number;
}): NotificationMessage {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        transactionId: payload.transactionId,
        isRead: false,
        createdAt: new Date().toISOString(),
    };
}

