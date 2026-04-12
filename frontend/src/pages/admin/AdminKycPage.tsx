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
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GppBadIcon from '@mui/icons-material/GppBad';
import api from '../../services/api';

interface AdminKycRequest {
  id: string | number;
  userId?: string | number;
  status?: string;
  documentType?: string;
  documentRef?: unknown;
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
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdminKycRequest | null>(null);
  const [verifyStatus, setVerifyStatus] = useState('Admin Verified');
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [documentAvailability, setDocumentAvailability] = useState<Record<string, 'checking' | 'exists' | 'missing'>>({});

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
      const normalizedStatus = normalizeKycStatus(request.status);
      const docRef = summarizeDocumentRef(request.documentRef);
      const text = [
        request.user?.name,
        request.user?.email,
        request.documentType,
        docRef.summary,
        docRef.details,
        docRef.searchText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [kycRequests, search, statusFilter]);

  const summary = useMemo(() => {
    return kycRequests.reduce(
      (acc, request) => {
        const status = normalizeKycStatus(request.status);
        if (status === 'PENDING') acc.pending += 1;
        if (status === 'UNDER_REVIEW_ADMIN') acc.pending += 1;
        if (status === 'VERIFIED') acc.verified += 1;
        if (status === 'REJECTED') acc.rejected += 1;
        return acc;
      },
      { pending: 0, verified: 0, rejected: 0 }
    );
  }, [kycRequests]);

