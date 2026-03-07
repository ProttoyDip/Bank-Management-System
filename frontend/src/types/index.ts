// ── TypeScript interfaces matching backend entities ──

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role?: UserRole;
  accounts?: Account[];
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

export enum UserRole {
  ADMIN = "Admin",
  EMPLOYEE = "Employee",
  CUSTOMER = "Customer",
}

// ── Loan Types ──
export interface Loan {
  id: number;
  loanNumber: string;
  userId: number;
  accountId: number;
  type: LoanType;
  amount: number;
  interestRate: number;
  duration: number; // months
  monthlyPayment: number;
  remainingBalance: number;
  status: LoanStatus;
  startDate: string;
  endDate: string;
  user?: User;
  account?: Account;
  createdAt: string;
  updatedAt: string;
}

export enum LoanType {
  PERSONAL = "Personal Loan",
  HOME = "Home Loan",
  CAR = "Car Loan",
  EDUCATION = "Education Loan",
  BUSINESS = "Business Loan",
}

export enum LoanStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  ACTIVE = "Active",
  COMPLETED = "Completed",
  DEFAULTED = "Defaulted",
}

// ── Transaction Types ──
export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceNumber: string;
  createdAt: string;
  account?: Account;
}

export enum TransactionType {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
  TRANSFER_IN = "Transfer In",
  TRANSFER_OUT = "Transfer Out",
  LOAN_DISBURSEMENT = "Loan Disbursement",
  LOAN_PAYMENT = "Loan Payment",
}

// ── Employee Types ──
export interface Employee {
  id: number;
  userId: number;
  employeeId: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ── Branch Types ──
export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  description?: string;
}

export interface CreateLoanPayload {
  userId: number;
  accountId: number;
  type: LoanType;
  amount: number;
  interestRate: number;
  duration: number;
}

export interface CreateEmployeePayload {
  userId: number;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
}

export interface CreateBranchPayload {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerId: number;
}

// ── Dashboard Stats ──
export interface DashboardStats {
  totalCustomers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalLoans: number;
  totalBalance: number;
  activeAccounts: number;
}

// ── Chart Data Types ──
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  deposits: number;
  withdrawals: number;
  loans: number;
}

