import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Transaction, TransactionType, ApiResponse, UserRole } from "../../types";

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");
        
        let response;
        
        if (user?.role === UserRole.CUSTOMER && user.accounts && user.accounts.length > 0) {
          // For customers, get transactions for their first account
          const accountId = user.accounts[0].id;
          response = await api.get<ApiResponse<Transaction[]>>(`/transactions/account/${accountId}`);
        } else {
          // For admin/employee, get all transactions
          response = await api.get<ApiResponse<Transaction[]>>("/transactions");
        }
        
        // Sort by date descending (newest first)
        const sortedTransactions = (response.data.data || []).sort(
          (a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setTransactions(sortedTransactions);
      } catch (err: any) {
        console.error("Error fetching transactions:", err);
        setError(err.response?.data?.error || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Compute chart data from transactions (grouped by week)
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    const weeklyData: { [key: string]: { deposits: number; withdrawals: number } } = {};
    
    // Initialize 4 weeks
    for (let i = 0; i < 4; i++) {
      weeklyData[`Week ${i + 1}`] = { deposits: 0, withdrawals: 0 };
    }

    transactions.forEach((txn) => {
      const txnDate = new Date(txn.createdAt);
      if (txnDate < fourWeeksAgo) return;

      const daysDiff = Math.floor((now.getTime() - txnDate.getTime()) / (24 * 60 * 60 * 1000));
      const weekIndex = Math.min(3, Math.floor((27 - daysDiff) / 7));
      const weekKey = `Week ${weekIndex + 1}`;

      if (txn.type === TransactionType.DEPOSIT || txn.type === TransactionType.TRANSFER_IN) {
        weeklyData[weekKey].deposits += txn.amount;
      } else if (txn.type === TransactionType.WITHDRAW || txn.type === TransactionType.TRANSFER_OUT) {
        weeklyData[weekKey].withdrawals += Math.abs(txn.amount);
      }
    });

    return Object.entries(weeklyData).map(([month, data]) => ({
      month,
      deposits: data.deposits,
      withdrawals: data.withdrawals,
    }));
  }, [transactions]);

  // Compute summary stats from transactions
  const summaryStats = useMemo(() => {
    const totalDeposits = transactions
      .filter(t => t.type === TransactionType.DEPOSIT || t.type === TransactionType.TRANSFER_IN)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = transactions
      .filter(t => t.type === TransactionType.WITHDRAW || t.type === TransactionType.TRANSFER_OUT)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalDeposits,
      totalWithdrawals,
      netFlow: totalDeposits - totalWithdrawals,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.TRANSFER_IN:
        return "success";
      case TransactionType.WITHDRAW:
      case TransactionType.TRANSFER_OUT:
        return "error";
      default:
        return "default";
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, " ");
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || 
      t.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1600, mx: "auto", p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Transactions</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all transactions
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Search transactions..."
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="deposit">Deposits</MenuItem>
                  <MenuItem value="withdraw">Withdrawals</MenuItem>
                  <MenuItem value="transfer">Transfers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chart and Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Weekly Overview</Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `৳${v / 1000}k`} />
                    <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, ""]} />
                    <Bar dataKey="deposits" fill="#22c55e" name="Deposits" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Summary</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Total Deposits</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                    ৳{summaryStats.totalDeposits.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Total Withdrawals</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main" }}>
                    ৳{summaryStats.totalWithdrawals.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Net Flow</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                    ৳{summaryStats.netFlow.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {summaryStats.totalTransactions}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h6" sx={{ p: 3, pb: 2, fontWeight: 600 }}>Transaction History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                      {transaction.referenceNumber}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatType(transaction.type)}
                        size="small"
                        color={getTypeColor(transaction.type) as any}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: transaction.amount > 0 ? "success.main" : "error.main",
                      }}
                    >
                      {transaction.amount > 0 ? "+" : ""}৳{Math.abs(transaction.amount).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                      ৳{transaction.balanceAfter.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No transactions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

