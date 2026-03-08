import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, Alert } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import api from "../../services/api";
import { User, Account, Transaction, ApiResponse } from "../../types";
import TransactionChart from "../../components/charts/TransactionChart";
import { motion } from "framer-motion";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function EmployeeDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, accountsRes, txRes] = await Promise.all([
          api.get<ApiResponse<User[]>>("/users"),
          api.get<ApiResponse<Account[]>>("/accounts"),
          api.get<ApiResponse<Transaction[]>>("/transactions"),
        ]);
        setUsers(usersRes.data.data);
        setAccounts(accountsRes.data.data);
        setTransactions(txRes.data.data);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const today = new Date().toDateString();
  const transactionsToday = transactions.filter(
    (tx) => new Date(tx.createdAt).toDateString() === today
  ).length;

  const stats: StatCard[] = [
    { title: "Customers Served", value: users.length, icon: <PeopleIcon />, color: "#3b82f6" },
    { title: "Accounts Managed", value: accounts.length, icon: <AccountBalanceIcon />, color: "#22c55e" },
    { title: "Transactions Today", value: transactionsToday, icon: <SwapHorizIcon />, color: "#f59e0b" },
    { title: "Total Value", value: `৳ ${totalBalance.toLocaleString()}`, icon: <TrendingUpIcon />, color: "#8b5cf6" },
  ];

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stat Cards - Consistent Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <Card 
              component={motion.div} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }} 
              whileHover={{ y: -4 }}
              sx={{ 
                border: "1px solid", 
                borderColor: "divider",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                  </Box>
                  <Box sx={{ 
                    width: 52, 
                    height: 52, 
                    borderRadius: 2, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    bgcolor: `${stat.color}15`, 
                    color: stat.color 
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Transaction Overview</Typography>
              <TransactionChart />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Quick Actions</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Chip 
                  label="Open New Account" 
                  color="primary" 
                  clickable 
                  sx={{ py: 2, fontWeight: 600, justifyContent: "flex-start" }} 
                />
                <Chip 
                  label="Process Transaction" 
                  color="secondary" 
                  clickable 
                  sx={{ py: 2, fontWeight: 600, justifyContent: "flex-start" }} 
                />
                <Chip 
                  label="Customer Inquiry" 
                  color="info" 
                  clickable 
                  sx={{ py: 2, fontWeight: 600, justifyContent: "flex-start" }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

