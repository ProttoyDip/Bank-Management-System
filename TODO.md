# TransactionHistory Page - Replace Mock Data with API Calls

## Task
Replace hardcoded `mockTransactions` and `chartData` in TransactionHistory.tsx with real API calls.

## Steps to Complete:
- [x] 1. Analyze codebase and understand API structure
- [x] 2. Update TransactionHistory.tsx to:
  - [x] Import necessary dependencies (useEffect, useState, api, useAuth, types)
  - [x] Add state for transactions, loading, and error
  - [x] Implement useEffect to fetch transactions based on user role
  - [x] Compute chartData dynamically from fetched transactions
  - [x] Compute summary stats dynamically from fetched transactions
  - [x] Add loading and error handling
- [ ] 3. Test the implementation

## Implementation Details:
- Admin/Employee: Fetch all transactions via `GET /api/transactions`
- Customer: Fetch user's accounts first, then transactions for each account
- Chart data: Group transactions by week
- Summary: Calculate totals from actual transaction data

