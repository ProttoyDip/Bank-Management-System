import { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import api from "../../services/api";
import {
  AdminDashboardStats,
  AdminTransactionListItem,
  AdminTransactionSummaryItem,
  ApiResponse,
} from "../../types";

interface DashboardStatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

interface ChartData {
  name: string;
  value: number;
  amount?: number;
  color?: string;
}

interface MonthlyTrend {
  month: string;
  transactions: number;
  amount: number;
  deposits: number;
  withdrawals: number;
}

const MotionCard = motion.create(Card);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCompactNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const getSummaryLabel = (item: AdminTransactionSummaryItem, index: number) =>
  item.label || item.type || `Category ${index + 1}`;

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#0891b2",
  "#f59e0b",
  "#dc2626",
  "#ec4899",
  "#06b6d4",
];

const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  Deposit: "#16a34a",
  Withdraw: "#dc2626",
  "Transfer In": "#2563eb",
  "Transfer Out": "#f59e0b",
  "Loan Disbursement": "#7c3aed",
  "Loan Payment": "#0891b2",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get<any>("/admin/dashboard-stats");
        const data = response.data.data || response.data; // Handle both { success, data } and direct object
        setStats(data);
        setError("");
      } catch (error) {
        setError("Failed to load admin dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = useMemo<DashboardStatCard[]>(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        title: "Total Customers",
        value: stats.totalCustomers,
        subtitle: "Registered customer profiles",
        icon: <PeopleIcon sx={{ fontSize: 28 }} />,
        color: "#2563eb",
        trend: "+12.5%",
      },
      {
        title: "Total Employees",
        value: stats.totalEmployees,
        subtitle: "Active workforce visibility",
        icon: <BadgeIcon sx={{ fontSize: 28 }} />,
        color: "#7c3aed",
        trend: "+3.2%",
      },
      {
        title: "Total Accounts",
        value: stats.totalAccounts,
        subtitle: "Banking accounts on record",
        icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
        color: "#16a34a",
        trend: "+8.7%",
      },
      {
        title: "Transactions",
        value: stats.totalTransactions,
        subtitle: "Processed transaction count",
        icon: <SwapHorizIcon sx={{ fontSize: 28 }} />,
        color: "#0891b2",
        trend: "+15.3%",
      },
      {
        title: "Pending Loans",
        value: stats.pendingLoans,
        subtitle: "Awaiting review or approval",
        icon: <RequestQuoteIcon sx={{ fontSize: 28 }} />,
        color: "#f59e0b",
        trend: "-2.1%",
      },
      {
        title: "Bank Balance",
        value: formatCurrency(stats.totalBankBalance),
        subtitle: "Aggregate funds across accounts",
        icon: <SavingsIcon sx={{ fontSize: 28 }} />,
        color: "#dc2626",
        trend: "+5.8%",
      },
    ];
  }, [stats]);

  const summaryTotal = useMemo(() => {
    if (!stats?.transactionSummary?.length) {
      return 0;
    }

    return stats.transactionSummary.reduce((total, item) => total + Number(item.value ?? item.count ?? 0), 0);
  }, [stats]);

  const transactionPieData = useMemo<ChartData[]>(() => {
    if (!stats?.transactionSummary?.length) {
      return [];
    }

    return stats.transactionSummary.map((item, index) => ({
      name: getSummaryLabel(item, index),
      value: Number(item.value ?? item.count ?? 0),
      amount: Number(item.amount || 0),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [stats]);

  const transactionBarData = useMemo(() => {
    if (!stats?.transactionSummary?.length) {
      return [];
    }

    return stats.transactionSummary.map((item, index) => ({
      name: getSummaryLabel(item, index),
      count: Number(item.value ?? item.count ?? 0),
      amount: Number(item.amount || 0),
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [stats]);

  const monthlyTrendData = useMemo<MonthlyTrend[]>(() => {
    if (!stats?.recentTransactions?.length) {
      return [];
    }

    const monthlyMap = new Map<string, MonthlyTrend>();

    stats.recentTransactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short", year: "2-digit" });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          transactions: 0,
          amount: 0,
          deposits: 0,
          withdrawals: 0,
        });
      }

      const entry = monthlyMap.get(monthKey)!;
      entry.transactions += 1;
      entry.amount += Number(tx.amount || 0);

      if (tx.type === "Deposit") {
        entry.deposits += Number(tx.amount || 0);
      } else if (tx.type === "Withdraw") {
        entry.withdrawals += Number(tx.amount || 0);
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [stats]);

  const accountHealthData = useMemo(() => {
    if (!stats) {
      return [];
    }

    const activeRatio = stats.totalAccounts > 0 ? (stats.totalCustomers / stats.totalAccounts) * 100 : 0;
    const loanRatio = stats.totalAccounts > 0 ? (stats.pendingLoans / stats.totalAccounts) * 100 : 0;
    const avgBalance = stats.totalAccounts > 0 ? stats.totalBankBalance / stats.totalAccounts : 0;

    return [
      { name: "Active Accounts", value: Math.min(activeRatio, 100), color: "#16a34a" },
      { name: "Pending Loans", value: Math.min(loanRatio, 100), color: "#f59e0b" },
      { name: "Avg Balance Health", value: Math.min((avgBalance / 100000) * 100, 100), color: "#2563eb" },
    ];
  }, [stats]);

  const recentTransactions = stats?.recentTransactions ?? [];
  const transactionSummary = stats?.transactionSummary ?? [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label || payload[0].name}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" color="text.secondary">
              {entry.name}: {typeof entry.value === "number" && entry.name.toLowerCase().includes("amount")
                ? formatCurrency(entry.value)
                : entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (!stats && !loading && !error) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden", mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor bank-wide operations, customer growth, transactions, and pending actions in real time.
        </Typography>
      </Box>

      {loading && (
        <Card sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Loading dashboard analytics...
              </Typography>
            </Stack>
            <LinearProgress />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && stats && (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={4} xl={2} key={stat.title}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, wordBreak: "break-word" }}>
                          {stat.value}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {stat.subtitle}
                          </Typography>
                          {stat.trend && (
                            <Chip
                              label={stat.trend}
                              size="small"
                              color={stat.trend.startsWith("+") ? "success" : "error"}
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: `${stat.color}15`,
                          color: stat.color,
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>

          {/* Charts Row 1: Transaction Distribution */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={5}>
              <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <TrendingUpIcon color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Transaction Distribution
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Breakdown by transaction type
                      </Typography>
                    </Box>
                  </Stack>

                  {transactionPieData.length > 0 ? (
                    <Box sx={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={transactionPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => {
                              const percentage = (percent ?? 0) * 100;
                              return `${name} ${percentage.toFixed(0)}%`;
                            }}
                            labelLine={false}
                          >
                            {transactionPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 300,
                        borderRadius: 3,
                        border: "1px dashed",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        px: 3,
                      }}
                    >
                      <Typography color="text.secondary">
                        No transaction data available for chart.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={7}>
              <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Transaction Volume by Type
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Count and amount breakdown
                      </Typography>
                    </Box>
                    <Chip icon={<TrendingUpIcon />} label={`${summaryTotal} total`} color="primary" variant="outlined" />
                  </Stack>

                  {transactionBarData.length > 0 ? (
                    <Box sx={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={transactionBarData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="count" name="Transaction Count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 300,
                        borderRadius: 3,
                        border: "1px dashed",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        px: 3,
                      }}
                    >
                      <Typography color="text.secondary">
                        No transaction data available for chart.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 2: Trends and Health */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <TrendingUpIcon color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Transaction Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly transaction volume and amounts
                      </Typography>
                    </Box>
                  </Stack>

                  {monthlyTrendData.length > 0 ? (
                    <Box sx={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={monthlyTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="transactions"
                            name="Transaction Count"
                            stroke="#2563eb"
                            fill="#2563eb"
                            fillOpacity={0.3}
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="amount"
                            name="Amount (BDT)"
                            stroke="#16a34a"
                            fill="#16a34a"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 300,
                        borderRadius: 3,
                        border: "1px dashed",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        px: 3,
                      }}
                    >
                      <Typography color="text.secondary">
                        No trend data available yet. Trends will appear as transactions are processed.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <SecurityIcon color="primary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Account Health
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Key performance indicators
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2}>
                    {accountHealthData.map((item, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.value.toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(item.value, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: `${item.color}20`,
                            "& .MuiLinearProgress-bar": {
                              bgcolor: item.color,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Stack spacing={2}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.default" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Customer to Employee Ratio
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {stats.totalEmployees > 0
                          ? `${(stats.totalCustomers / stats.totalEmployees).toFixed(1)} : 1`
                          : "N/A"}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.default" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Average Balance per Account
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {stats.totalAccounts > 0
                          ? formatCurrency(stats.totalBankBalance / stats.totalAccounts)
                          : formatCurrency(0)}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.default" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Pending Loans Share
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {stats.totalAccounts > 0
                          ? `${((stats.pendingLoans / stats.totalAccounts) * 100).toFixed(1)}%`
                          : "0.0%"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Transaction Summary Bars */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card sx={{ border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Transaction Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Breakdown from backend-provided summary data.
                      </Typography>
                    </Box>
                    <Chip icon={<TrendingUpIcon />} label={`${summaryTotal} total`} color="primary" variant="outlined" />
                  </Stack>

                  {transactionSummary.length > 0 ? (
                    <Stack spacing={2.25}>
                      {transactionSummary.map((item, index) => {
                        const itemValue = Number(item.value ?? item.count ?? 0);
                        const percent = summaryTotal > 0 ? (itemValue / summaryTotal) * 100 : 0;

                        return (
                          <Box key={`${getSummaryLabel(item, index)}-${index}`}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {getSummaryLabel(item, index)}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {typeof item.amount === "number" && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatCurrency(item.amount)}
                                  </Typography>
                                )}
                                <Chip label={item.value ?? item.count ?? 0} size="small" />
                              </Stack>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(percent, 100)}
                              sx={{
                                height: 8,
                                borderRadius: 999,
                                bgcolor: `${CHART_COLORS[index % CHART_COLORS.length]}20`,
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                                },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 220,
                        borderRadius: 3,
                        border: "1px dashed",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        px: 3,
                      }}
                    >
                      <Typography color="text.secondary">
                        No transaction summary data is available yet.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Transactions */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Transactions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest backend-provided transaction activity from the admin feed.
                  </Typography>
                </Box>
                <Chip label={`${recentTransactions.length} records`} variant="outlined" />
              </Stack>

              {recentTransactions.length > 0 ? (
                <Stack divider={<Divider flexItem />} spacing={0}>
                  {recentTransactions.map((transaction: AdminTransactionListItem) => (
                    <Box
                      key={transaction.id}
                      sx={{
                        py: 2,
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {transaction.customerName || transaction.user?.name || "Unknown Customer"}
                          </Typography>
                          <Chip
                            label={transaction.type || "Transaction"}
                            size="small"
                            sx={{
                              bgcolor: `${TRANSACTION_TYPE_COLORS[transaction.type || ""] || "#2563eb"}20`,
                              color: TRANSACTION_TYPE_COLORS[transaction.type || ""] || "#2563eb",
                            }}
                          />
                          {transaction.flagged && (
                            <Chip
                              icon={<WarningIcon sx={{ fontSize: 14 }} />}
                              label="Flagged"
                              size="small"
                              color="warning"
                            />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {transaction.description || "No description provided"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ref: {transaction.referenceNumber || "N/A"} • Account:{" "}
                          {transaction.accountNumber || transaction.account?.accountNumber || "N/A"}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {formatCurrency(transaction.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : "Unknown date"}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    minHeight: 180,
                    borderRadius: 3,
                    border: "1px dashed",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 3,
                  }}
                >
                  <Typography color="text.secondary">
                    No recent transactions are available for display.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
