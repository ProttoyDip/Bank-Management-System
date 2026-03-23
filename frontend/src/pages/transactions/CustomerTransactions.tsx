import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  Chip, 
  Button, 
  Grid, 
  Stack, 
  Divider, 
  Alert, 
  Snackbar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  SwapHoriz as SwapHorizIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  KeyboardArrowDown
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../../context/ThemeContext';
import api from '../../services/api';
import { TransactionType, Transaction, ApiResponse, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

const typeIcons = {
  [TransactionType.DEPOSIT]: <ArrowDownwardIcon sx={{ color: 'success.main' }} />,
  [TransactionType.WITHDRAW]: <ArrowUpwardIcon sx={{ color: 'error.main' }} />,
  [TransactionType.TRANSFER_IN]: <ArrowDownwardIcon sx={{ color: 'primary.main' }} />,
  [TransactionType.TRANSFER_OUT]: <ArrowUpwardIcon sx={{ color: 'warning.main' }} />,
  [TransactionType.LOAN_DISBURSEMENT]: <TrendingUpIcon sx={{ color: 'success.main' }} />,
  [TransactionType.LOAN_PAYMENT]: <SwapHorizIcon sx={{ color: 'warning.main' }} />,
};

const typeLabels = {
  [TransactionType.DEPOSIT]: 'Deposit',
  [TransactionType.WITHDRAW]: 'Withdrawal',
  [TransactionType.TRANSFER_IN]: 'Received',
  [TransactionType.TRANSFER_OUT]: 'Sent',
  [TransactionType.LOAN_DISBURSEMENT]: 'Loan Received',
  [TransactionType.LOAN_PAYMENT]: 'Loan Payment',
};

const typeColors = {
  [TransactionType.DEPOSIT]: 'success',
  [TransactionType.WITHDRAW]: 'error',
  [TransactionType.TRANSFER_IN]: 'primary',
  [TransactionType.TRANSFER_OUT]: 'warning',
  [TransactionType.LOAN_DISBURSEMENT]: 'success',
  [TransactionType.LOAN_PAYMENT]: 'warning',
};

export default function CustomerTransactions() {
  const { user } = useAuth();
  const themeContext = useThemeContext();
  const isDark = themeContext.isDarkMode;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [groupedTx, setGroupedTx] = useState<TransactionGroup[]>([]);
  const [filters, setFilters] = useState({
    type: '' as TransactionType | '',
    fromDate: null as import('dayjs').Dayjs | null,
    toDate: null as import('dayjs').Dayjs | null,
    accountId: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);

  // Parse filters from URL
  useEffect(() => {
    const type = (searchParams.get('type') as TransactionType) || '';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const accountId = searchParams.get('account') || '';
    
    setFilters({
      type,
      fromDate: fromDate ? dayjs(fromDate) : null,
      toDate: toDate ? dayjs(toDate) : null,
      accountId,
    });
  }, [searchParams]);

  const fetchTransactions = useCallback(async (append = false) => {
    if (!user) return;
    try {
      setLoading(!append);
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.fromDate) params.append('from', filters.fromDate.toISOString());
      if (filters.toDate) params.append('to', filters.toDate.toISOString());
      if (filters.accountId) params.append('account', filters.accountId);
      if (page > 0) params.append('page', page.toString());
      params.append('limit', rowsPerPage.toString());

      const allTx: Transaction[] = [];
      for (const acc of user.accounts || []) {
        const res = await api.get<ApiResponse<Transaction[]>>(
          `/transactions/account/${acc.id}?${params.toString()}`
        );
        allTx.push(...(res.data.data || []));
      }

      // Sort by date desc, group by day
      const sorted = allTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const grouped = sorted.reduce((groups: TransactionGroup[], tx) => {
        const date = dayjs(tx.createdAt).format('MMM DD, YYYY');
        const existing = groups.find(g => g.date === date);
        if (existing) {
          existing.transactions.push(tx);
        } else {
          groups.push({ date, transactions: [tx] });
        }
        return groups;
      }, []);

      setTransactions(append ? [...transactions, ...sorted] : sorted);
      setGroupedTx(grouped);
    } catch (error: any) {
      setSnack({ open: true, message: 'Failed to load transactions', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user, filters, page, rowsPerPage, transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const highlightedTxId = searchParams.get('txId');
  const highlightedTx = transactions.find(tx => tx.id === Number(highlightedTxId));

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (newFilters.type) params.append('type', newFilters.type);
    if (newFilters.fromDate) params.append('from', newFilters.fromDate.toISOString());
    if (newFilters.toDate) params.append('to', newFilters.toDate.toISOString());
    if (newFilters.accountId) params.append('account', newFilters.accountId);
    setSearchParams(params, { replace: true });
    
    setPage(0);
  };

  const exportCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Account', 'Amount', 'Balance', 'Description', 'Reference'],
      ...transactions.map(tx => [
        dayjs(tx.createdAt).format('YYYY-MM-DD HH:mm'),
        typeLabels[tx.type as TransactionType] || tx.type,
        tx.account?.accountNumber || 'N/A',
        tx.amount > 0 ? `+৳${tx.amount.toLocaleString()}` : `-৳${Math.abs(tx.amount).toLocaleString()}`,
        `৳${tx.balanceAfter.toLocaleString()}`,
        tx.description || '',
        tx.referenceNumber || '',
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSnack({ open: true, message: 'Transactions exported successfully!', severity: 'success' });
  };

  const clearFilters = () => {
    setFilters({ type: '', fromDate: null, toDate: null, accountId: '' });
    setSearchParams({}, { replace: true });
  };

  if (loading && transactions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: {xs: '100%', sm: 1200, lg: 1600}, mx: "auto", px: {xs: 1, sm: 2, lg: 0} }}>
      {/* Filters Bar */}
      <Card sx={{ mb: 4, p: {xs: 1.5, sm: 2.5, md: 3} }}>
        <Stack direction={{xs: "column", sm: "row"}} spacing={{xs: 1, sm: 2}} alignItems="center" flexWrap="wrap" sx={{width: '100%'}}>
          <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 150 }}>
            Filters
          </Typography>
          <FormControl size="small" sx={{ minWidth: {xs: "100%", sm: 140} }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
              endAdornment={<KeyboardArrowDown />}
            >
              <MenuItem value="">All Types</MenuItem>
              {Object.values(TransactionType).map(type => (
                <MenuItem key={type} value={type}>{typeLabels[type as TransactionType]}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From Date"
              value={filters.fromDate}
              onChange={(newValue: import('dayjs').Dayjs | null) => handleFilterChange('fromDate', newValue)}
              sx={{width: {xs: '100%', sm: 'auto'}}}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="To Date"
              value={filters.toDate}
              onChange={(newValue: import('dayjs').Dayjs | null) => handleFilterChange('toDate', newValue)}
              sx={{width: {xs: '100%', sm: 'auto'}}}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>

          {user?.accounts && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Account</InputLabel>
              <Select
                value={filters.accountId}
                label="Account"
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
              >
                <MenuItem value="">All Accounts</MenuItem>
                {user.accounts.map(acc => (
                  <MenuItem key={acc.id} value={acc.id}>****{acc.accountNumber.slice(-4)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={exportCSV}
              size="small"
            >
              Export CSV
            </Button>
            {(filters.type || filters.fromDate || filters.toDate || filters.accountId) && (
              <Button variant="outlined" size="small" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </Box>
        </Stack>
      </Card>

      {highlightedTx && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Alert severity="info" sx={{ mb: 3, p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Transaction Highlighted
            </Typography>
            <Typography>
              {typeLabels[highlightedTx.type as TransactionType]} of ৳{Math.abs(highlightedTx.amount).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {highlightedTx.description}
            </Typography>
          </Alert>
        </motion.div>
      )}

      {/* Transactions Timeline */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Recent Transactions ({transactions.length})
      </Typography>
      
      <AnimatePresence>
        {groupedTx.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card sx={{ textAlign: 'center', py: 8 }}>
              <TrendingUpIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No transactions yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Your transaction history will appear here
              </Typography>
              <Button variant="contained">
                Make First Transfer
              </Button>
            </Card>
          </motion.div>
        ) : (
          groupedTx.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
            >
              <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {group.date}
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  {group.transactions.map((tx, txIndex) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: txIndex * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: {xs: 'column', sm: 'row'},
                          alignItems: {xs: 'flex-start', sm: 'center'}, 
                          gap: {xs: 2, sm: 3}, 
                          p: {xs: 2, sm: 3}, 
                          borderRadius: 2, 
                          mb: { xs: 1.5, sm: 2 },
                          textAlign: {xs: 'left', sm: 'left'},
                          backgroundColor: 'action.hover',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.selected' }
                        }}
                        onClick={() => navigate(`/customer/transactions?txId=${tx.id}`)}
                      >
                        <Box sx={{ 
                          width: 48, height: 48, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: typeColors[tx.type as TransactionType] + '.100'
                        }}>
                          {typeIcons[tx.type as TransactionType]}
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
                            {typeLabels[tx.type as TransactionType]} to ****{tx.account?.accountNumber?.slice(-4)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tx.description || 'Transfer completed'}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700,
                            color: tx.amount > 0 ? 'success.main' : 'error.main',
                            mr: 2
                          }}
                        >
                          {tx.amount > 0 ? '+' : ''}৳{Math.abs(tx.amount).toLocaleString()}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" align="right">
                          Balance: ৳{tx.balanceAfter.toLocaleString()}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
