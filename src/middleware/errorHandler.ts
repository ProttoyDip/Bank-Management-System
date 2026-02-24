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

    res.status(500).json({
        error: "Something went wrong",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
}
