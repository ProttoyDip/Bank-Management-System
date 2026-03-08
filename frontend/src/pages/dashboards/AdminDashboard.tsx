import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, Alert } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import api from "../../services/api";
import { User, Account, Loan, LoanStatus, ApiResponse } from "../../types";
import TransactionChart from "../../components/charts/TransactionChart";
import LoanChart from "../../components/charts/LoanChart";
import { motion } from "framer-motion";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, accountsRes, loansRes] = await Promise.all([
          api.get<ApiResponse<User[]>>("/users"),
          api.get<ApiResponse<Account[]>>("/accounts"),
          api.get<ApiResponse<Loan[]>>("/loans"),
        ]);
        setUsers(usersRes.data.data);
        setAccounts(accountsRes.data.data);
        setLoans(loansRes.data.data);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const activeLoans = loans.filter((l) => l.status === LoanStatus.ACTIVE).length;

  const stats: StatCard[] = [
    {
      title: "Total Customers",
      value: users.length,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: "#3b82f6",
    },
    {
      title: "Total Accounts",
      value: accounts.length,
      icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
      color: "#22c55e",
    },
    {
      title: "Active Loans",
      value: activeLoans,
      icon: <RequestQuoteIcon sx={{ fontSize: 28 }} />,
      color: "#f59e0b",
    },
    {
      title: "Total Balance",
      value: `৳ ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: <SavingsIcon sx={{ fontSize: 28 }} />,
      color: "#8b5cf6",
    },
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
              transition={{ duration: 0.4, delay: index * 0.1 }}
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
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{stat.value}</Typography>
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

      {/* Charts - Consistent Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Loan Distribution</Typography>
              <LoanChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Accounts */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Recent Accounts</Typography>
      <Grid container spacing={2}>
        {accounts.slice(0, 6).map((account, index) => (
          <Grid item xs={12} sm={6} md={4} key={account.id}>
            <Card 
              component={motion.div} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: index * 0.05 }} 
              sx={{ 
                border: "1px solid", 
                borderColor: "divider",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                    {account.accountNumber}
                  </Typography>
                  <Chip 
                    label={account.isActive ? "Active" : "Inactive"} 
                    size="small" 
                    color={account.isActive ? "success" : "default"}
                    sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  ৳ {Number(account.balance).toLocaleString()}
                </Typography>
                <Chip 
                  label={account.type} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
        {accounts.length === 0 && !loading && (
          <Grid item xs={12}>
            <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">No accounts found</Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

