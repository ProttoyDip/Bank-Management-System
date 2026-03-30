-- Fix Legacy Status Column in Users Table
-- Run this ONCE on both Docker and Local SQL Server databases
-- Target: BankManagementSystem DB

USE BankManagementSystem;
GO

PRINT 'Dropping legacy status constraint...';
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_877c77b87c1d915a9a2b254110_ENUM')
BEGIN
    ALTER TABLE users DROP CONSTRAINT CHK_877c77b87c1d915a9a2b254110_ENUM;
    PRINT '✓ Constraint dropped';
END
ELSE
BEGIN
    PRINT '⚠️  Constraint not found (already dropped?)';
END
GO

PRINT 'Dropping legacy status column...';
IF EXISTS (SELECT * FROM sys.columns c INNER JOIN sys.tables t ON c.object_id = t.object_id 
           WHERE t.name = 'users' AND c.name = 'status')
BEGIN
    ALTER TABLE users DROP COLUMN status;
    PRINT '✓ Status column dropped';
END
ELSE
BEGIN
    PRINT '⚠️  Status column not found (already dropped?)';
END
GO

PRINT '✅ Legacy cleanup complete!';
GO
