import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider as ThemeContextProvider, useThemeContext } from "./context/ThemeContext";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import EmployeeLayout from "./components/layout/EmployeeLayout";
import CustomerLayout from "./components/layout/CustomerLayout";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ChangePassword from "./pages/ChangePassword";

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";

// Admin Pages
import CustomerList from "./pages/customers/CustomerList";
import Accounts from "./pages/Accounts";
import Transfer from "./pages/Transfer";
import TransactionHistory from "./pages/transactions/TransactionHistory";
import LoanList from "./pages/loans/LoanList";
import EmployeeList from "./pages/employees/EmployeeList";
import BranchList from "./pages/branches/BranchList";
import FinancialReports from "./pages/reports/FinancialReports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";

import CustomerAccounts from "./pages/customers/CustomerAccounts";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { UserRole } from "./types";
import EmployeeAccounts from "./pages/employee/EmployeeAccounts";
import EmployeeTransactions from "./pages/employee/EmployeeTransactions";
import EmployeeLoans from "./pages/employee/EmployeeLoans";
import EmployeeKyc from "./pages/employee/EmployeeKyc";
import EmployeeSupport from "./pages/employee/EmployeeSupport";
import EmployeeReports from "./pages/employee/EmployeeReports";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
                {/* Public Routes - Protected by PublicRoute */}
                <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/verify-code" element={<PublicRoute><VerifyCode /></PublicRoute>} />
                <Route path="/change-password" element={<PublicRoute><ChangePassword /></PublicRoute >} />

                {/* Admin Routes - Protected */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="customers" element={<CustomerList />} />
                    <Route path="accounts" element={<Accounts />} />
                    <Route path="transactions" element={<TransactionHistory />} />
                    <Route path="loans" element={<LoanList />} />
                    <Route path="employees" element={<EmployeeList />} />
                    <Route path="branches" element={<BranchList />} />
                    <Route path="reports" element={<FinancialReports />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Employee Routes - Protected */}
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

                {/* Customer Routes - Protected */}
                <Route path="/customer" element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]} />}>
                  <Route element={<CustomerLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="accounts" element={<CustomerAccounts />} />
                    <Route path="transactions" element={<TransactionHistory />} />
                    <Route path="transfer" element={<Transfer />} />
                    <Route path="loans" element={<LoanList />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Legacy Routes - Redirect to admin */}
                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
                <Route path="/accounts" element={<Navigate to="/admin/accounts" replace />} />
                <Route path="/transactions" element={<Navigate to="/admin/transactions" replace />} />
                <Route path="/loans" element={<Navigate to="/admin/loans" replace />} />
                <Route path="/employees" element={<Navigate to="/admin/employees" replace />} />
                <Route path="/branches" element={<Navigate to="/admin/branches" replace />} />
                <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
                <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                <Route path="/users" element={<Navigate to="/admin/customers" replace />} />
                <Route path="/transfer" element={<Navigate to="/admin/transactions" replace />} />

                {/* Catch all - redirect to home */}
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
