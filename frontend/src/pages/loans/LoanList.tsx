import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Loan, LoanType, LoanStatus, User, Account, ApiResponse, CreateLoanPayload, UserRole } from "../../types";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const loanTypes = Object.values(LoanType);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ChartEntry {
  month: string;
  approved: number;
  rejected: number;
}

export default function LoanList() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [chartData, setChartData] = useState<ChartEntry[]>([]);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [form, setForm] = useState<Omit<CreateLoanPayload, "amount" | "interestRate" | "duration"> & { amount: string; interestRate: string; duration: string }>({
    userId: 0,
    accountId: 0,
    type: LoanType.PERSONAL,
    amount: "",
    interestRate: "10",
    duration: "12",
  });

  const fetchLoans = async () => {
    try {
      let response;
      
      if (user?.role === UserRole.CUSTOMER) {
        // For customers, get loans for their user ID
        response = await api.get<ApiResponse<Loan[]>>(`/loans/user/${user.id}`);
      } else {
        // For admin/employee, get all loans
        response = await api.get<ApiResponse<Loan[]>>("/loans");
      }
      
      const data = response.data.data;
      setLoans(data);

      // Aggregate by month for chart
      const agg: Record<string, ChartEntry> = {};
      MONTHS.forEach((m) => { agg[m] = { month: m, approved: 0, rejected: 0 }; });
      data.forEach((loan) => {
        const month = MONTHS[new Date(loan.createdAt).getMonth()];
        if (loan.status === LoanStatus.REJECTED) {
          agg[month].rejected += 1;
        } else {
          agg[month].approved += 1;
        }
      });
      setChartData(MONTHS.map((m) => agg[m]));
    } catch {
      setSnack({ open: true, message: "Failed to load loans", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchLoans();
      try {
        // For customers, only fetch their own data
        if (user?.role === UserRole.CUSTOMER) {
          // Set the form userId to current user
          setForm(prev => ({ ...prev, userId: user.id }));
          
          // Fetch only the current user's accounts
          const accountsRes = await api.get<ApiResponse<Account[]>>(`/accounts/user/${user.id}`);
          setAccounts(accountsRes.data.data);
        } else {
          // For admin/employee, fetch all users and accounts
          const [usersRes, accountsRes] = await Promise.all([
            api.get<ApiResponse<User[]>>("/users"),
            api.get<ApiResponse<Account[]>>("/accounts"),
          ]);
          setUsers(usersRes.data.data);
          setAccounts(accountsRes.data.data);
        }
      } catch {
        // Non-critical: dialog will show empty dropdowns
      }
    };
    fetchAll();
  }, [user]);

  const filteredAccounts = accounts.filter((a) => a.userId === form.userId);

  const statusColor = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.ACTIVE:
        return "success";
      case LoanStatus.PENDING:
        return "warning";
      case LoanStatus.COMPLETED:
        return "info";
      case LoanStatus.DEFAULTED:
        return "error";
      default:
        return "default";
    }
  };

  const handleCreate = async () => {
    if (!form.userId || !form.accountId || !form.amount) {
      setSnack({ open: true, message: "Please fill in all required fields", severity: "error" });
      return;
    }
    try {
      await api.post<ApiResponse<Loan>>("/loans", {
        userId: form.userId,
        accountId: form.accountId,
        type: form.type,
        amount: Number(form.amount),
        interestRate: Number(form.interestRate),
        duration: Number(form.duration),
      });
      setSnack({ open: true, message: "Loan application submitted successfully", severity: "success" });
      setDialogOpen(false);
      // Reset form - for customers, keep their userId
      const resetUserId = user?.role === UserRole.CUSTOMER ? user.id : 0;
      setForm({ userId: resetUserId, accountId: 0, type: LoanType.PERSONAL, amount: "", interestRate: "10", duration: "12" });
      fetchLoans();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to submit loan application";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  const totalDisbursed = loans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + Number(l.remainingBalance), 0);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: {xs: '100%', sm: 1200, lg: 1600}, mx: "auto", px: {xs: 2, sm: 0} }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Loans</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage loan applications and disbursements
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 600 }}>
          New Loan
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Total Loans</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{loans.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Total Disbursed</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>৳{(totalDisbursed / 100000).toFixed(1)}L</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Outstanding</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>৳{(totalOutstanding / 100000).toFixed(1)}L</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Active Loans</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {loans.filter(l => l.status === LoanStatus.ACTIVE).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Loan Applications</Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="approved" fill="#22c55e" name="Approved" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Loan Types</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.values(LoanType).map((type) => {
                  const count = loans.filter(l => l.type === type).length;
                  return (
                    <Box key={type} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{type}</Typography>
                      <Chip label={count} size="small" color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loans Table */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h6" sx={{ p: { xs: 2, sm: 3 }, pb: 2, fontWeight: 600 }}>Loan Details</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Loan #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Interest</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Monthly</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Outstanding</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{loan.loanNumber}</TableCell>
                    <TableCell>{loan.type}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>৳{loan.amount.toLocaleString()}</TableCell>
                    <TableCell align="right">{loan.interestRate}%</TableCell>
                    <TableCell align="right">৳{loan.monthlyPayment.toLocaleString()}</TableCell>
                    <TableCell align="right">৳{loan.remainingBalance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={loan.status} size="small" color={statusColor(loan.status) as any} sx={{ fontWeight: 500 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* New Loan Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Apply for New Loan</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: {xs: 2, sm: 2.5}, pt: "16px !important", px: {xs: 2, md: 3} }}>
          {/* Only show customer selection for admin/employee, not for customers */}
          {user?.role !== UserRole.CUSTOMER && (
            <TextField
              select
              label="Select Customer"
              fullWidth
              value={form.userId || ""}
              onChange={(e) => setForm({ ...form, userId: Number(e.target.value), accountId: 0 })}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            select
            label="Select Account"
            fullWidth
            value={form.accountId || ""}
            onChange={(e) => setForm({ ...form, accountId: Number(e.target.value) })}
            disabled={!form.userId}
          >
            {filteredAccounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.accountNumber} ({a.type})</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Loan Type"
            fullWidth
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as LoanType })}
          >
            {loanTypes.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Loan Amount (৳)"
            type="number"
            fullWidth
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <TextField
            label="Interest Rate (%)"
            type="number"
            fullWidth
            value={form.interestRate}
            onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
          />
          <TextField
            label="Duration (months)"
            type="number"
            fullWidth
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.userId || !form.accountId || !form.amount}>
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}