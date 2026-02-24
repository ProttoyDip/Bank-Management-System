import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Chip,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import api from "../services/api";
import type { User, Account, ApiResponse } from "../types";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
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
      title: "Total Users",
      value: users.length,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#38bdf8",
    },
    {
      title: "Total Accounts",
      value: accounts.length,
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
      color: "#4ade80",
    },
    {
      title: "Active Accounts",
      value: activeAccounts,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#fbbf24",
    },
    {
      title: "Total Balance",
      value: `৳ ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: <SavingsIcon sx={{ fontSize: 40 }} />,
      color: "#a78bfa",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Bank Management System — CSE 3104 Database Lab Project
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            {loading ? (
              <Skeleton variant="rounded" height={140} />
            ) : (
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${stat.color}20`,
                  },
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
                    </Box>
                    <Box sx={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Recent Accounts */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Accounts
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={200} />
      ) : accounts.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No accounts yet. Create one from the Accounts page.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {accounts.slice(0, 6).map((account) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
              <Card sx={{ border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
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
