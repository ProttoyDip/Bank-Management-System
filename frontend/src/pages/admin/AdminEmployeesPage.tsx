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
  IconButton,
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
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canInviteEmployees, canUpdateEmployeeStatus, canDeleteEmployeeInvites } from '../../utils/permissions';

interface EmployeeInvite {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
  status?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface AdminEmployee {
  id: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  department?: string;
  position?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
}

interface InviteFormState {
  email: string;
}

const MotionCard = motion(Card);

const getDisplayName = (employee: AdminEmployee) => {
  if (employee.name) return employee.name;
  return [employee.firstName, employee.lastName].filter(Boolean).join(' ') || 'N/A';
};

const AdminEmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [invites, setInvites] = useState<EmployeeInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState<InviteFormState>({
    email: '',

  });

  // Permission checks
  const isSuperAdmin = canInviteEmployees(user?.accessLevel);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [employeesResponse, invitesResponse] = await Promise.all([
        api.get('/admin/employees'),
        api.get('/admin/invites'),
      ]);
      setEmployees(Array.isArray(employeesResponse.data) ? employeesResponse.data : employeesResponse.data?.data || []);
      setInvites(Array.isArray(invitesResponse.data) ? invitesResponse.data : invitesResponse.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load employees data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const normalizedStatus = (employee.status || (employee.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase();
      const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
      const text = [getDisplayName(employee), employee.email, employee.department, employee.position]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesStatus && text.includes(search.toLowerCase());
    });
  }, [employees, search, statusFilter]);

  const handleStatusChange = async (employeeId: string | number, nextStatus: string) => {
    try {
      setActionMessage('');
      await api.patch(`/admin/employees/${employeeId}/status`, { status: nextStatus });
      setActionMessage('Employee status updated successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update employee status.');
    }
  };

  const handleInviteSubmit = async () => {
    try {
      setInviteSubmitting(true);
      setError('');
      setActionMessage('');
      const response = await api.post('/admin/invite-employee', { email: form.email });
      setInviteOpen(false);
      setForm({
        email: '',
      });
      const emailSent = Boolean(response?.data?.emailSent);
      setActionMessage(
        emailSent
          ? 'Employee invitation sent successfully.'
          : 'Invite created, but email could not be delivered. Check SMTP diagnostics.'
      );
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send employee invite.');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleResendInvite = async (inviteId: string | number) => {
    try {
      setError('');
      setActionMessage('');
      const response = await api.post(`/admin/invites/${inviteId}/resend`);
      const emailSent = Boolean(response?.data?.emailSent);
      setActionMessage(
        emailSent
          ? 'Invite email resent successfully.'
          : 'Invite exists, but email could not be sent. Check SMTP diagnostics.'
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend invite email.');
    }
  };

  const handleDeleteInvite = async (inviteId: string | number) => {
    try {
      setError('');
      setActionMessage('');
      await api.delete(`/admin/invites/${inviteId}`);
      setActionMessage('Invite deleted successfully.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete invite.');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Employee Management
          </Typography>
          <Typography color="text.secondary">
            Manage active staff, employee access, and pending invites.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<RefreshIcon />} variant="outlined" onClick={loadData}>
            Refresh
          </Button>
          {isSuperAdmin && (
            <Button startIcon={<SendIcon />} variant="contained" onClick={() => setInviteOpen(true)}>
              Invite Employee
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {actionMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionMessage('')}>
          {actionMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <MotionCard initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
                <TextField
                  fullWidth
                  label="Search employees"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, department, or position"
                />
                <TextField
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Stack>

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
                        <TableCell>Department</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEmployees.map((employee) => {
                        const normalizedStatus = (employee.status || (employee.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase();
                        return (
                          <TableRow key={employee.id} hover>
                            <TableCell>{getDisplayName(employee)}</TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell>{employee.department || '—'}</TableCell>
                            <TableCell>{employee.position || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={normalizedStatus}
                                color={normalizedStatus === 'ACTIVE' ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {isSuperAdmin && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    handleStatusChange(employee.id, normalizedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                                  }
                                >
                                  {normalizedStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!filteredEmployees.length && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No employees found.
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
                Pending Invites
              </Typography>
              <Stack spacing={2}>
                {invites.map((invite) => (
                  <Card key={invite.id} variant="outlined">
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box>
                          <Typography fontWeight={600}>
                            {invite.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Invited as Employee
                          </Typography>
                        </Box>
                        {isSuperAdmin && (
                          <Stack direction="row" spacing={1}>
                            <IconButton color="primary" onClick={() => handleResendInvite(invite.id)}>
                              <SendIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteInvite(invite.id)}>
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!invites.length && <Typography color="text.secondary">No pending invites.</Typography>}
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      <Dialog open={inviteOpen && isSuperAdmin} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Invite Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="example@company.com"
            />
            <Typography variant="body2" color="text.secondary">
              The invited user will be automatically assigned the Employee role and can be configured further upon acceptance.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button onClick={handleInviteSubmit} variant="contained" disabled={inviteSubmitting}>
            {inviteSubmitting ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEmployeesPage;