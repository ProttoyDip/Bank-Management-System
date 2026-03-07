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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";
import { Loan, LoanType, LoanStatus, User, Account, ApiResponse } from "../../types";
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
const loanStatuses = Object.values(LoanStatus);

// Mock data for demo
const mockLoans: Loan[] = [
  {
    id: 1,
    loanNumber: "LN-2024-001",
    userId: 1,
    accountId: 1,
    type: LoanType.HOME,
    amount: 500000,
    interestRate: 8.5,
    duration: 240,
    monthlyPayment: 4343.52,
    remainingBalance: 450000,
    status: LoanStatus.ACTIVE,
    startDate: "2024-01-15",
    endDate: "2044-01-15",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    loanNumber: "LN-2024-002",
    userId: 2,
    accountId: 2,
    type: LoanType.PERSONAL,
    amount: 100000,
    interestRate: 12,
    duration: 36,
    monthlyPayment: 3321.45,
    remainingBalance: 85000,
    status: LoanStatus.ACTIVE,
    startDate: "2024-03-01",
    endDate: "2027-03-01",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
  },
  {
    id: 3,
    loanNumber: "LN-2024-003",
    userId: 3,
    accountId: 3,
    type: LoanType.CAR,
    amount: 300000,
    interestRate: 10,
    duration: 60,
    monthlyPayment: 6374.25,
    remainingBalance: 280000,
    status: LoanStatus.ACTIVE,
    startDate: "2024-02-15",
    endDate: "2029-02-15",
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
  },
];

const chartData = [
  { month: "Jan", approved: 12, rejected: 2 },
  { month: "Feb", approved: 15, rejected: 3 },
  { month: "Mar", approved: 18, rejected: 2 },
  { month: "Apr", approved: 14, rejected: 1 },
  { month: "May", approved: 20, rejected: 4 },
  { month: "Jun", approved: 22, rejected: 3 },
];

export default function LoanList() {
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [form, setForm] = useState({
    userId: 0,
    accountId: 0,
    type: LoanType.PERSONAL,
    amount: "",
    interestRate: "10",
    duration: "12",
  });

  // For demo, just use mock data
  useEffect(() => {
    // In real app, fetch from API
    setLoans(mockLoans);
    setLoading(false);
  }, []);

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

  const totalDisbursed = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + l.remainingBalance, 0);

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
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
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
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
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
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
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
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
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
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
            <CardContent sx={{ p: 3 }}>
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
            <CardContent sx={{ p: 3 }}>
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
          <Typography variant="h6" sx={{ p: 3, pb: 2, fontWeight: 600 }}>Loan Details</Typography>
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
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            select
            label="Select Customer"
            fullWidth
            value={form.userId || ""}
            onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
          >
            <MenuItem value={1}>John Doe</MenuItem>
            <MenuItem value={2}>Jane Smith</MenuItem>
            <MenuItem value={3}>Bob Johnson</MenuItem>
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
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
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

