-- Populate Unique adminId for Existing Users
-- ONE-TIME SCRIPT: Run AFTER column added, BEFORE re-enabling UNIQUE constraint
-- Target: BankManagementSystem DB (Local SQLEXPRESS)

USE BankManagementSystem;
GO

PRINT '=== Populating adminId for existing users ===';
PRINT 'Current NULL adminIds:';
SELECT COUNT(*) as null_adminIds FROM users WHERE adminId IS NULL;
GO

PRINT 'Generating sequential unique adminIds (ADM-0001, ADM-0002, ...)';
WITH numbered_users AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id ASC) as row_num
  FROM users 
  WHERE adminId IS NULL
)
UPDATE u
SET adminId = 'ADM-' + FORMAT(nu.row_num, '0000')
FROM users u
INNER JOIN numbered_users nu ON u.id = nu.id;
GO

PRINT 'Verification:';
SELECT 
  COUNT(*) as total_users,
  COUNT(adminId) as populated,
  COUNT(DISTINCT adminId) as unique_ids,
  COUNT(CASE WHEN adminId IS NULL THEN 1 END) as remaining_nulls
FROM users;
GO

PRINT '✅ adminId population complete! Ready for UNIQUE constraint.';

