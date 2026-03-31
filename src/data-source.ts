import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import { User } from "./entity/User"
import { Account } from "./entity/Account"
import { Loan } from "./entity/Loan"
import { Transaction } from "./entity/Transaction"
import { Employee } from "./entity/Employee"
import { Branch } from "./entity/Branch"
import { KycRequest } from "./entity/KycRequest"
import { Ticket } from "./entity/Ticket"
import { ActivityLog } from "./entity/ActivityLog"
import * as dotenv from "dotenv"

dotenv.config()

const database = "BankManagementSystem"

// Configuration for Docker SQL Server (primary)
const getDBConfig = (): DataSourceOptions => {
  const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing DB env vars: ${missing.join(', ')}`);
  }
  return {
    type: "mssql" as const,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,
    },
  };
};

const dockerConfig: DataSourceOptions = getDBConfig();


// Local fallback uses same env config
const localConfig: DataSourceOptions = getDBConfig();


// Standard TypeORM settings
const baseOptions = {
    synchronize: false, // Production ready: use manual migrations
    logging: true,
    entities: [User, Account, Loan, Transaction, Employee, Branch, KycRequest, Ticket, ActivityLog],

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

