import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import FlagIcon from '@mui/icons-material/Flag';
import UndoIcon from '@mui/icons-material/Undo';
import api from '../../services/api';

interface AdminTransaction {
  id: string | number;
  reference?: string;
  referenceNumber?: string;
  type?: string;
  amount?: number;
  status?: string;
  flagged?: boolean;
  isFlagged?: boolean;
  createdAt?: string;
  accountNumber?: string;
  accountId?: string | number;
  account?: {
    id?: string | number;
    accountNumber?: string;
  };
  description?: string;
}

const MotionCard = motion.create(Card);

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [transactionsResponse, fraudResponse] = await Promise.all([
        api.get('/admin/transactions'),
        api.get('/admin/fraud-alerts'),
      ]);
      const txData = transactionsResponse.data.data || transactionsResponse.data;
      const fraudData = fraudResponse.data.data || fraudResponse.data;
      const normalizeTransaction = (tx: AdminTransaction): AdminTransaction => ({
        ...tx,
        reference: tx.reference || tx.referenceNumber,
        accountNumber: tx.accountNumber || tx.account?.accountNumber,
        accountId: tx.accountId || tx.account?.id,
        flagged: typeof tx.flagged === 'boolean' ? tx.flagged : Boolean(tx.isFlagged),
      });
      setTransactions(Array.isArray(txData) ? txData.map(normalizeTransaction) : []);
      setFraudAlerts(Array.isArray(fraudData) ? fraudData.map(normalizeTransaction) : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const normalizedStatus = (transaction.status || 'UNKNOWN').toUpperCase();
      const haystack = [transaction.reference, transaction.type, transaction.accountNumber, transaction.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const handleFlag = async (transactionId: string | number, flagged: boolean) => {
    try {
      setError('');
      setMessage('');
      await api.patch(`/admin/transactions/${transactionId}/flag`, { flagged: !flagged });
      setMessage('Transaction flag updated successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update transaction flag.');
    }
  };

  const handleReverse = async (transactionId: string | number) => {
    const reason = window.prompt('Enter reversal reason', 'Reversed by admin review')?.trim();
    if (!reason) {
      setError('Reason is required to reverse a transaction.');
      return;
    }

    try {
      setError('');
      setMessage('');
      await api.post(`/admin/transactions/${transactionId}/reverse`, { reason });
      setMessage('Transaction reversed successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Failed to reverse transaction.');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Transaction Monitoring
        </Typography>
        <Typography color="text.secondary">
          Review transaction activity, fraud alerts, and administrative interventions.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <MotionCard initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <CardContent>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Search transactions"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by reference, type, account, or description"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="SUSPICIOUS">Suspicious</MenuItem>
                    <MenuItem value="REVERSED">Reversed</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                  <Table sx={{ width: '100%' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Reference</TableCell>
                        <TableCell>Account</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Flagged</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions.map((transaction) => {
                        const normalizedStatus = (transaction.status || 'UNKNOWN').toUpperCase();
                        return (
                          <TableRow key={transaction.id} hover>
                            <TableCell>{transaction.reference || '—'}</TableCell>
                            <TableCell>{transaction.accountNumber || '—'}</TableCell>
                            <TableCell>{transaction.type || '—'}</TableCell>
                            <TableCell sx={{ color: (transaction.amount || 0) >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                              {typeof transaction.amount === 'number' ? transaction.amount.toLocaleString() : '—'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={normalizedStatus}
                                color={normalizedStatus === 'APPROVED' ? 'success' : normalizedStatus === 'SUSPICIOUS' ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={transaction.flagged ? 'FLAGGED' : 'NORMAL'}
                                color={transaction.flagged ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '—'}</TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<FlagIcon />}
                                  onClick={() => handleFlag(transaction.id, Boolean(transaction.flagged))}
                                >
                                  {transaction.flagged ? 'Unflag' : 'Flag'}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<UndoIcon />}
                                  onClick={() => handleReverse(transaction.id)}
                                  disabled={normalizedStatus === 'REVERSED'}
                                >
                                  Reverse
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!filteredTransactions.length && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <MotionCard initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Fraud Alerts
              </Typography>
              <Stack spacing={2}>
                {fraudAlerts.map((alert) => (
                  <Card key={alert.id} variant="outlined">
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Typography fontWeight={600}>{alert.reference || alert.id}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.accountNumber || 'Unknown account'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.description || alert.type || 'Suspicious activity detected'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                {!fraudAlerts.length && <Typography color="text.secondary">No fraud alerts available.</Typography>}
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminTransactionsPage;