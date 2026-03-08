-- ============================================================
-- Bank Management System — Analytics Queries
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE BankManagementSystem;
GO

-- ─── 1. Monthly Account Growth ───────────────────────────────

SELECT
    YEAR(createdAt)     AS [year],
    MONTH(createdAt)    AS [month],
    DATENAME(MONTH, createdAt) AS monthName,
    COUNT(*)            AS newAccounts
FROM accounts
GROUP BY YEAR(createdAt), MONTH(createdAt), DATENAME(MONTH, createdAt)
ORDER BY [year] DESC, [month] DESC;
GO

-- ─── 2. Monthly New User Registrations ───────────────────────

SELECT
    YEAR(createdAt)     AS [year],
    MONTH(createdAt)    AS [month],
    DATENAME(MONTH, createdAt) AS monthName,
    COUNT(*)            AS newUsers
FROM users
GROUP BY YEAR(createdAt), MONTH(createdAt), DATENAME(MONTH, createdAt)
ORDER BY [year] DESC, [month] DESC;
GO

-- ─── 3. Monthly Transaction Volume ───────────────────────────

SELECT
    YEAR(createdAt)     AS [year],
    MONTH(createdAt)    AS [month],
    DATENAME(MONTH, createdAt) AS monthName,
    type                AS transactionType,
    COUNT(*)            AS transactionCount,
    SUM(amount)         AS totalAmount
FROM transactions
GROUP BY YEAR(createdAt), MONTH(createdAt), DATENAME(MONTH, createdAt), type
ORDER BY [year] DESC, [month] DESC, type;
GO

-- ─── 4. Active vs Inactive Accounts ──────────────────────────

SELECT
    CASE WHEN isActive = 1 THEN 'Active' ELSE 'Inactive' END AS status,
    COUNT(*)            AS accountCount,
    SUM(balance)        AS totalBalance,
    AVG(balance)        AS averageBalance
FROM accounts
GROUP BY isActive;
GO

-- ─── 5. Active vs Inactive Accounts by Type ──────────────────

SELECT
    type                AS accountType,
    SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) AS activeCount,
    SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) AS inactiveCount,
    COUNT(*)            AS totalCount,
    SUM(CASE WHEN isActive = 1 THEN balance ELSE 0 END) AS activeBalance
FROM accounts
GROUP BY type
ORDER BY type;
GO

-- ─── 6. Loan Status Distribution ─────────────────────────────

SELECT
    status              AS loanStatus,
    COUNT(*)            AS count,
    SUM(amount)         AS totalAmount,
    AVG(interestRate)   AS avgInterestRate
FROM loans
GROUP BY status
ORDER BY count DESC;
GO

-- ─── 7. Monthly Loan Disbursements ───────────────────────────

SELECT
    YEAR(startDate)     AS [year],
    MONTH(startDate)    AS [month],
    DATENAME(MONTH, startDate) AS monthName,
    COUNT(*)            AS loansApproved,
    SUM(amount)         AS totalDisbursed
FROM loans
WHERE status IN ('Active', 'Completed')
  AND startDate IS NOT NULL
GROUP BY YEAR(startDate), MONTH(startDate), DATENAME(MONTH, startDate)
ORDER BY [year] DESC, [month] DESC;
GO
