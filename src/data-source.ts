import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Account } from "./entity/Account"
import * as dotenv from "dotenv"

dotenv.config()

// Build connection string for msnodesqlv8 (supports named instances + Windows Auth)
const server = process.env.DB_HOST || "localhost";
const port = parseInt(process.env.DB_PORT || "1433");
const database = process.env.DB_NAME || "BankManagementSystem";

export const AppDataSource = new DataSource({
    type: "mssql",
    host: server,
    port: port,
    database: database,
    username: process.env.DB_USERNAME || "sa",
    password: process.env.DB_PASSWORD || "",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    
    // Standard TypeORM settings
    synchronize: true,
    logging: true,
    entities: [User, Account],
    migrations: [],
    subscribers: [],
})
