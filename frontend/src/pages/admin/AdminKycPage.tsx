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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../services/api';

interface AdminKycRequest {
  id: string | number;
  userId?: string | number;
  status?: string;
  documentType?: string;
  documentRef?: string;
  remarks?: string;
  verifiedByEmployeeId?: string | number;
  verifiedAt?: string;
  createdAt?: string;
  user?: {
    id: string | number;
    name?: string;
    email?: string;
    phone?: string;
  };
}

const MotionCard = motion.create(Card);

const AdminKycPage: React.FC = () => {
  const [kycRequests, setKycRequests] = useState<AdminKycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdminKycRequest | null>(null);
  const [verifyStatus, setVerifyStatus] = useState('Verified');
  const [verifyRemarks, setVerifyRemarks] = useState('');

  const loadKycRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/kyc');
      setKycRequests(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load KYC requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKycRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return kycRequests.filter((request) => {
      const normalizedStatus = (request.status || 'UNKNOWN').toUpperCase();
      const text = [
        request.user?.name,
        request.user?.email,
        request.documentType,
        request.documentRef,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [kycRequests, search, statusFilter]);

  const handleVerifyClick = (request: AdminKycRequest) => {
    setSelectedRequest(request);
    setVerifyStatus('Verified');
    setVerifyRemarks('');
    setVerifyDialogOpen(true);
  };

  const handleVerifySubmit = async () => {
    if (!selectedRequest) return;
    try {
      setError('');
      setMessage('');
      await api.put(`/admin/kyc/${selectedRequest.id}/verify`, {
        status: verifyStatus,
        remarks: verifyRemarks,
      });
      setMessage(`KYC request ${verifyStatus.toLowerCase()} successfully.`);
      setVerifyDialogOpen(false);
      setSelectedRequest(null);
      await loadKycRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to verify KYC request.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          KYC Verification
        </Typography>
        <Typography color="text.secondary">
          Review and verify customer KYC documents and identity proofs.
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
                label="Search KYC requests"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by customer name, email, or document type"
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
                <MenuItem value="VERIFIED">Verified</MenuItem>
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
                    <TableCell>Email</TableCell>
                    <TableCell>Document Type</TableCell>
                    <TableCell>Document Reference</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const normalizedStatus = (request.status || 'UNKNOWN').toUpperCase();
                    return (
                      <TableRow key={request.id} hover>
                        <TableCell>{request.user?.name || '—'}</TableCell>
                        <TableCell>{request.user?.email || '—'}</TableCell>
                        <TableCell>{request.documentType || '—'}</TableCell>
                        <TableCell>{request.documentRef || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={normalizedStatus}
                            color={getStatusColor(normalizedStatus)}
                          />
                        </TableCell>
                        <TableCell>
                          {request.createdAt ? new Date(request.createdAt).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell align="right">
                          {normalizedStatus === 'PENDING' && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleVerifyClick(request)}
                              >
                                Verify
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setVerifyStatus('Rejected');
                                  setVerifyRemarks('');
                                  setVerifyDialogOpen(true);
                                }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                          {normalizedStatus !== 'PENDING' && (
                            <Typography variant="body2" color="text.secondary">
                              {request.verifiedAt
                                ? `Verified on ${new Date(request.verifiedAt).toLocaleDateString()}`
                                : '—'}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredRequests.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No KYC requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </MotionCard>

      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {verifyStatus === 'Verified' ? 'Verify KYC Request' : 'Reject KYC Request'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {selectedRequest && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Customer: {selectedRequest.user?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Document: {selectedRequest.documentType || 'Unknown'}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              select
              label="Status"
              value={verifyStatus}
              onChange={(event) => setVerifyStatus(event.target.value)}
            >
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={3}
              value={verifyRemarks}
              onChange={(event) => setVerifyRemarks(event.target.value)}
              placeholder="Add any notes or reasons for this decision..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleVerifySubmit}
            variant="contained"
            color={verifyStatus === 'Verified' ? 'success' : 'error'}
          >
            {verifyStatus === 'Verified' ? 'Verify' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminKycPage;
