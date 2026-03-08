-- ============================================================
-- Bank Management System — Database Initialization Script
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE master;
GO

IF NOT EXISTS (
    SELECT name FROM sys.databases WHERE name = N'BankManagementSystem'
)
BEGIN
    CREATE DATABASE BankManagementSystem;
END
GO

USE BankManagementSystem;
GO
