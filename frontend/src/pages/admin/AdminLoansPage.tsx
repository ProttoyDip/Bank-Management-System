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
import api from '../../services/api';

interface AdminLoan {
  id: string | number;
  amount?: number;
  status?: string;
  customerName?: string;
  type?: string;
  termMonths?: number;
  createdAt?: string;
}

const MotionCard = motion(Card);

const AdminLoansPage: React.FC = () => {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/loans');
      const loansData = response.data.data || response.data;
      setLoans(Array.isArray(loansData) ? loansData : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load loans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const normalizedStatus = (loan.status || 'UNKNOWN').toUpperCase();
      return statusFilter === 'ALL' || normalizedStatus === statusFilter;
    });
  }, [loans, statusFilter]);

  const handleApprove = async (loanId: string | number) => {
    try {
      setError('');
      setMessage('');
      await api.put(`/admin/loans/${loanId}/approve`);
      setMessage('Loan approved successfully.');
      await loadLoans();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to approve loan.');
    }
  };

  const handleReject = async (loanId: string | number) => {
    try {
      setError('');
      setMessage('');
      await api.put(`/admin/loans/${loanId}/reject`);
      setMessage('Loan rejected successfully.');
      await loadLoans();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reject loan.');
    }
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Loan Administration
        </Typography>
        <Typography color="text.secondary">
          Review pending loans and take approval or rejection actions.
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
                <MenuItem value="REJECTED">Rejected</MenuItem>
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
                    <TableCell>Customer</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLoans.map((loan) => {
                    const normalizedStatus = (loan.status || 'UNKNOWN').toUpperCase();
                    return (
                      <TableRow key={loan.id} hover>
                        <TableCell>{loan.customerName || '—'}</TableCell>
                        <TableCell>{loan.type || '—'}</TableCell>
                        <TableCell>{typeof loan.amount === 'number' ? loan.amount.toLocaleString() : '—'}</TableCell>
                        <TableCell>{loan.termMonths ? `${loan.termMonths} months` : '—'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={normalizedStatus}
                            color={normalizedStatus === 'APPROVED' ? 'success' : normalizedStatus === 'REJECTED' ? 'error' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{loan.createdAt ? new Date(loan.createdAt).toLocaleString() : '—'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApprove(loan.id)}
                              disabled={normalizedStatus !== 'PENDING'}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleReject(loan.id)}
                              disabled={normalizedStatus !== 'PENDING'}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredLoans.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No loans found.
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

export default AdminLoansPage;