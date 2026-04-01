import { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware.
 * Catches unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error("Unhandled Error:", err.message);
    console.error(err.stack);

    if (process.env.NODE_ENV === "development") {
        const dbError = err as Error & { code?: string; state?: string; number?: number };
        console.error("DB Error Details:", {
            code: dbError.code,
            state: dbError.state,
            number: dbError.number,
            path: req.path,
            method: req.method,
        });
    }

    res.status(500).json({
        error: "Something went wrong",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
}
