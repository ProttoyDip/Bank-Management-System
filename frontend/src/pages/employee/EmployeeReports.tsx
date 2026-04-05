import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid2,
  Typography,
} from "@mui/material";
import { Bar, BarChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import employeeService from "../../services/employeeService";
import { EmployeeReportsResponse } from "../../types";

export default function EmployeeReports() {
  const [reports, setReports] = useState<EmployeeReportsResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await employeeService.getReports();
      setReports(data);
    };
    load();
  }, []);

  const dailyByType = reports ? [
    { type: "Deposit", count: reports.dailyReport.byType.deposit },
    { type: "Withdraw", count: reports.dailyReport.byType.withdraw },
    { type: "Transfer", count: reports.dailyReport.byType.transfer },
  ] : [];

  const loanStats = reports ? [
    { status: "Pending", count: reports.loanStatistics.pending },
    { status: "Approved", count: reports.loanStatistics.approved },
    { status: "Rejected", count: reports.loanStatistics.rejected },
  ] : [];

  return (
    <Box>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Daily Transactions Report</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Date: {reports?.dailyReport.date || "-"} | Total: {reports?.dailyReport.totalCount || 0}
              </Typography>
              <Box sx={{ width: "100%", height: 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyByType}>
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Monthly Summary ({reports?.monthlySummary.month || "-"})</Typography>
              <Box sx={{ width: "100%", height: 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reports?.trendLast7Days || []}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="totalCount" stroke="#7c3aed" />
                    <Line dataKey="totalAmount" stroke="#059669" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={12}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Loan Statistics</Typography>
              <Box sx={{ width: "100%", height: 280, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loanStats}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}
