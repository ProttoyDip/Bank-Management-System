import { Request, Response, NextFunction } from "express";
import { verifyToken as verifyJwtToken } from "../utils/generateToken";
import { getDataSource } from "../data-source";
import { Employee } from "../entity/Employee";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
        user_id?: string;
        employeeId?: number;
        employeeCode?: string;
        accessLevel?: string;      // "Super Admin" or "Manager Admin"
        permissions?: string;      // JSON-encoded permissions
    };
}

function parsePermissions(permissions: unknown): string[] {
    if (!permissions) {
        return [];
    }

    if (Array.isArray(permissions)) {
        return permissions
            .map((permission) => String(permission || "").trim())
            .filter(Boolean);
    }

    if (typeof permissions !== "string") {
        return [];
    }

    const raw = permissions.trim();
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed
                .map((permission) => String(permission || "").trim())
                .filter(Boolean);
        }
        if (parsed && typeof parsed === "object") {
            return Object.entries(parsed)
                .filter(([, value]) => Boolean(value))
                .map(([key]) => String(key || "").trim())
                .filter(Boolean);
        }
    } catch {
        // Fall through to comma-separated parsing.
    }

    return raw
        .split(",")
        .map((permission) => permission.trim())
        .filter(Boolean);
}

function readCookie(req: Request, name: string): string | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return null;
    }

    const parts = cookieHeader.split(";").map((part) => part.trim());
    for (const part of parts) {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex <= 0) {
            continue;
        }

        const key = part.slice(0, separatorIndex).trim();
        if (key !== name) {
            continue;
        }

        const value = part.slice(separatorIndex + 1).trim();
        return value ? decodeURIComponent(value) : null;
    }

    return null;
}

function extractBearerToken(authHeader: string | string[] | undefined): string | null {
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!headerValue) {
        return null;
    }

    const match = headerValue.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() || null;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const queryToken = typeof req.query?.token === "string" ? req.query.token.trim() : null;
    const token = extractBearerToken(req.headers.authorization) || readCookie(req, "token") || queryToken;

    if (!token) {
        res.status(401).json({ error: "Authentication required. No token provided." });
        return;
    }

    try {
        // Verify and decode the JWT token
        const decoded = verifyJwtToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

export async function verifyEmployeeRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const role = String(req.user.role || "").toUpperCase();
    if (role !== "EMPLOYEE") {
        res.status(403).json({ error: "Employee role required" });
        return;
    }

    try {
        if (!Number.isInteger(req.user.id) || req.user.id <= 0) {
            res.status(403).json({ error: "Invalid employee token" });
            return;
        }

        const employee = await getDataSource()
            .getRepository(Employee)
            .createQueryBuilder("employee")
            .select([
                "employee.id",
                "employee.userId",
                "employee.employeeId",
                "employee.isActive",
            ])
            .where("employee.userId = :userId", { userId: req.user.id })
            .andWhere("employee.isActive = :isActive", { isActive: true })
            .getOne();

        if (!employee) {
            res.status(403).json({ error: "Employee profile not found or inactive" });
            return;
        }

        req.user.employeeId = employee.id;
        req.user.employeeCode = employee.employeeId;
        next();
    } catch (error) {
        console.error("verifyEmployeeRole error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const authMiddleware = verifyToken;

export function verifyAdminRole(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    if (String(req.user.role || "").toUpperCase() !== "ADMIN") {
        res.status(403).json({ error: "Unauthorized" });
        return;
    }

    next();
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

        const userRole = String(req.user.role || "");
        const hasRole = allowedRoles.some((role) => role.toUpperCase() === userRole.toUpperCase());
        if (!hasRole) {
            res.status(403).json({ error: "You don't have permission to access this resource" });
            return;
        }

        next();
    };
}

/**
 * Middleware to check if user is a Super Admin
 */
export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const accessLevel = String(req.user.accessLevel || "").trim();
    if (accessLevel !== "Super Admin") {
        res.status(403).json({ error: "Super Admin access required" });
        return;
    }

    next();
}

/**
 * Middleware to check invite-management capability for admin users.
 * Access is granted to Super Admin or admins with inviteEmployees permission.
 */
export function requireInviteEmployeeAccess(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ success: false, message: "Authentication required" });
        return;
    }

    const accessLevel = String(req.user.accessLevel || "").trim();
    if (accessLevel === "Super Admin") {
        next();
        return;
    }

    const permissions = parsePermissions(req.user.permissions);
    if (permissions.includes("inviteEmployees")) {
        next();
        return;
    }

    res.status(403).json({ success: false, message: "Invite management access required" });
}
