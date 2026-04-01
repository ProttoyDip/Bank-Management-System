import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button, 
  Divider,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  IconButton,
  Alert,
  InputAdornment,
  ToggleButton,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  SnackbarContent,
  Alert as MuiAlert
} from "@mui/material";

import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SwapHoriz as SwapHorizIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  AccountBalance as AccountBalanceIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";
import { useTheme } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import api from "../../services/api";
import { Account, ApiResponse, Transaction, TransactionType } from "../../types";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer as PieResponsiveContainer
} from "recharts";

import { useSearch } from "../../context/SearchContext";

function getTxKind(type: TransactionType | string): "deposit" | "withdraw" | "transfer" | "loan" {
  if (type === TransactionType.DEPOSIT || type === TransactionType.TRANSFER_IN || type === TransactionType.LOAN_DISBURSEMENT || 
      type === "Deposit" || type === "Transfer In" || type === "Loan Disbursement") return "deposit";
  if (type === TransactionType.WITHDRAW || type === TransactionType.TRANSFER_OUT || type === TransactionType.LOAN_PAYMENT ||
      type === "Withdraw" || type === "Transfer Out" || type === "Loan Payment") return "withdraw";
  return "transfer";
}

interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

type QuickMode = "deposit" | "withdraw" | "transfer";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
// Snackbar state for quick notifications (local)
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'} | null>(null);

  const showSnack = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };
  const navigate = useNavigate();
  const { isDarkMode } = useThemeContext();
  const theme = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetOpen, setBudgetOpen] = useState(false);

  // Search filtered data
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const lowerQuery = searchQuery.toLowerCase();
    return accounts.filter(acc => 
      acc.accountNumber.toLowerCase().includes(lowerQuery) ||
      acc.type.toLowerCase().includes(lowerQuery) ||
      acc.balance.toString().includes(lowerQuery)
    );
  }, [accounts, searchQuery]);

  const filteredRecentTransactions = useMemo(() => {
    if (!searchQuery.trim()) return recentTransactions;
    const lowerQuery = searchQuery.toLowerCase();
    return recentTransactions.filter(tx => 
      tx.description?.toLowerCase().includes(lowerQuery) ||
      tx.referenceNumber?.toLowerCase().includes(lowerQuery) ||
      tx.type.toLowerCase().includes(lowerQuery) ||
      tx.amount.toString().includes(lowerQuery)
    );
  }, [recentTransactions, searchQuery]);

  const filteredTrendData = useMemo(() => {
    if (!searchQuery.trim()) return trendData;
    return trendData; // Trend is aggregate, less filterable
  }, [trendData, searchQuery]);

  const filteredSpendingData = useMemo(() => {
    if (!searchQuery.trim()) return spendingData;
    const lowerQuery = searchQuery.toLowerCase();
    return spendingData.filter(cat => 
      cat.name.toLowerCase().includes(lowerQuery)
    );
  }, [spendingData, searchQuery]);

  // Quick Transaction states
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickMode, setQuickMode] = useState<QuickMode>("deposit");
  const [selectedAccountId, setSelectedAccountId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState<number | null>(null);
  const [destinationAccountName, setDestinationAccountName] = useState("");
  const [searchingDestination, setSearchingDestination] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [selectedAccountBalance, setSelectedAccountBalance] = useState(0);

  const selectedAccount = accounts.find(acc => acc.id === Number(selectedAccountId));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (user) {
        const res = await api.get<ApiResponse<Account[]>>(`/accounts/my-accounts`);
        const userAccounts = res.data.data || [];
        setAccounts(userAccounts);
        if (userAccounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(userAccounts[0].id);
        }

        const txRes = await api.get<ApiResponse<Transaction[]>>(`/transactions/my-transactions?limit=200`);
        const allTx = (txRes.data.data || []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentTransactions(allTx.slice(0, 10));

        const weeklyTrend = computeWeeklyTrend(allTx);
        setTrendData(weeklyTrend);

        const spending = computeSpendingCategories(allTx.slice(0, 100));
        setSpendingData(spending);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedAccountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedAccount) {
      setSelectedAccountBalance(Number(selectedAccount.balance));
    }
  }, [selectedAccountId, accounts]);

  const totalBalance = filteredAccounts.reduce((sum: number, a: Account) => sum + Number(a.balance), 0);

  const computeWeeklyTrend = (txs: Transaction[]) => {
    const now = new Date();
    const weekly = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekTx = txs.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= weekStart && txDate <= weekEnd;
      });
      const netChange = weekTx.reduce((net, tx) => {
        return tx.amount > 0 ? net + tx.amount : net - Math.abs(tx.amount);
      }, 0);
      weekly.push({
        week: `W${12 - i}`,
        balanceChange: netChange / 1000
      });
    }
    return weekly;
  };

  const computeSpendingCategories = (txs: Transaction[]): SpendingCategory[] => {
    const categories = {
      'Deposits': 0,
      'Withdrawals': 0,
      'Transfers': 0,
      'Loan Payments': 0
    };
    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

    txs.forEach(tx => {
      const kind = getTxKind(tx.type);
      if (kind === 'deposit') categories['Deposits'] += Math.abs(tx.amount);
      else if (kind === 'withdraw') categories['Withdrawals'] += Math.abs(tx.amount);
      else if (kind === 'transfer') categories['Transfers'] += Math.abs(tx.amount);
      else categories['Loan Payments'] += Math.abs(tx.amount);
    });

    return Object.entries(categories).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length]
    })).filter(cat => cat.value > 0);
  };

  const handleQuickSubmit = async () => {
    if (!selectedAccountId || !amount || Number(amount) <= 0) {
      setQuickError("Please select an account and enter a valid amount");
      return;
    }

    const numAmount = Number(amount);
    if (quickMode !== "deposit" && numAmount > selectedAccountBalance) {
      setQuickError("Amount exceeds available balance");
      return;
    }

    if (quickMode === "transfer" && !destinationAccountId) {
      setQuickError("Search and verify destination account first");
      return;
    }

    try {
      setQuickSubmitting(true);
      setQuickError("");

      let res;
      if (quickMode === "transfer") {
        res = await api.post("/accounts/transfer", {
          fromAccountId: selectedAccountId,
          toAccountId: destinationAccountId,
          amount: numAmount
        });
      } else {
        res = await api.post(`/accounts/${selectedAccountId}/${quickMode}`, { amount: numAmount });
      }

      showSnack(`✅ ${quickMode.charAt(0).toUpperCase() + quickMode.slice(1)} of ৳${numAmount.toLocaleString()} successful!`, "success");
      fetchData(); // Refresh dashboard data
      handleQuickClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Transaction failed. Please try again.";
      setQuickError(errorMsg);
      showSnack(`❌ ${errorMsg}`, "error");
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handleQuickClose = () => {
    setQuickOpen(false);
    setQuickMode("deposit");
    setSelectedAccountId(accounts[0]?.id || "");
    setAmount("");
    setDestinationAccount("");
    setDestinationAccountId(null);
    setDestinationAccountName("");
    setQuickError("");
  };

  const handleSearchDestinationAccount = async () => {
    if (!destinationAccount.trim()) {
      setQuickError("Please enter destination account number");
      return;
    }

    setSearchingDestination(true);
    setQuickError("");
    try {
      const found = await api.get<ApiResponse<{ id: number; name: string; accountNumber: string }>>(
        `/accounts/search?accountNumber=${encodeURIComponent(destinationAccount.trim())}`
      );

      if (found.data.data.id === Number(selectedAccountId)) {
        setDestinationAccountId(null);
        setDestinationAccountName("");
        setQuickError("Cannot transfer to the same account");
        return;
      }

      setDestinationAccountId(found.data.data.id);
      setDestinationAccountName(found.data.data.name);
    } catch (err: any) {
      setDestinationAccountId(null);
      setDestinationAccountName("");
      setQuickError(err.response?.data?.error || "Account not found");
    } finally {
      setSearchingDestination(false);
    }
  };

  const getPreviewBalance = () => {
    const numAmount = Number(amount);
    if (!selectedAccount || numAmount <= 0) return selectedAccountBalance;
    return quickMode === "deposit" 
      ? selectedAccountBalance + numAmount 
      : selectedAccountBalance - numAmount;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: {xs: '100%', sm: 1200, lg: 1600}, mx: "auto", px: {xs: 2, sm: 0} }}>
      {/* Balance Stats */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Card component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 1, fontWeight: 500 }}>
                  Total Balance
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
                  ৳ {totalBalance.toLocaleString()}
                </Typography>
                <Chip label={`${filteredAccounts.length} Accounts`} size="small" color="primary" variant="outlined" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <Card component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Balance Trend</Typography>
                  <Chip icon={<TrendingUpIcon />} label="+12.4%" color="success" size="small" />
                </Box>
                <Box sx={{ height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={filteredTrendData}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v}k`} />
                      <Tooltip formatter={(value) => [`৳${Number(value || 0).toLocaleString()}k`, 'Change']} />
                      <Line type="monotone" dataKey="balanceChange" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* 🎯 NEW: Quick Transaction Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon sx={{ fontSize: 32, color: 'primary.main' }} /> Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {[
            { mode: "deposit" as QuickMode, label: "Quick Deposit", icon: ArrowDownwardIcon, color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
            { mode: "withdraw" as QuickMode, label: "Quick Withdraw", icon: ArrowUpwardIcon, color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
            { mode: "transfer" as QuickMode, label: "Quick Transfer", icon: SwapHorizIcon, color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }
          ].map(({ mode, label, icon: Icon, color, gradient }, index) => (
            <Grid item xs={12} sm={6} md={4} key={mode}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => {
                    setQuickMode(mode);
                    setSelectedAccountId(accounts[0]?.id || "");
                    setAmount("");
                    setQuickOpen(true);
                  }}
                  sx={{
                    height: 160,
                    cursor: 'pointer',
                    borderRadius: 3,
                    background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${color}20`,
                    boxShadow: `0 20px 40px ${color}20, 0 0 0 1px ${color}30`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: gradient + ', rgba(255,255,255,0.1)',
                      boxShadow: `0 25px 50px ${color}30, 0 0 0 1px ${color}40`,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: `0 10px 30px ${color}40` }}>
                      <Icon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>{label}</Typography>
                    <Typography variant="body2" color="text.secondary">One-click banking</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Transaction Modal */}
      <Modal
        open={quickOpen}
        onClose={handleQuickClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={quickOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95vw', sm: '90vw', md: 500 },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: 24,
            p: { xs: 3, sm: 4 },
            overflow: 'auto',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <DialogTitle sx={{ p: 0, pb: 2, m: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {quickMode.charAt(0).toUpperCase() + quickMode.slice(1)} Funds
                </Typography>
                <IconButton onClick={handleQuickClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Alert severity={quickMode === 'deposit' ? 'success' : quickMode === 'withdraw' ? 'warning' : 'info'} sx={{ mb: 3, borderRadius: 2 }}>
                {quickMode === 'deposit' && 'Add money to your account instantly.'}
                {quickMode === 'withdraw' && 'Withdraw cash or transfer out.'}
                {quickMode === 'transfer' && 'Send money to another account.'}
              </Alert>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Account</InputLabel>
                <Select
                  value={selectedAccountId}
                  label="Select Account"
                  onChange={(e) => setSelectedAccountId(e.target.value as number)}
                  disabled
                >
                  {accounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id}>
                      **** {acc.accountNumber.slice(-4)} - ৳{Number(acc.balance).toLocaleString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>
                }}
              />

              {quickMode === 'transfer' && (
                <>
                  <TextField
                    fullWidth
                    label="To Account Number"
                    value={destinationAccount}
                    onChange={(e) => {
                      setDestinationAccount(e.target.value);
                      setDestinationAccountId(null);
                      setDestinationAccountName("");
                    }}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleSearchDestinationAccount}
                            disabled={searchingDestination || !destinationAccount.trim()}
                          >
                            {searchingDestination ? "..." : "Search"}
                          </Button>
                        </InputAdornment>
                      )
                    }}
                  />
                  {destinationAccountName && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Account found: {destinationAccountName}
                    </Alert>
                  )}
                </>
              )}

              {selectedAccount && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    New Balance: <strong>৳{getPreviewBalance().toLocaleString()}</strong> 
                    {quickMode !== 'deposit' && ` (Available: ৳${selectedAccountBalance.toLocaleString()})`}
                  </Typography>
                </Alert>
              )}

              {quickError && (
                <Alert severity="error" sx={{ mb: 3 }}>{quickError}</Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 0, pt: 2, gap: 2 }}>
              <Button variant="outlined" onClick={handleQuickClose} fullWidth>
                Cancel
              </Button>
