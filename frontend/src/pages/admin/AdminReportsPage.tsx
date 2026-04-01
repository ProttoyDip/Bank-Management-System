import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import api from '../../services/api';

interface ReportData {
  balanceSummary: {
    totalAccounts: number;
    totalBalance: number;
    averageBalance: number;
  };
  accountTypeSummary: Array<{
    type: string;
    count: number;
    balance: number;
  }>;
  loanStatusSummary: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  transactionTypeSummary: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
  openTickets: number;
}

const MotionCard = motion(Card);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const AdminReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/admin/reports');
        const data = response.data?.data || response.data;
        setReportData(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const totalTransactionAmount = reportData?.transactionTypeSummary?.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  ) || 0;

  const totalLoanAmount = reportData?.loanStatusSummary?.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  ) || 0;

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Reports & Analytics
        </Typography>
        <Typography color="text.secondary">
          Comprehensive financial reports and system analytics.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && (
        <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Loading reports...
              </Typography>
            </Stack>
            <LinearProgress />
          </CardContent>
        </Card>
      )}

      {!loading && !error && reportData && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0 }}
                whileHover={{ y: -4 }}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Total Balance
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, wordBreak: 'break-word' }}>
                        {formatCurrency(reportData.balanceSummary.totalBalance)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Across all active accounts
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#16a34a15',
                        color: '#16a34a',
                        flexShrink: 0,
                      }}
                    >
                      <AccountBalanceIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                whileHover={{ y: -4 }}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Total Accounts
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, wordBreak: 'break-word' }}>
                        {reportData.balanceSummary.totalAccounts}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active banking accounts
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#2563eb15',
                        color: '#2563eb',
                        flexShrink: 0,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.16 }}
                whileHover={{ y: -4 }}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Transaction Volume
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, wordBreak: 'break-word' }}>
                        {formatCurrency(totalTransactionAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total transaction amount
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#0891b215',
                        color: '#0891b2',
                        flexShrink: 0,
                      }}
                    >
                      <SwapHorizIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.24 }}
                whileHover={{ y: -4 }}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Total Loans
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, wordBreak: 'break-word' }}>
                        {formatCurrency(totalLoanAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Outstanding loan amount
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f59e0b15',
                        color: '#f59e0b',
                        flexShrink: 0,
                      }}
                    >
                      <RequestQuoteIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>

          {/* Detailed Reports */}
          <Grid container spacing={3}>
            {/* Account Type Summary */}
            <Grid item xs={12} lg={6}>
              <MotionCard
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <AssessmentIcon color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Account Type Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distribution of accounts by type
                      </Typography>
                    </Box>
                  </Stack>

                  {reportData.accountTypeSummary?.length > 0 ? (
                    <Stack spacing={2}>
                      {reportData.accountTypeSummary.map((item, index) => {
                        const percent =
                          reportData.balanceSummary.totalBalance > 0
                            ? (Number(item.balance || 0) / reportData.balanceSummary.totalBalance) * 100
                            : 0;
                        return (
                          <Box key={`account-${index}`}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.type}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {formatCurrency(item.balance)}
                                </Typography>
                                <Chip label={item.count} size="small" />
                              </Stack>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(percent, 100)}
                              sx={{ height: 8, borderRadius: 999 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 180,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        px: 3,
                      }}
                    >
                      <Typography color="text.secondary">No account data available.</Typography>
                    </Box>
                  )}
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Loan Status Summary */}
            <Grid item xs={12} lg={6}>
              <MotionCard
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <RequestQuoteIcon color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Loan Status Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distribution of loans by status
                      </Typography>
                    </Box>
                  </Stack>

                  {reportData.loanStatusSummary?.length > 0 ? (
                    <Stack spacing={2}>
                      {reportData.loanStatusSummary.map((item, index) => {
                        const percent =
                          totalLoanAmount > 0 ? (Number(item.amount || 0) / totalLoanAmount) * 100 : 0;
                        return (
                          <Box key={`loan-${index}`}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.status}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {formatCurrency(item.amount)}
                                </Typography>
                                <Chip label={item.count} size="small" />
                              </Stack>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(percent, 100)}
                              sx={{ height: 8, borderRadius: 999 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 180,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        px: 3,
                      }}
                    >
                      <Typography color="text.secondary">No loan data available.</Typography>
                    </Box>
                  )}
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Transaction Type Summary */}
            <Grid item xs={12}>
              <MotionCard
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <TrendingUpIcon color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Transaction Type Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Breakdown of transactions by type
                      </Typography>
                    </Box>
                  </Stack>

                  {reportData.transactionTypeSummary?.length > 0 ? (
                    <Stack spacing={2}>
                      {reportData.transactionTypeSummary.map((item, index) => {
                        const percent =
                          totalTransactionAmount > 0
                            ? (Number(item.amount || 0) / totalTransactionAmount) * 100
                            : 0;
                        return (
                          <Box key={`transaction-${index}`}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.type}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {formatCurrency(item.amount)}
                                </Typography>
                                <Chip label={item.count} size="small" />
                              </Stack>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(percent, 100)}
                              sx={{ height: 8, borderRadius: 999 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 180,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        px: 3,
                      }}
                    >
                      <Typography color="text.secondary">No transaction data available.</Typography>
                    </Box>
                  )}
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminReportsPage;
