-- ============================================================
-- Add All Missing Admin Fields to Users Table
-- For TypeORM entity sync (all nullable)
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE BankManagementSystem;
GO

DECLARE @columns_to_add TABLE (col_name nvarchar(100), col_type nvarchar(50));

INSERT INTO @columns_to_add VALUES 
('adminId', 'nvarchar(20)'),
('accessLevel', 'nvarchar(50)'),
('permissions', 'nvarchar(1000)'),
('authCode', 'nvarchar(100)'),
('lastLoginIP', 'nvarchar(45)'),
('securityQuestions', 'nvarchar(500)'),
('nationalId', 'nvarchar(50)'),
('profilePhoto', 'nvarchar(255)'),
('createdBy', 'int');

DECLARE col_cursor CURSOR FOR SELECT col_name, col_type FROM @columns_to_add;

DECLARE @col_name nvarchar(100), @col_type nvarchar(50);

OPEN col_cursor;
FETCH NEXT FROM col_cursor INTO @col_name, @col_type;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'users') AND name = @col_name
    )
    BEGIN
        DECLARE @sql nvarchar(max) = 'ALTER TABLE users ADD ' + @col_name + ' ' + @col_type + ' NULL';
        EXEC sp_executesql @sql;
        PRINT '✓ Added ' + @col_name;
    END
    ELSE
    BEGIN
        PRINT '⚠️  ' + @col_name + ' already exists';
    END
    FETCH NEXT FROM col_cursor INTO @col_name, @col_type;
END

CLOSE col_cursor;
DEALLOCATE col_cursor;

PRINT '✅ All admin fields migration complete!';
GO

-- Verify all columns
SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name IN ('adminId','accessLevel','permissions','authCode','department','officeLocation','lastLoginIP');
GO

