USE BankManagementSystem;
GO

IF COL_LENGTH('transactions', 'status') IS NULL
BEGIN
    ALTER TABLE transactions ADD status NVARCHAR(30) NOT NULL CONSTRAINT DF_transactions_status DEFAULT 'Pending';
END
GO

IF COL_LENGTH('transactions', 'isFlagged') IS NULL
BEGIN
    ALTER TABLE transactions ADD isFlagged BIT NOT NULL CONSTRAINT DF_transactions_isFlagged DEFAULT 0;
END
GO

IF COL_LENGTH('transactions', 'flagReason') IS NULL
BEGIN
    ALTER TABLE transactions ADD flagReason NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('transactions', 'reviewedByEmployeeId') IS NULL
BEGIN
    ALTER TABLE transactions ADD reviewedByEmployeeId INT NULL;
END
GO

IF COL_LENGTH('transactions', 'reviewedAt') IS NULL
BEGIN
    ALTER TABLE transactions ADD reviewedAt DATETIME NULL;
END
GO

IF COL_LENGTH('transactions', 'createdByEmployeeId') IS NULL
BEGIN
    ALTER TABLE transactions ADD createdByEmployeeId INT NULL;
END
GO

IF COL_LENGTH('loans', 'remarks') IS NULL
BEGIN
    ALTER TABLE loans ADD remarks NVARCHAR(500) NULL;
END
GO

IF COL_LENGTH('loans', 'reviewedByEmployeeId') IS NULL
BEGIN
    ALTER TABLE loans ADD reviewedByEmployeeId INT NULL;
END
GO

IF COL_LENGTH('loans', 'reviewedAt') IS NULL
BEGIN
    ALTER TABLE loans ADD reviewedAt DATETIME NULL;
END
GO

IF OBJECT_ID('kyc', 'U') IS NULL
BEGIN
    CREATE TABLE kyc (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        documentType NVARCHAR(255) NULL,
        documentRef NVARCHAR(MAX) NULL,
        remarks NVARCHAR(MAX) NULL,
        verifiedByEmployeeId INT NULL,
        verifiedAt DATETIME NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_kyc_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('tickets', 'U') IS NULL
BEGIN
    CREATE TABLE tickets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        message NVARCHAR(1000) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'Open',
        response NVARCHAR(1000) NULL,
        resolvedByEmployeeId INT NULL,
        resolvedAt DATETIME NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_tickets_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('activity_logs', 'U') IS NULL
BEGIN
    CREATE TABLE activity_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        employeeId INT NOT NULL,
        action NVARCHAR(255) NOT NULL,
        details NVARCHAR(1000) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

IF OBJECT_ID('admin_settings', 'U') IS NULL
BEGIN
    CREATE TABLE admin_settings (
        id INT IDENTITY(1,1) PRIMARY KEY,
        settingKey NVARCHAR(100) NOT NULL UNIQUE,
        settingValue NVARCHAR(2000) NULL,
        description NVARCHAR(1000) NULL,
        updatedByAdminId INT NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

IF OBJECT_ID('employee_invites', 'U') IS NULL
BEGIN
    CREATE TABLE employee_invites (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(150) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        department NVARCHAR(100) NOT NULL,
        position NVARCHAR(100) NOT NULL,
        salary DECIMAL(18,2) NOT NULL DEFAULT 0,
        expiresAt DATETIME NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        createdByAdminId INT NULL,
        notes NVARCHAR(255) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO
