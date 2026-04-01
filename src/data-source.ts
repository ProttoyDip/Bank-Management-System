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
import { AdminSetting } from "./entity/AdminSetting"
import { EmployeeInvite } from "./entity/EmployeeInvite"
import * as dotenv from "dotenv"

dotenv.config()

const database = "BankManagementSystem"

function resolveEnv(primary: string, fallback?: string): string | undefined {
    const primaryValue = process.env[primary];
    if (primaryValue) {
        return primaryValue;
    }

    if (!fallback) {
        return undefined;
    }

    return process.env[fallback];
}

// Configuration for Docker SQL Server (primary)
const getDBConfig = (): DataSourceOptions => {
    const dbUser = resolveEnv('DB_USER', 'DB_USERNAME');
    const dbPass = resolveEnv('DB_PASS', 'DB_PASSWORD');
    const required = [
        { key: 'DB_HOST', value: process.env.DB_HOST },
        { key: 'DB_PORT', value: process.env.DB_PORT },
        { key: 'DB_NAME', value: process.env.DB_NAME },
        { key: 'DB_USER|DB_USERNAME', value: dbUser },
        { key: 'DB_PASS|DB_PASSWORD', value: dbPass },
    ];
    const missing = required.filter((item) => !item.value).map((item) => item.key);
  if (missing.length) {
    throw new Error(`Missing DB env vars: ${missing.join(', ')}`);
  }

    const usingLegacyKeys = !process.env.DB_USER || !process.env.DB_PASS;
    if (usingLegacyKeys) {
        console.warn('Using DB_USERNAME/DB_PASSWORD fallback. Prefer DB_USER/DB_PASS.');
    }

  return {
    type: "mssql" as const,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
        username: dbUser!,
        password: dbPass!,
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
    entities: [
        User,
        Account,
        Loan,
        Transaction,
        Employee,
        Branch,
        KycRequest,
        Ticket,
        ActivityLog,
        AdminSetting,
        EmployeeInvite,
    ],

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

