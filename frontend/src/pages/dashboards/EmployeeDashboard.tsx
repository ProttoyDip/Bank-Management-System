import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid2,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TodayIcon from "@mui/icons-material/Today";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import employeeService from "../../services/employeeService";
import { ActivityLog, EmployeeDashboardStats, EmployeeReportsResponse } from "../../types";

const statConfig = [
  { key: "totalCustomers", label: "Total Customers", icon: <PeopleIcon />, color: "#2563eb" },
  { key: "totalAccounts", label: "Total Accounts", icon: <AccountBalanceIcon />, color: "#059669" },
  { key: "totalTransactionsToday", label: "Transactions Today", icon: <TodayIcon />, color: "#d97706" },
  { key: "pendingLoanApplications", label: "Pending Loans", icon: <PendingActionsIcon />, color: "#7c3aed" },
  { key: "flaggedTransactions", label: "Flagged Transactions", icon: <ReportProblemIcon />, color: "#dc2626" },
] as const;

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);
  const [reports, setReports] = useState<EmployeeReportsResponse | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, reportsData, logsData] = await Promise.all([
          employeeService.getDashboardStats(),
          employeeService.getReports(),
          employeeService.getActivityLogs(12),
        ]);
        setStats(statsData);
        setReports(reportsData);
        setLogs(logsData);
      } catch {
        setError("Failed to load employee dashboard data.");
      }
    };
    load();
  }, []);

  const trendData = useMemo(
    () =>
      (reports?.trendLast7Days || []).map((d) => ({
        date: d.date.slice(5),
        amount: Math.round(d.totalAmount),
      })),
    [reports]
  );

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid2 container spacing={2} sx={{ mb: 3 }}>
        {statConfig.map((item) => (
          <Grid2 key={item.key} size={{ xs: 12, sm: 6, lg: item.key === "flaggedTransactions" ? 12 : 3 }}>
            <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats ? (stats as any)[item.key] : "-"}</Typography>
                  </Box>
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Daily Transaction Trend (7 Days)</Typography>
              <Box sx={{ width: "100%", height: 320, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" mb={1}>Recent Activity</Typography>
              <List dense>
                {logs.map((log) => (
                  <ListItem key={log.id} disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary={log.action}
                      secondary={
                        <Box component="span">
                          <Chip size="small" label={new Date(log.createdAt).toLocaleString()} sx={{ mr: 1 }} />
                          {log.details || ""}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {logs.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No activity logs yet.</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
