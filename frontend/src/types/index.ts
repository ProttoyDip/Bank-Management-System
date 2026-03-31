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
  // Admin fields
  adminId?: string;
  authCode?: string;
  accessLevel?: string;
  department?: string;
  officeLocation?: string;
  // Shared
  nationalId?: string;
  twoFactorEnabled?: boolean;
  profilePhoto?: string;
  status?: string;
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
  PERSONAL = "Personal",
  HOME = "Home",
  CAR = "Car",
  EDUCATION = "Education",
  BUSINESS = "Business",
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

// Role-specific creation payloads matching backend schemas
export interface AdminCreateInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  nationalId: string;
  authCode: string;
  department: 'IT' | 'Operations' | 'Compliance';
  officeLocation: string;
  accessLevel: 'Super Admin' | 'Manager Admin';
  permissions: string[];
  twoFactorEnabled?: boolean;
  securityQuestions?: {
    q1: string;
    ans1: string;
    q2: string;
    ans2: string;
  };
  role: 'Admin';
}

export interface EmployeeCreateInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  nationalId: string;
  presentAddress: string;
  permanentAddress: string;
  department: string;
  position: string;
  branchId: number;
  employmentType: 'Full-time' | 'Contract';
  dailyTransactionLimit: number;
  permissions: string[];
  twoFactorEnabled?: boolean;
  salary?: number;
  hireDate?: string; // YYYY-MM-DD
  role: 'Employee';
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

// ── Notification Types ──
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  transactionId?: number;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  TRANSACTION = "Transaction",
  LOAN = "Loan",
  ACCOUNT = "Account",
  SYSTEM = "System",
  WARNING = "Warning",
}

export interface EmployeeDashboardStats {
  totalCustomers: number;
  totalAccounts: number;
  totalTransactionsToday: number;
  pendingLoanApplications: number;
  flaggedTransactions: number;
}

export interface KycRequest {
  id: number;
  userId: number;
  status: string;
  documentType?: string | null;
  documentRef?: string | null;
  remarks?: string | null;
  verifiedByEmployeeId?: number | null;
  verifiedAt?: string | null;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  userId: number;
  message: string;
  status: string;
  response?: string | null;
  resolvedByEmployeeId?: number | null;
  resolvedAt?: string | null;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: number;
  employeeId: number;
  action: string;
  details?: string | null;
  createdAt: string;
}

export interface EmployeeReportsResponse {
  dailyReport: {
    date: string;
    totalCount: number;
    totalAmount: number;
    byType: { deposit: number; withdraw: number; transfer: number };
  };
  monthlySummary: {
    month: string;
    totalCount: number;
    totalAmount: number;
    deposits: number;
    withdrawals: number;
    transfers: number;
  };
  loanStatistics: {
    totalApplications: number;
    pending: number;
    approved: number;
    rejected: number;
    totalLoanAmount: number;
  };
  trendLast7Days: Array<{ date: string; totalCount: number; totalAmount: number }>;
}

