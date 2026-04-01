import jwt from "jsonwebtoken";

interface InviteTokenPayload {
    inviteId: number;
    email: string;
}

const INVITE_EXPIRES_IN = "7d";

function getInviteSecret(): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
        throw new Error("JWT_SECRET env var missing or too short (min 32 chars)");
    }
    return `${jwtSecret}_invite`;
}

export function generateInviteToken(payload: InviteTokenPayload): string {
    return jwt.sign(payload, getInviteSecret(), { expiresIn: INVITE_EXPIRES_IN });
}

export function verifyInviteToken(token: string): InviteTokenPayload {
    return jwt.verify(token, getInviteSecret()) as InviteTokenPayload;
}
