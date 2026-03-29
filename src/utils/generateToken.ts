import jwt, { SignOptions } from "jsonwebtoken";

interface TokenPayload {
    id: number;
    email: string;
    role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: TokenPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET env var missing or too short (min 32 chars)');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

    const options: SignOptions = {
        expiresIn: expiresIn as any
    };

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        secret,
        options
    );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET env var missing or too short (min 32 chars)');
    }

    return jwt.verify(token, secret) as TokenPayload;
}

