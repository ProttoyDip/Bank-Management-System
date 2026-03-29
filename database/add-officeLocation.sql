-- ============================================================
-- Add Missing officeLocation Column to Users Table
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE BankManagementSystem;
GO

PRINT 'Checking if officeLocation column already exists...';

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') 
    AND name = 'officeLocation'
)
BEGIN
    PRINT 'Adding officeLocation column...';
    
    ALTER TABLE users 
    ADD officeLocation nvarchar(100) NULL;
    
    PRINT '✓ officeLocation column added successfully!';
END
ELSE
BEGIN
    PRINT '⚠️  officeLocation column already exists - no changes needed.';
END
GO

PRINT '✅ Migration complete! You can now restart your application.';
GO

-- Test query to verify
SELECT TOP 5 name, email, officeLocation FROM users;
GO
