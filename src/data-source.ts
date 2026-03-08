import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import { User } from "./entity/User"
import { Account } from "./entity/Account"
import { Loan } from "./entity/Loan"
import { Transaction } from "./entity/Transaction"
import { Employee } from "./entity/Employee"
import { Branch } from "./entity/Branch"
import * as dotenv from "dotenv"

dotenv.config()

const database = "BankManagementSystem"

// Configuration for Docker SQL Server (primary)
const dockerConfig: DataSourceOptions = {
    type: "mssql",
    host: "localhost",
    port: 1433,
    database: database,
    username: "sa",
    password: "BankProject@123",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
}

// Configuration for local SQL Server Express (fallback)
const localConfig: DataSourceOptions = {
    type: "mssql",
    host: "DESKTOP-F5ATA0B\\SQLEXPRESS",
    port: 1434,
    database: database,
    username: "sa",
    password: "12345678",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
}

// Standard TypeORM settings
const baseOptions = {
    synchronize: true,
    logging: true,
    entities: [User, Account, Loan, Transaction, Employee, Branch],
    migrations: [],
    subscribers: [],
}

// Create DataSource with Docker config
export const AppDataSource = new DataSource({
    ...dockerConfig,
    ...baseOptions,
})

// Export local config for fallback usage
export const LocalDataSource = new DataSource({
    ...localConfig,
    ...baseOptions,
})

// Function to test connection and fallback if needed
export async function initializeDataSource(): Promise<DataSource> {
    try {
        console.log("Attempting to connect to Docker SQL Server...")
        await AppDataSource.initialize()
        console.log("✓ Connected to Docker SQL Server successfully!")
        return AppDataSource
    } catch (error) {
        console.log("Docker SQL Server connection failed, trying local SQL Server...")
        try {
            await LocalDataSource.initialize()
            console.log("✓ Connected to Local SQL Server successfully!")
            return LocalDataSource
        } catch (localError) {
            console.error("❌ Both Docker and Local SQL Server connections failed:")
            console.error(localError)
            throw new Error("Unable to connect to any SQL Server instance")
        }
    }
}

// Helper function to get the active data source
export function getDataSource(): DataSource {
    return (global as any).dataSource || AppDataSource;
}

