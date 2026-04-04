-- ============================================================
-- Card Management System — Database Schema
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE BankManagementSystem;
GO

-- Check if tables exist before creating
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cards]') AND type in (N'U'))
BEGIN
    CREATE TABLE cards (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        card_number NVARCHAR(16) NOT NULL UNIQUE,
        card_type NVARCHAR(50) DEFAULT 'Debit',
        expiry_date DATETIME NOT NULL,
        cvv NVARCHAR(3) NOT NULL,
        status NVARCHAR(20) DEFAULT 'Active',
        created_at DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    -- Create index for faster lookups
    CREATE INDEX idx_cards_user_id ON cards(user_id);
    CREATE INDEX idx_cards_status ON cards(status);
    
    PRINT 'Table [cards] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [cards] already exists.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[card_applications]') AND type in (N'U'))
BEGIN
    CREATE TABLE card_applications (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        status NVARCHAR(20) DEFAULT 'pending',
        reason NVARCHAR(255) NULL,
        createdAt DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    -- Create index for faster lookups
    CREATE INDEX idx_card_applications_user_id ON card_applications(user_id);
    CREATE INDEX idx_card_applications_status ON card_applications(status);
    
    PRINT 'Table [card_applications] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [card_applications] already exists.';
END
GO

-- Optional: Add activity log for card operations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[card_activity_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE card_activity_logs (
        id INT PRIMARY KEY IDENTITY(1,1),
        card_id INT,
        action NVARCHAR(50),
        description NVARCHAR(255),
        performed_by INT,
        created_at DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL,
        FOREIGN KEY (performed_by) REFERENCES users(id)
    );
    
    PRINT 'Table [card_activity_logs] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [card_activity_logs] already exists.';
END
GO

PRINT 'Card Management database schema initialized successfully.';
