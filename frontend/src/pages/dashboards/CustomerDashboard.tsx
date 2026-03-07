import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, Button, Alert } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Account, ApiResponse, User } from "../../types";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const res = await api.get<ApiResponse<User>>(`/users/${user.id}`);
          setAccounts(res.data.data.accounts || []);
        }
      } catch {
        setError("Failed to load account data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const recentTransactions = [
    { id: 1, type: "deposit", amount: 5000, date: "2024-01-15", description: "Cash Deposit" },
    { id: 2, type: "withdraw", amount: 2000, date: "2024-01-14", description: "ATM Withdrawal" },
    { id: 3, type: "transfer", amount: 1500, date: "2024-01-13", description: "Transfer to John" },
  ];

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Account Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            component={motion.div} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            whileHover={{ y: -4 }}
            sx={{ 
              border: "1px solid", 
              borderColor: "divider", 
              bgcolor: "primary.main", 
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": { boxShadow: "0 8px 24px rgba(25, 118, 210, 0.35)" },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>Total Balance</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                ৳ {totalBalance.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Across {accounts.length} accounts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card 
                component={motion.div} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                whileHover={{ y: -2 }} 
                sx={{ 
                  border: "1px solid", 
                  borderColor: "divider",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <ArrowDownwardIcon sx={{ color: "success.main", fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Deposit</Typography>
                  <Button variant="contained" color="success" size="small">Deposit Money</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card 
                component={motion.div} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                whileHover={{ y: -2 }} 
                sx={{ 
                  border: "1px solid", 
                  borderColor: "divider",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <ArrowUpwardIcon sx={{ color: "error.main", fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Withdraw</Typography>
                  <Button variant="contained" color="error" size="small">Withdraw Money</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* My Accounts */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>My Accounts</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {accounts.map((account, index) => (
          <Grid item xs={12} sm={6} md={4} key={account.id}>
            <Card 
              component={motion.div} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: index * 0.1 }}
              sx={{ 
                border: "1px solid", 
                borderColor: "divider",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                    {account.accountNumber}
                  </Typography>
                  <Chip 
                    label={account.type} 
                    size="small" 
                    sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  ৳ {Number(account.balance).toLocaleString()}
                </Typography>
                <Chip 
                  label={account.isActive ? "Active" : "Inactive"} 
                  size="small" 
                  color={account.isActive ? "success" : "default"}
                  sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
        {accounts.length === 0 && !loading && (
          <Grid item xs={12}>
            <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">No accounts yet. Open your first account today!</Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Recent Transactions */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Recent Transactions</Typography>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 0 }}>
          {recentTransactions.map((tx, index) => (
            <Box 
              key={tx.id} 
              sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                py: 2.5, 
                px: 3,
                borderBottom: index < recentTransactions.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: "50%", 
                  bgcolor: tx.type === "deposit" ? "success.light" : tx.type === "withdraw" ? "error.light" : "warning.light", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}>
                  {tx.type === "deposit" ? (
                    <ArrowDownwardIcon sx={{ color: "success.main", fontSize: 20 }} />
                  ) : tx.type === "withdraw" ? (
                    <ArrowUpwardIcon sx={{ color: "error.main", fontSize: 20 }} />
                  ) : (
                    <SwapHorizIcon sx={{ color: "warning.main", fontSize: 20 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{tx.description}</Typography>
                  <Typography variant="caption" color="text.secondary">{tx.date}</Typography>
                </Box>
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: tx.type === "deposit" ? "success.main" : "error.main" 
                }}
              >
                {tx.type === "deposit" ? "+" : "-"} ৳ {tx.amount.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}

