import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
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
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface AdminAccount {
  id: string | number;
  accountNumber?: string;
  accountType?: string;
  type?: string;
  balance?: number;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  customerName?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
}

const MotionCard = motion.create(Card);

const getOwnerName = (account: AdminAccount) => {
  if (account.customerName) return account.customerName;
  if (account.user?.name) return account.user.name;
  return [account.user?.firstName, account.user?.lastName].filter(Boolean).join(' ') || account.user?.email || 'N/A';
};

const AdminAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/accounts');
      const accountsData = response.data.data || response.data;
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const normalizedStatus = (account.status || (account.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase();
      const accountTypeText = account.accountType || account.type;
      const text = [account.accountNumber, accountTypeText, getOwnerName(account)].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accounts, search, statusFilter]);

  const handleStatusChange = async (accountId: string | number, nextStatus: string) => {
    try {
      setMessage('');
      setError('');
      await api.patch(`/admin/accounts/${accountId}/status`, { status: nextStatus });
      setMessage('Account status updated successfully.');
      await loadAccounts();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update account status.');
    }
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Account Oversight
        </Typography>
        <Typography color="text.secondary">
          Monitor customer accounts, balances, and operational statuses.
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

      <MotionCard initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <CardContent>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search accounts"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by account number, type, or owner"
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
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="FROZEN">Frozen</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const normalizedStatus = (account.status || (account.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase();
                    return (
                      <TableRow key={account.id} hover>
                        <TableCell>{account.accountNumber || '—'}</TableCell>
                        <TableCell>{getOwnerName(account)}</TableCell>
                        <TableCell>{account.accountType || account.type || '—'}</TableCell>
                        <TableCell>
                          {typeof account.balance === 'number' ? account.balance.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={normalizedStatus}
                            color={normalizedStatus === 'ACTIVE' ? 'success' : normalizedStatus === 'FROZEN' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{account.createdAt ? new Date(account.createdAt).toLocaleString() : '—'}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleStatusChange(account.id, normalizedStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE')
                            }
                          >
                            {normalizedStatus === 'ACTIVE' ? 'Freeze' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredAccounts.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No accounts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </MotionCard>
    </Box>
  );
};

export default AdminAccountsPage;
