import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(""); 

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearch(decodeURIComponent(q));
    }
  }, [searchParams]);
  const [typeFilter, setTypeFilter] = useState("all");
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");
        
        let response;
        
        if (user?.role === UserRole.CUSTOMER) {
          response = await api.get<ApiResponse<Transaction[]>>("/transactions/my-transactions?limit=500");
        } else {
          response = await api.get<ApiResponse<Transaction[]>>("/transactions");
        }
        
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

  useEffect(() => {
    const txId = searchParams.get('txId');
    if (txId && transactions.length > 0) {
      const targetTx = transactions.find(t => t.id === parseInt(txId));
      if (targetTx) {
        setSearch(targetTx.referenceNumber || targetTx.description || '');
        setTypeFilter(targetTx.type.toLowerCase().includes('deposit') ? 'deposit' : targetTx.type.toLowerCase().includes('withdraw') ? 'withdraw' : 'transfer');
        setTimeout(() => {
          if (tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  }, [transactions, searchParams]);

  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    const weeklyData: { [key: string]: { deposits: number; withdrawals: number } } = {};
    
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
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <Box sx={{ maxWidth: {xs: '100%', sm: 1200, lg: 1600}, mx: "auto", p: {xs: 2, sm: 3} }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: {xs: '100%', sm: 1200, lg: 1600}, mx: "auto", px: {xs: 1, sm: 2, lg: 0} }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Transactions</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all transactions
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: {xs: 2, sm: 3} }}>
          <Grid container spacing={2} alignItems="center" flexWrap="wrap">
            <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={4}>
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
        <Grid item xs={12} lg={8} xl={9}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: {xs: 2, sm: 3} }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Weekly Overview</Typography>
              <Box sx={{ height: 280, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
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
        <Grid item xs={12} lg={4} xl={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: {xs: 2, sm: 3} }}>
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
          <Typography variant="h6" sx={{ p: {xs: 2, sm: 3}, pb: 2, fontWeight: 600 }}>Transaction History</Typography>
          <TableContainer ref={tableRef} sx={{ overflowX: {xs: 'auto', md: 'visible'} }}>
            <Table sx={{ minWidth: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, px: {xs:0.5, sm:1.5, md:2.5, lg:3} }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
                  <TableRow 
                    key={transaction.id} 
                    hover
                    sx={{
                      backgroundColor: search && (
                        transaction.description?.toLowerCase().includes(search.toLowerCase()) ||
                        transaction.referenceNumber?.toLowerCase().includes(search.toLowerCase())
                      ) ? 'primary.50' : 'inherit',
                    }}
                  >
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: {xs:'0.75rem', sm:'0.8rem', md:'0.85rem'} }}>
                      {transaction.referenceNumber}
                    </TableCell>
                    <TableCell sx={{ maxWidth: {xs: 120, sm: 200}, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transaction.description}</TableCell>
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
