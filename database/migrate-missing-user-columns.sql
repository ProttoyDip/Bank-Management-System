-- ============================================================
-- COMPLETE User Table Migration: Fix TypeORM Column Mismatch
-- Adds ALL missing columns from src/entity/User.ts
-- SAFE/IDEMPOTENT: Checks existence before adding
-- Target: Microsoft SQL Server (T-SQL)
-- Database: BankManagementSystem
-- ============================================================

USE BankManagementSystem;
GO

PRINT '🚀 Starting COMPLETE User table migration...';

-- 1. twoFactorEnabled (CRITICAL - main error source)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'twoFactorEnabled'
)
BEGIN
    PRINT 'Adding twoFactorEnabled...';
    ALTER TABLE users ADD twoFactorEnabled bit NOT NULL DEFAULT 0;
    PRINT '✓ twoFactorEnabled added';
END ELSE PRINT '⚠️  twoFactorEnabled exists';

-- 2. securityQuestions
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'securityQuestions'
)
BEGIN
    PRINT 'Adding securityQuestions...';
    ALTER TABLE users ADD securityQuestions nvarchar(500) NULL;
    PRINT '✓ securityQuestions added';
END ELSE PRINT '⚠️  securityQuestions exists';

-- 3. adminId (unique)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'adminId'
)
BEGIN
    PRINT 'Adding adminId...';
    ALTER TABLE users ADD adminId nvarchar(20) NULL;
    PRINT '✓ adminId added';
END ELSE PRINT '⚠️  adminId exists';

-- Add UNIQUE constraint AFTER ensuring data population (run populate-adminIds.sql first if needed)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'users') AND name = 'UQ_users_adminId')
BEGIN
    PRINT 'Adding UNIQUE constraint on adminId...';
    ALTER TABLE users ADD CONSTRAINT UQ_users_adminId UNIQUE (adminId);
    PRINT '✓ adminId UNIQUE constraint added';
END ELSE PRINT '⚠️  adminId UNIQUE constraint exists';

-- 4. accessLevel
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'accessLevel'
)
BEGIN
    PRINT 'Adding accessLevel...';
    ALTER TABLE users ADD accessLevel nvarchar(50) NULL;
    PRINT '✓ accessLevel added';
END ELSE PRINT '⚠️  accessLevel exists';

-- 5. permissions
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'permissions'
)
BEGIN
    PRINT 'Adding permissions...';
    ALTER TABLE users ADD permissions nvarchar(1000) NULL;
    PRINT '✓ permissions added';
END ELSE PRINT '⚠️  permissions exists';

-- 6. authCode
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'authCode'
)
BEGIN
    PRINT 'Adding authCode...';
    ALTER TABLE users ADD authCode nvarchar(100) NULL;
    PRINT '✓ authCode added';
END ELSE PRINT '⚠️  authCode exists';

-- 7. department
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'department'
)
BEGIN
    PRINT 'Adding department...';
    ALTER TABLE users ADD department nvarchar(100) NULL;
    PRINT '✓ department added';
END ELSE PRINT '⚠️  department exists';

-- 8. officeLocation
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'officeLocation'
)
BEGIN
    PRINT 'Adding officeLocation...';
    ALTER TABLE users ADD officeLocation nvarchar(100) NULL;
    PRINT '✓ officeLocation added';
END ELSE PRINT '⚠️  officeLocation exists';

-- 9. lastLoginIP
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'lastLoginIP'
)
BEGIN
    PRINT 'Adding lastLoginIP...';
    ALTER TABLE users ADD lastLoginIP nvarchar(45) NULL;
    PRINT '✓ lastLoginIP added';
END ELSE PRINT '⚠️  lastLoginIP exists';

-- 10. Other fields likely already added
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'nationalId'
)
BEGIN
    ALTER TABLE users ADD nationalId nvarchar(50) NULL;
    PRINT '✓ nationalId added';
END ELSE PRINT '⚠️  nationalId exists';

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'profilePhoto'
)
BEGIN
    ALTER TABLE users ADD profilePhoto nvarchar(255) NULL;
    PRINT '✓ profilePhoto added';
END ELSE PRINT '⚠️  profilePhoto exists';

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'users') AND name = 'createdBy'
)
BEGIN
    ALTER TABLE users ADD createdBy int NULL;
    PRINT '✓ createdBy added';
END ELSE PRINT '⚠️  createdBy exists';

PRINT '✅ ALL User table columns synced with TypeORM entity!';
PRINT '🔄 Restart your Node.js server now (npm run dev)';
PRINT '🧪 Test: Visit dashboard - no more SQL errors';

-- FINAL VERIFICATION QUERY
SELECT 
    '✓ twoFactorEnabled' as col, 
    COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN (
    'twoFactorEnabled', 'securityQuestions', 'adminId', 'accessLevel', 
    'permissions', 'authCode', 'department', 'officeLocation', 
    'lastLoginIP', 'nationalId', 'profilePhoto', 'createdBy'
)
ORDER BY ORDINAL_POSITION;

GO

