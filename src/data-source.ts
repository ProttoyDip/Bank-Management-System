import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Account } from "./entity/Account"
import { Loan } from "./entity/Loan"
import { Transaction } from "./entity/Transaction"
import { Employee } from "./entity/Employee"
import { Branch } from "./entity/Branch"
import * as dotenv from "dotenv"

dotenv.config()

// Build connection string for msnodesqlv8 (supports named instances + Windows Auth)
// Using hardcoded values for SQLEXPRESS instance - override .env if needed
const server = "DESKTOP-EBM0COB";
const port = 1433;
const database = "BankManagementSystem";

export const AppDataSource = new DataSource({
    type: "mssql",
    host: server,
    port: port,
    database: database,
    username: "sa",
    password: "12345678",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    
    // Standard TypeORM settings
    synchronize: true,
    logging: true,
    entities: [User, Account, Loan, Transaction, Employee, Branch],
    migrations: [],
    subscribers: [],
})
