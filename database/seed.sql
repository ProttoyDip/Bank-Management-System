-- ============================================================
-- Bank Management System — Sample Seed Data
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE BankManagementSystem;
GO

-- ─── Users ───────────────────────────────────────────────────
-- Password for all users: password123

SET IDENTITY_INSERT users ON;

INSERT INTO users (id, name, email, phone, address, password, role, createdAt, updatedAt)
VALUES
    (1, N'Rahim Uddin',    N'rahim@example.com',    N'+8801711000001', N'123 Mirpur Road, Dhaka',           N'$2b$10$3lfPFiaHGTEpDNP5URbLwuUV4c7hgVWQWRtODsBtCc9ZFAqodWXX6', N'Admin', GETDATE(), GETDATE()),
    (2, N'Fatema Akhter',  N'fatema@example.com',  N'+8801812000002', N'45 Agrabad, Chittagong',           N'$2b$10$3lfPFiaHGTEpDNP5URbLwuUV4c7hgVWQWRtODsBtCc9ZFAqodWXX6', N'Employee', GETDATE(), GETDATE()),
    (3, N'Kamal Hossain',   N'kamal@example.com',   N'+8801913000003', N'78 Zindabazar, Sylhet',            N'$2b$10$3lfPFiaHGTEpDNP5URbLwuUV4c7hgVWQWRtODsBtCc9ZFAqodWXX6', N'Customer', GETDATE(), GETDATE()),
    (4, N'Nasrin Begum',   N'nasrin@example.com',   N'+8801611000004', N'22 Jessore Road, Khulna',          N'$2b$10$3lfPFiaHGTEpDNP5URbLwuUV4c7hgVWQWRtODsBtCc9ZFAqodWXX6', N'Customer', GETDATE(), GETDATE()),
    (5, N'Tariqul Islam',  N'tariq@example.com',  N'+8801511000005', N'55 Shaheb Bazar, Rajshahi',        N'$2b$10$3lfPFiaHGTEpDNP5URbLwuUV4c7hgVWQWRtODsBtCc9ZFAqodWXX6', N'Customer', GETDATE(), GETDATE());

SET IDENTITY_INSERT users OFF;
GO

-- ─── Accounts ────────────────────────────────────────────────

SET IDENTITY_INSERT accounts ON;

INSERT INTO accounts (id, accountNumber, type, balance, isActive, userId, createdAt, updatedAt)
VALUES
    (1, N'BMS10000001', N'Savings',         150000.00, 1, 1, GETDATE(), GETDATE()),
    (2, N'BMS10000002', N'Current',         320000.00, 1, 2, GETDATE(), GETDATE()),
    (3, N'BMS10000003', N'Fixed Deposit',   500000.00, 1, 3, GETDATE(), GETDATE()),
    (4, N'BMS10000004', N'Savings',          75000.00, 1, 4, GETDATE(), GETDATE()),
    (5, N'BMS10000005', N'Loan Account',         0.00, 1, 5, GETDATE(), GETDATE());

SET IDENTITY_INSERT accounts OFF;
GO
