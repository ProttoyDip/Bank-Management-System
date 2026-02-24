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
    res.json({
        message: "Bank Management System API is running",
        version: "1.0.0",
        endpoints: {
            users: "/api/users",
            accounts: "/api/accounts",
        },
    });
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
