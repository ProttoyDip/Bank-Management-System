import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/generateToken";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        res.status(401).json({ error: "Authentication required. No token provided." });
        return;
    }

    try {
        // Verify and decode the JWT token
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

/**
 * Middleware to check if user has required role
 */
export function roleMiddleware(allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: "You don't have permission to access this resource" });
            return;
        }

        next();
    };
}
