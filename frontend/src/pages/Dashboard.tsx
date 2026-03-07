import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, Alert } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import api from "../services/api";
import { User, Account, ApiResponse } from "../types";
import TransactionChart from "../components/charts/TransactionChart";
import LoanChart from "../components/charts/LoanChart";
import { motion } from "framer-motion";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, accountsRes] = await Promise.all([
          api.get<ApiResponse<User[]>>("/users"),
          api.get<ApiResponse<Account[]>>("/accounts"),
        ]);
        setUsers(usersRes.data.data);
        setAccounts(accountsRes.data.data);
      } catch {
        setError("Failed to load dashboard data. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const activeAccounts = accounts.filter((a) => a.isActive).length;

  const stats: StatCard[] = [
    {
      title: "Total Customers",
      value: users.length,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: "#3b82f6",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Total Accounts",
      value: accounts.length,
      icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
      color: "#22c55e",
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Active Accounts",
      value: activeAccounts,
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: "#f59e0b",
    },
    {
      title: "Total Balance",
      value: `৳ ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: <SavingsIcon sx={{ fontSize: 28 }} />,
      color: "#8b5cf6",
      trend: { value: 15, isPositive: true },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Bank Management System — Your financial command center
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: `0 8px 24px ${stat.color}20` }}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    {stat.trend && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: stat.trend.isPositive ? "success.main" : "error.main",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        {stat.trend.isPositive ? "↑" : "↓"} {Math.abs(stat.trend.value)}%
                        <Typography component="span" variant="caption" color="text.secondary">
                          vs last month
                        </Typography>
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TransactionChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <LoanChart />
        </Grid>
      </Grid>

      {/* Recent Accounts */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Recent Accounts
      </Typography>
      {accounts.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No accounts yet. Create one from the Accounts page.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {accounts.slice(0, 6).map((account, index) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                      {account.accountNumber}
                    </Typography>
                    <Chip
                      label={account.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={account.isActive ? "success" : "default"}
                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    ৳ {Number(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Chip label={account.type} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                    <Typography variant="caption" color="text.secondary">
                      {account.user?.name ?? `User #${account.userId}`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

