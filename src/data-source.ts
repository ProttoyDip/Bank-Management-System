import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USERNAME || "sa",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "BankManagementSystem",
    synchronize: true, // Auto-creates tables in development (disable in production!)
    logging: true,
    entities: [__dirname + "/entity/**/*.{ts,js}"],
    options: {
        encrypt: false, // Set true if using Azure SQL
        trustServerCertificate: true, // For local dev
    },
});