  const handleVerifyClick = (request: AdminKycRequest) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedRequest(request);
    setVerifyStatus('Admin Verified');
    setVerifyRemarks('');
    setVerifyDialogOpen(true);
  };

  const handleViewDocuments = (request: AdminKycRequest) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setSelectedRequest(request);
    setDocumentsDialogOpen(true);
  };

  useEffect(() => {
    if (!documentsDialogOpen || !selectedRequest) return;

    const docs = parseKycDocuments(selectedRequest.documentRef);
    if (!docs.length) return;

    let cancelled = false;
    const checkFiles = async () => {
      for (const doc of docs) {
        const url = buildDocumentUrl(doc.filePath);
        if (documentAvailability[url] && documentAvailability[url] !== 'checking') continue;

        setDocumentAvailability((prev) => ({ ...prev, [url]: 'checking' }));
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (cancelled) return;
          setDocumentAvailability((prev) => ({ ...prev, [url]: response.ok ? 'exists' : 'missing' }));
        } catch {
          if (cancelled) return;
          setDocumentAvailability((prev) => ({ ...prev, [url]: 'missing' }));
        }
      }
    };

    checkFiles();
    return () => {
      cancelled = true;
    };
  }, [documentsDialogOpen, selectedRequest]);

  const handleOpenDocument = async (filePath: string) => {
    const url = buildDocumentUrl(filePath);
    const knownState = documentAvailability[url];
    if (knownState === 'missing') {
      setError('Document file was not found on the server. Please re-upload this KYC document.');
      return;
    }

    try {
      setError('');
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        setDocumentAvailability((prev) => ({ ...prev, [url]: 'missing' }));
        setError('Document file was not found on the server. Please re-upload this KYC document.');
        return;
      }
      setDocumentAvailability((prev) => ({ ...prev, [url]: 'exists' }));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setDocumentAvailability((prev) => ({ ...prev, [url]: 'missing' }));
      setError('Unable to reach document server. Please ensure backend is running and try again.');
    }
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
      case 'ADMIN VERIFIED':
        return 'success';
      case 'EMPLOYEE APPROVED':
        return 'info';
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'warning.50', borderColor: 'warning.200' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PendingActionsIcon color="warning" />
              <Box>
                <Typography variant="h5" fontWeight={700}>{summary.pending}</Typography>
                <Typography variant="body2" color="text.secondary">Pending Reviews</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'success.50', borderColor: 'success.200' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <VerifiedUserIcon color="success" />
              <Box>
                <Typography variant="h5" fontWeight={700}>{summary.verified}</Typography>
                <Typography variant="body2" color="text.secondary">Verified</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'error.50', borderColor: 'error.200' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <GppBadIcon color="error" />
              <Box>
                <Typography variant="h5" fontWeight={700}>{summary.rejected}</Typography>
                <Typography variant="body2" color="text.secondary">Rejected</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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
                <MenuItem value="EMPLOYEE APPROVED">Employee Approved</MenuItem>
                <MenuItem value="ADMIN VERIFIED">Admin Verified</MenuItem>
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
              <Table sx={{ minWidth: 920 }}>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 700, bgcolor: 'action.hover' } }}>
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
                    const normalizedStatus = normalizeKycStatus(request.status);
                    const statusLabel = normalizedStatus === 'UNKNOWN'
                      ? (request.status || 'UNKNOWN').toUpperCase()
                      : normalizedStatus === 'UNDER_REVIEW_ADMIN'
                        ? 'UNDER REVIEW (ADMIN)'
                        : normalizedStatus;
                    const docRef = summarizeDocumentRef(request.documentRef);
                    return (
                      <TableRow key={request.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell>{request.user?.name || '—'}</TableCell>
                        <TableCell>{request.user?.email || '—'}</TableCell>
                        <TableCell>{request.documentType || '—'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600 }}>
                            {docRef.summary}
                          </Typography>
                          {docRef.details && (
                            <Typography variant="caption" color="text.secondary">
                              {docRef.details}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={statusLabel}
                            color={getStatusColor(statusLabel)}
                            variant={normalizedStatus === 'PENDING' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>
                          {request.createdAt ? new Date(request.createdAt).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell align="right">
                          {normalizedStatus === 'EMPLOYEE APPROVED' && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDocuments(request)}
                              >
                                View Documents
                              </Button>
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
                          {normalizedStatus === 'PENDING' && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDocuments(request)}
                              >
                                View Documents
                              </Button>
                              <Typography variant="body2" color="text.secondary">
                                Awaiting employee review
                              </Typography>
                            </Stack>
                          )}
                          {normalizedStatus !== 'PENDING' && normalizedStatus !== 'UNDER_REVIEW_ADMIN' && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDocuments(request)}
                              >
                                View Documents
                              </Button>
                              <Typography variant="body2" color="text.secondary">
                                {request.verifiedAt
                                  ? `Verified on ${new Date(request.verifiedAt).toLocaleDateString()}`
                                  : '—'}
                              </Typography>
                            </Stack>
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

      <Dialog
        open={documentsDialogOpen}
        onClose={() => setDocumentsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Uploaded KYC Documents</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {selectedRequest && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Customer: {selectedRequest.user?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {selectedRequest.user?.email || 'Unknown'}
                </Typography>
              </>
            )}
            {parseKycDocuments(selectedRequest?.documentRef).length === 0 ? (
              <Alert severity="info">No uploaded file links were found in this KYC request.</Alert>
            ) : (
              parseKycDocuments(selectedRequest?.documentRef).map((doc) => {
                const url = buildDocumentUrl(doc.filePath);
                const availability = documentAvailability[url];
                const isMissing = availability === 'missing';
                const isChecking = availability === 'checking';
                return (
                <Paper key={doc.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography fontWeight={600}>{doc.type}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {doc.fileName}
                      </Typography>
                      {isMissing && (
                        <Typography variant="caption" color="error.main">
                          File missing on server
                        </Typography>
                      )}
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        variant="contained"
                        color={isMissing ? 'inherit' : 'primary'}
                        disabled={isMissing || isChecking}
                        onClick={() => handleOpenDocument(doc.filePath)}
                      >
                        {isChecking ? 'Checking...' : isMissing ? 'Missing' : 'Open'}
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={isMissing || isChecking}
                        onClick={() => {
                          const url = buildDocumentUrl(doc.filePath);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = doc.fileName;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Download
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
                );
              })
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {verifyStatus === 'Admin Verified' ? 'Verify KYC Request' : 'Reject KYC Request'}
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
                <Typography variant="body2" color="text.secondary">
                  Reference: {summarizeDocumentRef(selectedRequest.documentRef).summary}
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
              <MenuItem value="Admin Verified">Admin Verified</MenuItem>
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
            color={verifyStatus === 'Admin Verified' ? 'success' : 'error'}
          >
            {verifyStatus === 'Admin Verified' ? 'Verify' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminKycPage;
