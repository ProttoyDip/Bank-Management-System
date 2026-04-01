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
} from '@mui/material';
import { motion } from 'framer-motion';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import api from '../../services/api';

interface AuditLogEntry {
  id: number;
  action: string;
  details?: string | null;
  actorId?: number | null;
  actorName?: string | null;
  actorRole?: string | null;
  targetId?: number | null;
  createdAt: string;
}

const MotionCard = motion(Card);

const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/logs');
      setLogs(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach((log) => {
      if (log.action) {
        actions.add(log.action);
      }
    });
    return Array.from(actions).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = [log.action, log.details, log.actorName, log.actorRole]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const getActionColor = (action: string) => {
    if (action.includes('APPROVE') || action.includes('VERIFY') || action.includes('ACTIVATE')) {
      return 'success';
    }
    if (action.includes('REJECT') || action.includes('DELETE') || action.includes('BLOCK')) {
      return 'error';
    }
    if (action.includes('UPDATE') || action.includes('FLAG') || action.includes('SUSPEND')) {
      return 'warning';
    }
    if (action.includes('CREATE') || action.includes('INVITE') || action.includes('DEPOSIT')) {
      return 'info';
    }
    return 'default';
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Audit Logs
        </Typography>
        <Typography color="text.secondary">
          Track all administrative actions and system events.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <MotionCard initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <CardContent>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search logs"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by action, details, or actor"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Action Type"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Actions</MenuItem>
                {uniqueActions.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
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
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Target ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.createdAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={log.action}
                          color={getActionColor(log.action)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {log.actorName || 'System'}
                          </Typography>
                          {log.actorRole && (
                            <Typography variant="caption" color="text.secondary">
                              {log.actorRole}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {log.details || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.targetId || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredLogs.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No audit logs found.
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

export default AdminAuditLogsPage;
