import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";

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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="loans" element={<LoanList />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="branches" element={<BranchList />} />
              <Route path="reports" element={<FinancialReports />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Employee Routes */}
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="loans" element={<LoanList />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="accounts" element={<CustomerAccounts />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="transfer" element={<Transfer />} />
              <Route path="loans" element={<LoanList />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
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
      </AuthProvider>
    </ThemeProvider>
  );
}