<Button
                variant="contained"
                onClick={handleQuickSubmit}
                disabled={quickSubmitting || (quickMode === "transfer" && !destinationAccountId)}
                fullWidth
                sx={{ borderRadius: 2 }}
                startIcon={quickSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {quickSubmitting ? 'Processing...' : `Confirm ${quickMode}`}
              </Button>
            </DialogActions>
          </Box>
        </Fade>
      </Modal>

      {/* Rest of existing sections unchanged */}
      {/* Transactions and Pie */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Recent Transactions</Typography>
                <Typography variant="body2" color="text.secondary">Last 10 activities {searchQuery && `(${filteredRecentTransactions.length})`}</Typography>
              </Box>
              <Divider />
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredRecentTransactions.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No recent transactions</Typography>
                  </Box>
                ) : (
                  filteredRecentTransactions.map((tx, index) => {
                    const txKind = getTxKind(tx.type);
                    const isPositive = tx.amount > 0;
                    return (
                      <Box
                        key={tx.id}
                        component={motion.div}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 2.5,
                          px: 3,
                        borderBottom: index < filteredRecentTransactions.length - 1 ? "1px solid" : "none",
                          borderColor: "divider",
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => navigate(`/customer/transactions?txId=${tx.id}`)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                          <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: isPositive ? "success.light" : "error.light",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {txKind === "deposit" ? (
                              <ArrowDownwardIcon sx={{ color: "success.main", fontSize: 22 }} />
                            ) : txKind === "withdraw" ? (
                              <ArrowUpwardIcon sx={{ color: "error.main", fontSize: 22 }} />
                            ) : (
                              <SwapHorizIcon sx={{ color: "warning.main", fontSize: 22 }} />
                            )}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                              {tx.description || tx.type.replace(/_/g, ' ').toLowerCase()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(tx.createdAt).toLocaleDateString()} • Ref: {tx.referenceNumber?.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: isPositive ? "success.main" : "error.main",
                            ml: 2
                          }}
                        >
                          {isPositive ? "+" : "-"}৳ {Math.abs(tx.amount).toLocaleString()}
                        </Typography>
                      </Box>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <PieChartIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Spending Breakdown</Typography>
              </Box>
              {filteredSpendingData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No spending data yet</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 250 }}>
                  <PieResponsiveContainer>
                    <PieChart>
                <Pie
                  data={filteredSpendingData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                        {spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`৳${Number(value || 0).toLocaleString()}`, name as string]} />
                      <Legend />
                    </PieChart>
                  </PieResponsiveContainer>
                </Box>
              )}
              <Button fullWidth variant="contained" onClick={() => setBudgetOpen(true)} sx={{ mt: 3 }}>
                View Budget
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accounts */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>My Accounts</Typography>
          <Button variant="outlined" onClick={() => navigate('/customer/accounts')}>
            View All
          </Button>
        </Box>
        <Grid container spacing={2.5}>
          {accounts.slice(0, 4).map((account, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={account.id}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontFamily: '"SF Mono", monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                        **** {account.accountNumber.slice(-4)}
                      </Typography>
                      <Chip label={account.type.replace(/_/g, ' ')} size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                      ৳ {Number(account.balance).toLocaleString()}
                    </Typography>
                    <Chip label={account.isActive ? "Active" : "Inactive"} color={account.isActive ? "success" : "default"} size="small" sx={{ fontWeight: 600 }} />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
          {accounts.length === 0 && (
            <Grid item xs={12}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                    No accounts yet
                  </Typography>
                  <Typography color="text.secondary">
                    Your first banking account awaits!
                  </Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/customer/transfer')}>
                    Get Started
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Budget Modal */}
      <Modal open={budgetOpen} onClose={() => setBudgetOpen(false)} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
        <Fade in={budgetOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95vw', sm: 500 },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            overflow: 'auto'
          }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Budget Tracker
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Coming soon: Track income, expenses, and set monthly budgets with AI insights.
            </Typography>
            <Button fullWidth variant="contained" onClick={() => setBudgetOpen(false)}>
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>

      {/* Local Snackbar */}
      <Snackbar
        open={snackbar?.open || false}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={() => setSnackbar(null)} 
          severity={snackbar?.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar?.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
