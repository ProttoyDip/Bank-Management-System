// ── TypeScript interfaces matching backend entities ──

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  accounts: Account[];
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  type: AccountType;
  balance: number;
  isActive: boolean;
  userId: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export enum AccountType {
  SAVINGS = "Savings",
  CURRENT = "Current",
  FIXED_DEPOSIT = "Fixed Deposit",
  LOAN = "Loan Account",
}

// ── API response wrappers ──

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
}

// ── Form payloads ──

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CreateAccountPayload {
  userId: number;
  type?: AccountType;
}

export interface TransactionPayload {
  amount: number;
}
