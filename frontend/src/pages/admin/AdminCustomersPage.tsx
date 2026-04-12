import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';

interface AdminCustomer {
  id: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

const MotionCard = motion.create(Card);

const getCustomerName = (customer: AdminCustomer) => {
  if (customer.name) return customer.name;
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'N/A';
};

const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState<AdminCustomer | null>(null);

  const loadCustomers = async (query?: string) => {
    try {
      setLoading(true);
      setError('');
      const response = query
        ? await api.get(`/admin/customers/search?q=${encodeURIComponent(query)}`)
        : await api.get('/admin/customers');
      setCustomers(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const normalizedStatus = (customer.status || 'UNKNOWN').toUpperCase();
      const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
      return matchesStatus;
    });
  }, [customers, statusFilter]);

  const handleSearch = async () => {
    await loadCustomers(search.trim());
  };

  const handleStatusChange = async (customerId: string | number, nextStatus: string) => {
    try {
      setError('');
      setMessage('');
      await api.patch(`/admin/customers/${customerId}/status`, { status: nextStatus });
      setMessage('Customer status updated successfully.');
      await loadCustomers(search.trim());
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update customer status.');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteTarget) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/admin/customers/${deleteTarget.id}`);
      setMessage('Customer deleted successfully.');
      setDeleteTarget(null);
      await loadCustomers(search.trim());
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete customer.');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Customer Management
          </Typography>
          <Typography color="text.secondary">
            Review customer profiles, account status, and lifecycle actions.
          </Typography>
        </Box>
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
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Search customers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or phone"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={handleSearch} sx={{ height: '100%' }}>
                Search
              </Button>
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
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const normalizedStatus = (customer.status || 'UNKNOWN').toUpperCase();
                    return (
                      <TableRow key={customer.id} hover>
                        <TableCell>{getCustomerName(customer)}</TableCell>
                        <TableCell>{customer.email || '—'}</TableCell>
                        <TableCell>{customer.phone || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={normalizedStatus}
                            color={normalizedStatus === 'ACTIVE' ? 'success' : normalizedStatus === 'SUSPENDED' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{customer.createdAt ? new Date(customer.createdAt).toLocaleString() : '—'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                handleStatusChange(customer.id, normalizedStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                              }
                            >
                              {normalizedStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteOutlineIcon />}
                              onClick={() => setDeleteTarget(customer)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredCustomers.length && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </MotionCard>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteTarget ? getCustomerName(deleteTarget) : 'this customer'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteCustomer}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCustomersPage;