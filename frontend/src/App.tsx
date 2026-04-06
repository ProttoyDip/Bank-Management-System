import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/notificationContext.tsx";
import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider as ThemeContextProvider, useThemeContext } from "./context/ThemeContext";
import AdminLayout from "./components/layout/AdminLayout";
import EmployeeLayout from "./components/layout/EmployeeLayout";
import CustomerLayout from "./components/layout/CustomerLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ChangePassword from "./pages/ChangePassword";
import InviteAccept from "./pages/InviteAccept";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import CustomerList from "./pages/customers/CustomerList";
import Accounts from "./pages/Accounts";
import Transfer from "./pages/Transfer";
import TransactionHistory from "./pages/transactions/TransactionHistory";
import LoanList from "./pages/loans/LoanList";
import EmployeeList from "./pages/employees/EmployeeList";
import FinancialReports from "./pages/reports/FinancialReports";
import Settings from "./pages/Settings";
import CustomerAccounts from "./pages/customers/CustomerAccounts";
import CustomerKyc from "./pages/customers/CustomerKyc";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminAccountsPage from "./pages/admin/AdminAccountsPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";
import AdminLoansPage from "./pages/admin/AdminLoansPage";
import AdminKycDashboard from "./pages/admin/AdminKycDashboard";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { UserRole } from "./types";
import EmployeeAccounts from "./pages/employee/EmployeeAccounts";
import EmployeeTransactions from "./pages/employee/EmployeeTransactions";
import EmployeeLoans from "./pages/employee/EmployeeLoans";
import EmployeeKyc from "./pages/employee/EmployeeKyc";
import EmployeeSupport from "./pages/employee/EmployeeSupport";
import EmployeeReports from "./pages/employee/EmployeeReports";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function ThemedApp() {
  const { currentTheme } = useThemeContext();

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <SearchProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/verify-code" element={<PublicRoute><VerifyCode /></PublicRoute>} />
                <Route path="/change-password" element={<PublicRoute><ChangePassword /></PublicRoute>} />
                <Route path="/accept-invite" element={<PublicRoute><InviteAccept /></PublicRoute>} />

                <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="employees" element={<AdminEmployeesPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="accounts" element={<AdminAccountsPage />} />
                    <Route path="transactions" element={<AdminTransactionsPage />} />
                    <Route path="loans" element={<AdminLoansPage />} />
                    <Route path="kyc" element={<AdminKycDashboard />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="logs" element={<AdminAuditLogsPage />} />
                  </Route>
                </Route>

                <Route path="/employee" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]} />}>
                  <Route element={<EmployeeLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="accounts" element={<EmployeeAccounts />} />
                    <Route path="transactions" element={<EmployeeTransactions />} />
                    <Route path="loans" element={<EmployeeLoans />} />
                    <Route path="kyc" element={<EmployeeKyc />} />
                    <Route path="reports" element={<EmployeeReports />} />
                    <Route path="support" element={<EmployeeSupport />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                <Route path="/customer" element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]} />}>
                  <Route element={<CustomerLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="accounts" element={<CustomerAccounts />} />
                    <Route path="transactions" element={<TransactionHistory />} />
                    <Route path="transfer" element={<Transfer />} />
                    <Route path="loans" element={<LoanList />} />
                    <Route path="kyc" element={<CustomerKyc />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
                <Route path="/accounts" element={<Navigate to="/admin/accounts" replace />} />
                <Route path="/transactions" element={<Navigate to="/admin/transactions" replace />} />
                <Route path="/loans" element={<Navigate to="/admin/loans" replace />} />
                <Route path="/employees" element={<Navigate to="/admin/employees" replace />} />
                <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
                <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                <Route path="/users" element={<Navigate to="/admin/customers" replace />} />
                <Route path="/transfer" element={<Navigate to="/admin/transactions" replace />} />
                <Route path="/kyc" element={<Navigate to="/admin/kyc" replace />} />
                <Route path="/logs" element={<Navigate to="/admin/logs" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </SearchProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeContextProvider>
      <ThemedApp />
    </ThemeContextProvider>
  );
}
