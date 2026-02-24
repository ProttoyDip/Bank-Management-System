import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bank Management System API</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
            .container { text-align: center; max-width: 600px; padding: 40px; }
            h1 { font-size: 2.2rem; margin-bottom: 8px; color: #38bdf8; }
            .version { color: #94a3b8; margin-bottom: 30px; font-size: 0.9rem; }
            .status { background: #166534; color: #4ade80; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-bottom: 30px; font-weight: 600; }
            .endpoints { text-align: left; background: #1e293b; border-radius: 12px; padding: 24px; }
            .endpoints h3 { color: #94a3b8; margin-bottom: 16px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
            .endpoint { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: 8px; background: #0f172a; border-radius: 8px; }
            .endpoint:last-child { margin-bottom: 0; }
            .method { background: #065f46; color: #34d399; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
            .endpoint a { color: #38bdf8; text-decoration: none; font-family: monospace; font-size: 0.95rem; }
            .endpoint a:hover { text-decoration: underline; }
            .footer { margin-top: 30px; color: #475569; font-size: 0.8rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Bank Management System</h1>
            <p class="version">v1.0.0 &mdash; CSE 3104 Database Lab Project</p>
            <div class="status">Server Running</div>
            <div class="endpoints">
                <h3>API Endpoints</h3>
                <div class="endpoint"><span class="method">GET</span><a href="/api">/api</a></div>
                <div class="endpoint"><span class="method">GET</span><a href="/api/users">/api/users</a></div>
                <div class="endpoint"><span class="method">GET</span><a href="/api/accounts">/api/accounts</a></div>
            </div>
            <p class="footer">Ahsanullah University of Science and Technology</p>
        </div>
    </body>
    </html>
    `);
});

app.use("/api", routes);

// ── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ── Database Connection & Server Start ───────────────────
AppDataSource.initialize()
    .then(() => {
        console.log("✅ Database connected successfully!");
        console.log(`📦 Tables synchronized (Code-First)`);

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
        });
    })
    .catch((error) => {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    });

export default app;
