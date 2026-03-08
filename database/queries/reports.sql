-- ============================================================
-- Bank Management System — Report Queries
-- Target: Microsoft SQL Server (T-SQL)
-- ============================================================

USE BankManagementSystem;
GO

-- ─── 1. Total Balance Across All Accounts ────────────────────

SELECT
    SUM(balance)    AS totalBalance,
    COUNT(*)        AS totalAccounts,
    AVG(balance)    AS averageBalance
FROM accounts
WHERE isActive = 1;
GO

-- ─── 2. Number of Accounts Per User ──────────────────────────

SELECT
    u.id            AS userId,
    u.name          AS userName,
    u.email         AS userEmail,
    COUNT(a.id)     AS accountCount,
    SUM(a.balance)  AS totalBalance
FROM users u
LEFT JOIN accounts a ON a.userId = u.id
GROUP BY u.id, u.name, u.email
ORDER BY totalBalance DESC;
GO

-- ─── 3. Account Balance Summary by Type ──────────────────────

SELECT
    a.type                  AS accountType,
    COUNT(*)                AS accountCount,
    SUM(a.balance)          AS totalBalance,
    AVG(a.balance)          AS averageBalance,
    MIN(a.balance)          AS minBalance,
    MAX(a.balance)          AS maxBalance
FROM accounts a
WHERE a.isActive = 1
GROUP BY a.type
ORDER BY totalBalance DESC;
GO

-- ─── 4. Transaction Summary Per Account ──────────────────────

SELECT
    a.accountNumber,
    u.name                              AS accountHolder,
    t.type                              AS transactionType,
    COUNT(t.id)                         AS transactionCount,
    SUM(t.amount)                       AS totalAmount
FROM accounts a
INNER JOIN users u ON u.id = a.userId
LEFT JOIN transactions t ON t.accountId = a.id
GROUP BY a.accountNumber, u.name, t.type
ORDER BY a.accountNumber, t.type;
GO

-- ─── 5. Loan Summary Per User ────────────────────────────────

SELECT
    u.id                                AS userId,
    u.name                              AS userName,
    COUNT(l.id)                         AS totalLoans,
    SUM(l.amount)                       AS totalLoanAmount,
    SUM(l.remainingBalance)             AS totalRemainingBalance,
    SUM(CASE WHEN l.status = 'Active'    THEN 1 ELSE 0 END) AS activeLoans,
    SUM(CASE WHEN l.status = 'Completed' THEN 1 ELSE 0 END) AS completedLoans
FROM users u
LEFT JOIN loans l ON l.userId = u.id
GROUP BY u.id, u.name
ORDER BY totalLoanAmount DESC;
GO
