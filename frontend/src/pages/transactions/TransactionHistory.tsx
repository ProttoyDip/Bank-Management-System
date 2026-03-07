import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface Transaction {
  id: number;
  date: string;
  description: string;
  type: "Deposit" | "Withdraw" | "Transfer In" | "Transfer Out";
  amount: number;
  balance: number;
  reference: string;
}

const mockTransactions: Transaction[] = [
  { id: 1, date: "2024-01-15", description: "Cash Deposit", type: "Deposit", amount: 50000, balance: 75000, reference: "TXN-001" },
  { id: 2, date: "2024-01-14", description: "ATM Withdrawal", type: "Withdraw", amount: -10000, balance: 25000, reference: "TXN-002" },
  { id: 3, date: "2024-01-13", description: "Transfer from John", type: "Transfer In", amount: 25000, balance: 35000, reference: "TXN-003" },
  { id: 4, date: "2024-01-12", description: "Bill Payment", type: "Withdraw", amount: -5000, balance: 10000, reference: "TXN-004" },
  { id: 5, date: "2024-01-11", description: "Cash Deposit", type: "Deposit", amount: 15000, balance: 15000, reference: "TXN-005" },
  { id: 6, date: "2024-01-10", description: "Online Transfer", type: "Transfer Out", amount: -8000, balance: 0, reference: "TXN-006" },
  { id: 7, date: "2024-01-09", description: "Salary Credit", type: "Deposit", amount: 8000, balance: 8000, reference: "TXN-007" },
];

const chartData = [
  { month: "Week 1", deposits: 65000, withdrawals: 23000 },
  { month: "Week 2", deposits: 45000, withdrawals: 18000 },
  { month: "Week 3", deposits: 72000, withdrawals: 35000 },
  { month: "Week 4", deposits: 58000, withdrawals: 28000 },
];

export default function TransactionHistory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Deposit":
      case "Transfer In":
        return "success";
      case "Withdraw":
      case "Transfer Out":
        return "error";
      default:
        return "default";
    }
  };

  const filteredTransactions = mockTransactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.reference.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Transactions</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all transactions
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Search transactions..."
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="deposit">Deposits</MenuItem>
                  <MenuItem value="withdraw">Withdrawals</MenuItem>
                  <MenuItem value="transfer">Transfers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chart and Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Weekly Overview</Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `৳${v / 1000}k`} />
                    <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, ""]} />
                    <Bar dataKey="deposits" fill="#22c55e" name="Deposits" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Summary</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Total Deposits</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                    ৳240,000
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Total Withdrawals</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main" }}>
                    ৳104,000
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Net Flow</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                    ৳136,000
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {mockTransactions.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h6" sx={{ p: 3, pb: 2, fontWeight: 600 }}>Transaction History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                      {transaction.reference}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        color={getTypeColor(transaction.type) as any}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: transaction.amount > 0 ? "success.main" : "error.main",
                      }}
                    >
                      {transaction.amount > 0 ? "+" : ""}৳{Math.abs(transaction.amount).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                      ৳{transaction.balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No transactions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

