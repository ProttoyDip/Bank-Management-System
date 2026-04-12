import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";

import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  Alert,
  Snackbar,
  Skeleton,
  Divider
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  SwapHoriz as SwapHorizIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from "../../services/api";
import { AccountType } from "../../types";
import type { Account, ApiResponse, Transaction } from "../../types";
import { useAuth } from "../../context/AuthContext";

export default function CustomerAccounts() {
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const themeContext = useThemeContext();
  const isDark = themeContext.isDarkMode;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "error" as "success" | "error" });
  const { searchQuery, setSearchQuery } = useSearch(); 

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(decodeURIComponent(q));
    }
  }, [searchParams, setSearchQuery]);
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const query = searchQuery.toLowerCase();
    return accounts.filter(acc => 
      acc.accountNumber.toLowerCase().includes(query) ||
      acc.type.toLowerCase().includes(query) ||
      acc.balance.toString().includes(query)
    );
  }, [accounts, searchQuery]);
  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const [recentTxCounts, setRecentTxCounts] = useState<Record<number, number>>({});

  const fetchAccounts = useCallback(async () => {
    if (!authUser) return;
    try {
      setLoading(true);
      let userAccounts: Account[] = [];

      try {
        const res = await api.get<ApiResponse<Account[]>>(`/accounts/my-accounts`);
        userAccounts = res.data.data || [];
      } catch {
        const fallback = await api.get<ApiResponse<Account[]>>(`/accounts/user/${authUser.id}`);
        userAccounts = fallback.data.data || [];
      }

      setAccounts(userAccounts);
      
      let transactions: Transaction[] = [];
      try {
        const txRes = await api.get<ApiResponse<Transaction[]>>(`/transactions/my-transactions?limit=200`);
        transactions = txRes.data.data || [];
      } catch {
        const fallbackTx = await api.get<ApiResponse<Transaction[]>>(`/transactions/user/${authUser.id}?limit=200`);
        transactions = fallbackTx.data.data || [];
      }

      const txMap = new Map<number, number>();
      transactions.forEach((tx) => {
        txMap.set(tx.accountId, (txMap.get(tx.accountId) || 0) + 1);
      });
      const recentCounts: Record<number, number> = {};
      userAccounts.forEach((acc) => {
        recentCounts[acc.id] = txMap.get(acc.id) || 0;
      });
      setRecentTxCounts(recentCounts);
    } catch (err: any) {
      setSnack({ open: true, message: err.response?.data?.error || "Failed to load accounts", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const typeColor = (type: string) => {
    switch (type) {
      case AccountType.SAVINGS:
        return "success";
      case AccountType.CURRENT:
        return "primary";
      case AccountType.FIXED_DEPOSIT:
        return "warning";
      case AccountType.LOAN:
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ maxWidth: {xs: '100%', sm: 1200, lg: 1600}, mx: "auto", px: {xs: 2, sm: 0} }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ mb: 4, p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', fontSize: {xs: '1.5rem', sm: '1.75rem', md: '2.125rem'} }}>
            Total Balance
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1, fontSize: {xs: '2.25rem', sm: '2.75rem', md: '3.5rem'} }}>
            ৳{totalBalance.toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`${filteredAccounts.length} Accounts`} color="primary" size="medium" />
            <Chip label="Active Status" color="success" size="medium" />
          </Box>
        </Card>
      </motion.div>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : accounts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No accounts yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Start banking by opening your first account
            </Typography>
            <Button variant="contained" size="large">
              Open New Account
            </Button>
          </Card>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          {filteredAccounts.map((acc, index) => {
            const txCount = recentTxCounts[acc.id] || 0;
            const trendPercent = txCount > 3 ? '+24%' : txCount > 1 ? '+12%' : '0%';
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={acc.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    p: 3, 
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        ****{acc.accountNumber.slice(-4)}
                      </Typography>
                      <Chip label={acc.type} size="small" color={typeColor(acc.type) as any} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                      ৳{Number(acc.balance).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={acc.isActive ? 'Active' : 'Inactive'} color={acc.isActive ? 'success' : 'default'} />
                      <Chip 
                        icon={<TrendingUpIcon />} 
                        label={trendPercent} 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: {xs: 'column', sm: 'row'} }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        fullWidth
                        startIcon={<SwapHorizIcon fontSize="small" />}
                        onClick={() => navigate(`/customer/transactions?accountId=${acc.id}`)}
                        sx={{ 
                          '&:hover': { transform: 'translateY(-1px)' },
                          py: 1.2
                        }}
                      >
                        Transactions
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        fullWidth
                        startIcon={<VisibilityIcon fontSize="small" />}
                        onClick={() => navigate(`/customer/transfer`)}
                        sx={{ 
                          '&:hover': { transform: 'translateY(-1px)' },
                          py: {xs: 1.2, sm: 0.75}
                        }}
                      >
                        Transfer
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
