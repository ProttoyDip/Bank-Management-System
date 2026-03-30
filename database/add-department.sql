-- ============================================================
-- Add Missing department Column to Users Table
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE BankManagementSystem;
GO

PRINT 'Checking if department column already exists...';

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') 
    AND name = 'department'
)
BEGIN
    PRINT 'Adding department column...';
    
    ALTER TABLE users 
    ADD department nvarchar(100) NULL;
    
    PRINT '✓ department column added successfully!';
END
ELSE
BEGIN
    PRINT '⚠️  department column already exists - no changes needed.';
END
GO

PRINT '✅ Migration complete! You can now restart your application.';
GO

-- Test query to verify
SELECT TOP 5 name, email, department FROM users;
GO

