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
  adminId?: string;
  authCode?: string;
  accessLevel?: string;    // "Super Admin" or "Manager Admin"
  permissions?: string;    // JSON-encoded permissions
  department?: string;
  officeLocation?: string;
  nationalId?: string;
  twoFactorEnabled?: boolean;
  profilePhoto?: string;
  status?: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  type: AccountType | string;
  balance: number;
  isActive: boolean;
  userId: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
  status?: string;
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

export interface Loan {
  id: number;
  loanNumber: string;
  userId: number;
  accountId: number;
  type: LoanType | string;
  amount: number;
  interestRate: number;
  duration: number;
  monthlyPayment: number;
  remainingBalance: number;
  status: LoanStatus | string;
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
  UNDER_REVIEW_ADMIN = "Under Review (Admin)",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  ACTIVE = "Active",
  COMPLETED = "Completed",
  DEFAULTED = "Defaulted",
}

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType | string;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceNumber: string;
  createdAt: string;
  account?: Account;
  status?: string;
  flagged?: boolean;
}

export enum TransactionType {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
  TRANSFER_IN = "Transfer In",
  TRANSFER_OUT = "Transfer Out",
  LOAN_DISBURSEMENT = "Loan Disbursement",
  LOAN_PAYMENT = "Loan Payment",
}

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
  status?: string;
}

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

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface AdminCreateInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  nationalId: string;
  authCode: string;
  department: "IT" | "Operations" | "Compliance";
  officeLocation: string;
  accessLevel: "Super Admin" | "Manager Admin";
  permissions: string[];
  twoFactorEnabled?: boolean;
  securityQuestions?: {
    q1: string;
    ans1: string;
    q2: string;
    ans2: string;
  };
  role: "Admin";
}

export interface EmployeeCreateInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  nationalId: string;
  presentAddress: string;
  permanentAddress: string;
  department: string;
  position: string;
  branchId: number;
  employmentType: "Full-time" | "Contract";
  dailyTransactionLimit: number;
  permissions: string[];
  twoFactorEnabled?: boolean;
  salary?: number;
  hireDate?: string;
  role: "Employee";
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

export interface DashboardStats {
  totalCustomers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalLoans: number;
  totalBalance: number;
  activeAccounts: number;
}

export interface AdminDashboardStats {
  totalCustomers: number;
  totalEmployees: number;
  totalAccounts: number;
  totalTransactions: number;
  pendingLoans: number;
  totalBankBalance: number;
  recentTransactions?: AdminTransactionListItem[];
  transactionSummary?: AdminTransactionSummaryItem[];
}

export interface AdminTransactionSummaryItem {
  label?: string;
  type?: string;
  value?: number;
  count?: number;
  amount?: number;
}

export interface EmployeeInvite {
  id: number;
  email: string;
  name?: string;
  department?: string;
  position?: string;
  status?: string;
  invitedBy?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminReportMetric {
  label: string;
  value: number | string;
  change?: number;
}

export interface AdminReportResponse {
  generatedAt?: string;
  metrics?: AdminReportMetric[];
  transactionVolume?: AdminTransactionSummaryItem[];
  accountBreakdown?: Array<{ label: string; value: number }>;
  loanBreakdown?: Array<{ label: string; value: number }>;
  fraudAlerts?: Array<{ label: string; value: number }>;
  [key: string]: unknown;
}

export interface AdminSetting {
  id?: number;
  key: string;
  value: string;
  description?: string | null;
  category?: string | null;
  updatedAt?: string;
}

export interface AdminCustomerListItem extends User {
  status?: string;
  totalAccounts?: number;
  totalBalance?: number;
}

export interface AdminEmployeeListItem extends Employee {
  user?: User;
  fullName?: string;
  email?: string;
}

export interface AdminAccountListItem extends Account {
  user?: User;
  customerName?: string;
  customerEmail?: string;
}

export interface AdminTransactionListItem extends Transaction {
  account?: Account;
  user?: User;
  accountNumber?: string;
  customerName?: string;
}

export interface AdminLoanListItem extends Loan {
  user?: User;
  account?: Account;
  customerName?: string;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  details?: string | null;
  actorId?: number | null;
  actorName?: string | null;
  actorRole?: string | null;
  targetId?: number | null;
  createdAt: string;
}

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
  fullName?: string;
  dob?: string | null;
  country?: string | null;
  transactionIntent?: string | null;
  submittedDate?: string;
  riskLevel?: "Low" | "Medium" | "High" | string;
  riskScore?: number;
  riskFactors?: string[];
  documents?: KycDocumentPreview[];
  timeline?: KycTimelineEntry[];
  auditTrail?: ActivityLog[];
  profile?: {
    fullName?: string;
    dob?: string;
    address?: string;
    nationalId?: string;
    passportNumber?: string;
    country?: string;
    transactionIntent?: string;
    riskLevel?: string;
    riskScore?: number;
    riskFactors?: string[];
    submittedAt?: string;
  };
}

export interface KycDocumentPreview {
  id: string;
  type: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  isValid: boolean | null;
  validationRemark: string | null;
}

export interface KycTimelineEntry {
  label: string;
  at: string | Date;
  status: string;
  comment?: string | null;
}

export interface KycOverviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
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
