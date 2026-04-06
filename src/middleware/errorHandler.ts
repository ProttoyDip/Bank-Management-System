import { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware.
 * Catches unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Handle express-rate-limit errors specifically (status 429)
    if (err.status === 429 || res.statusCode === 429) {
        res.set('Retry-After', '900');
        res.status(429).json({
            error: "Rate limit exceeded. Please try again later.",
            retryAfter: 900
        });
        return;
    }

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
        message: err.message || "Internal Server Error",
    });
}
