import api from "./api";
import {
  Account,
  ActivityLog,
  ApiResponse,
  EmployeeDashboardStats,
  EmployeeReportsResponse,
  KycRequest,
  Loan,
  Ticket,
  Transaction,
  User,
} from "../types";

export const employeeService = {
  getDashboardStats: async () =>
    (await api.get<ApiResponse<EmployeeDashboardStats>>("/employee/dashboard-stats")).data.data,

  getAccounts: async (q?: string) =>
    (await api.get<ApiResponse<Account[]>>("/employee/accounts", { params: q ? { q } : {} })).data.data,

  searchAccounts: async (q: string) =>
    (await api.get<ApiResponse<Account[]>>("/employee/accounts/search", { params: { q } })).data.data,

  updateAccountStatus: async (accountId: number, isActive: boolean) =>
    (await api.put<ApiResponse<Account>>(`/employee/accounts/${accountId}/status`, { isActive })).data.data,

  updateCustomerInfo: async (accountId: number, payload: Partial<Pick<User, "name" | "email" | "phone" | "address">>) =>
    (await api.put<ApiResponse<User>>(`/employee/accounts/${accountId}/customer`, payload)).data.data,

  deposit: async (payload: { accountNumber: string; amount: number; description?: string }) =>
    (await api.post<ApiResponse<Transaction>>("/employee/deposit", payload)).data.data,

  withdraw: async (payload: { accountNumber: string; amount: number; description?: string }) =>
    (await api.post<ApiResponse<Transaction>>("/employee/withdraw", payload)).data.data,

  transfer: async (payload: { senderAccountNumber: string; receiverAccountNumber: string; amount: number; description?: string }) =>
    (await api.post("/employee/transfer", payload)).data.data,

  getTransactions: async (params?: { date?: string; type?: string; status?: string; flagged?: boolean }) =>
    (await api.get<ApiResponse<Transaction[]>>("/employee/transactions", { params })).data.data,

  reviewTransaction: async (id: number, payload: { status: "Approved" | "Suspicious"; remarks?: string }) =>
    (await api.put<ApiResponse<Transaction>>(`/employee/transactions/${id}/status`, payload)).data.data,

  getLoans: async (status?: string) =>
    (await api.get<ApiResponse<Loan[]>>("/employee/loans", { params: status ? { status } : {} })).data.data,

  approveLoan: async (id: number, remarks?: string) =>
    (await api.put<ApiResponse<Loan>>(`/employee/loans/${id}/approve`, { remarks })).data.data,

  rejectLoan: async (id: number, remarks?: string) =>
    (await api.put<ApiResponse<Loan>>(`/employee/loans/${id}/reject`, { remarks })).data.data,

  getKyc: async (status = "Pending") =>
    (await api.get<ApiResponse<KycRequest[]>>("/employee/kyc", { params: { status } })).data.data,

  verifyKyc: async (id: number, remarks?: string) =>
    (await api.put<ApiResponse<KycRequest>>(`/employee/kyc/${id}/approve`, { remarks })).data.data,

  getTickets: async (status?: string) =>
    (await api.get<ApiResponse<Ticket[]>>("/employee/tickets", { params: status ? { status } : {} })).data.data,

  resolveTicket: async (id: number, response: string) =>
    (await api.put<ApiResponse<Ticket>>(`/employee/tickets/${id}/resolve`, { response })).data.data,

  getReports: async () =>
    (await api.get<ApiResponse<EmployeeReportsResponse>>("/employee/reports")).data.data,

  getActivityLogs: async (limit = 30) =>
    (await api.get<ApiResponse<ActivityLog[]>>("/employee/activity-logs", { params: { limit } })).data.data,

  searchAccountByNumber: async (accountNumber: string) =>
    (await api.get<ApiResponse<{ id: number; accountNumber: string; name: string; userId: number; isActive: boolean }>>("/accounts/search", { params: { accountNumber } })).data.data,
};

export default employeeService;
