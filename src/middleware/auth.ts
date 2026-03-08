import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    // TODO: Implement full JWT verification (e.g. using jsonwebtoken.verify)
    console.log("authMiddleware: token present — full JWT verification should be implemented");
    next();
}
