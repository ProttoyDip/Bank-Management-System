import * as dotenv from "dotenv"
dotenv.config({ path: '.env', override: true })

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

let cachedConfig: DataSourceOptions | null = null;

const getDBConfig = (): DataSourceOptions => {
    if (cachedConfig) {
        console.log('Using cached DB config');
        return cachedConfig;
    }

    // Debug logging for all env vars
    console.log('DB_HOST:', process.env.DB_HOST ? '✓ ' + process.env.DB_HOST : '✗ missing');
    console.log('DB_PORT:', process.env.DB_PORT ? '✓ ' + process.env.DB_PORT : '✗ missing');
    console.log('DB_NAME:', process.env.DB_NAME ? '✓ ' + process.env.DB_NAME : '✗ missing');
    console.log('DB_USER:', process.env.DB_USER ? '✓ set' : '✗ missing');
    console.log('DB_PASS:', process.env.DB_PASSWORD ? '✓ set (fallback)' : process.env.DB_PASS ? '✓ set' : '✗ missing');

    const dbUser = process.env.DB_USER || process.env.DB_USERNAME || 'sa';
    const dbPass = process.env.DB_PASS || process.env.DB_PASSWORD || 'BankProject@123';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '1433';
    const dbName = process.env.DB_NAME || 'BankManagementSystem';

    const config: DataSourceOptions = {
        type: "mssql" as const,
        host: dbHost,
        port: parseInt(dbPort),
        database: dbName,
        username: dbUser,
        password: dbPass,
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: true,
        },
    };

    cachedConfig = config;
    return config;
};

const dockerConfig: DataSourceOptions = getDBConfig();
const localConfig: DataSourceOptions = getDBConfig();


// Standard TypeORM settings
const baseOptions = {
    synchronize: false, // Keep schema changes explicit; dev patches add missing columns safely
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
        await applyDevelopmentSchemaPatches(AppDataSource);
        return AppDataSource
    } catch (error) {
            console.log("Docker SQL Server connection failed, trying local SQL Server...")
            try {
                await LocalDataSource.initialize()
                console.log("✓ Connected to Local SQL Server successfully!")
                await applyDevelopmentSchemaPatches(LocalDataSource);
                return LocalDataSource
        } catch (localError) {
            console.error("❌ Both Docker and Local SQL Server connections failed:")
            console.error(localError)
            throw new Error("Unable to connect to any SQL Server instance")
        }
    }
}

export async function applyDevelopmentSchemaPatches(dataSource: DataSource): Promise<void> {
    if (process.env.NODE_ENV === "production") {
        return;
    }

    const statements = [
        `IF COL_LENGTH('dbo.users', 'twoFactorEnabled') IS NULL ALTER TABLE dbo.users ADD twoFactorEnabled bit NOT NULL CONSTRAINT DF_users_twoFactorEnabled DEFAULT 0;`,
        `IF COL_LENGTH('dbo.users', 'securityQuestions') IS NULL ALTER TABLE dbo.users ADD securityQuestions nvarchar(500) NULL;`,
        `IF COL_LENGTH('dbo.users', 'verificationCode') IS NULL ALTER TABLE dbo.users ADD verificationCode nvarchar(10) NULL;`,
        `IF COL_LENGTH('dbo.users', 'verificationExpiry') IS NULL ALTER TABLE dbo.users ADD verificationExpiry datetime NULL;`,
        `IF COL_LENGTH('dbo.users', 'profilePhoto') IS NULL ALTER TABLE dbo.users ADD profilePhoto nvarchar(255) NULL;`,
        `IF COL_LENGTH('dbo.users', 'nationalId') IS NULL ALTER TABLE dbo.users ADD nationalId nvarchar(50) NULL;`,
        `IF COL_LENGTH('dbo.users', 'accessLevel') IS NULL ALTER TABLE dbo.users ADD accessLevel nvarchar(50) NULL;`,
        `IF COL_LENGTH('dbo.users', 'permissions') IS NULL ALTER TABLE dbo.users ADD permissions nvarchar(1000) NULL;`,
        `IF COL_LENGTH('dbo.users', 'authCode') IS NULL ALTER TABLE dbo.users ADD authCode nvarchar(100) NULL;`,
        `IF COL_LENGTH('dbo.users', 'department') IS NULL ALTER TABLE dbo.users ADD department nvarchar(100) NULL;`,
        `IF COL_LENGTH('dbo.users', 'officeLocation') IS NULL ALTER TABLE dbo.users ADD officeLocation nvarchar(100) NULL;`,
        `IF COL_LENGTH('dbo.users', 'lastLoginIP') IS NULL ALTER TABLE dbo.users ADD lastLoginIP nvarchar(45) NULL;`,
        `IF COL_LENGTH('dbo.employees', 'dateOfBirth') IS NULL ALTER TABLE dbo.employees ADD dateOfBirth date NULL;`,
        `IF COL_LENGTH('dbo.employees', 'gender') IS NULL ALTER TABLE dbo.employees ADD gender nvarchar(20) NULL;`,
        `IF COL_LENGTH('dbo.employees', 'employmentType') IS NULL ALTER TABLE dbo.employees ADD employmentType nvarchar(50) NULL;`,
        `IF COL_LENGTH('dbo.employees', 'presentAddress') IS NULL ALTER TABLE dbo.employees ADD presentAddress nvarchar(100) NULL;`,
        `IF COL_LENGTH('dbo.employees', 'permanentAddress') IS NULL ALTER TABLE dbo.employees ADD permanentAddress nvarchar(255) NULL;`,
        `IF COL_LENGTH('dbo.employees', 'dailyTransactionLimit') IS NULL ALTER TABLE dbo.employees ADD dailyTransactionLimit decimal(18,2) NOT NULL CONSTRAINT DF_employees_dailyTransactionLimit DEFAULT 0;`,
        `IF COL_LENGTH('dbo.employees', 'permissions') IS NULL ALTER TABLE dbo.employees ADD permissions nvarchar(1000) NULL;`,
        `IF COL_LENGTH('dbo.kyc', 'documentRef') IS NOT NULL ALTER TABLE dbo.kyc ALTER COLUMN documentRef nvarchar(max) NULL;`,
        `IF COL_LENGTH('dbo.kyc', 'remarks') IS NOT NULL ALTER TABLE dbo.kyc ALTER COLUMN remarks nvarchar(max) NULL;`,
    ];

    for (const statement of statements) {
        try {
            await dataSource.query(statement);
        } catch (error) {
            console.error("Schema patch failed:", statement, error);
        }
    }
}

// Helper function to get the active data source
export function getDataSource(): DataSource {
    return (global as any).dataSource || AppDataSource;
}
