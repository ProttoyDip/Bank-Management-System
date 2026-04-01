-- Insert test loan for approval testing
USE BankManagementSystem;
GO

SET IDENTITY_INSERT loans ON;

INSERT INTO loans (id, loanNumber, userId, accountId, type, amount, interestRate, duration, monthlyPayment, remainingBalance, status, remarks, reviewedByEmployeeId, reviewedAt, startDate, endDate, createdAt, updatedAt)
VALUES
    (1, N'LOAN-2024-001', 3, 3, N'Personal', 50000.00, 12.00, 12, 4500.00, 50000.00, N'Pending', NULL, NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
    (2, N'LOAN-2024-002', 4, 4, N'Home', 500000.00, 8.00, 120, 5200.00, 500000.00, N'Pending', NULL, NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
    (3, N'LOAN-2024-003', 5, 5, N'Car', 300000.00, 10.00, 60, 6000.00, 300000.00, N'Pending', NULL, NULL, NULL, NULL, NULL, GETDATE(), GETDATE());

SET IDENTITY_INSERT loans OFF;
GO
