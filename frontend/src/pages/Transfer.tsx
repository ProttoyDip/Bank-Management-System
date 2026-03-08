import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Account, ApiResponse, User } from "../types";

export default function Transfer() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [selectedAccount, setSelectedAccount] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const fetchAccounts = async () => {
    try {
      // If user is a customer, fetch only their accounts
      if (user?.role === "customer") {
        const res = await api.get<ApiResponse<User>>(`/users/${user.id}`);
        setAccounts(res.data.data.accounts || []);
      } else {
        // For admin/employee, fetch all accounts
        const res = await api.get<ApiResponse<Account[]>>("/accounts");
        setAccounts(res.data.data);
      }
    } catch {
      setSnack({ open: true, message: "Failed to load accounts", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const currentAccount = accounts.find((a) => a.id === selectedAccount);

  const handleSubmit = async () => {
    if (!selectedAccount || !amount || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/accounts/${selectedAccount}/${mode}`, {
        amount: Number(amount),
      });
      setSnack({ open: true, message: res.data.message, severity: "success" });
      setAmount("");
      fetchAccounts();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Transaction failed";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Transfer</Typography>
        <Typography variant="body2" color="text.secondary">
          Deposit or withdraw money from an account
        </Typography>
      </Box>

      {!loading && accounts.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No accounts available. Create an account first.</Typography>
        </Card>
      ) : (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Mode Toggle */}
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              fullWidth
              size="large"
            >
              <ToggleButton
                value="deposit"
                sx={{
                  fontWeight: 600,
                  "&.Mui-selected": { bgcolor: "rgba(74, 222, 128, 0.15)", color: "success.main" },
                }}
              >
                <ArrowDownwardIcon sx={{ mr: 1 }} /> Deposit
              </ToggleButton>
              <ToggleButton
                value="withdraw"
                sx={{
                  fontWeight: 600,
                  "&.Mui-selected": { bgcolor: "rgba(248, 113, 113, 0.15)", color: "error.main" },
                }}
              >
                <ArrowUpwardIcon sx={{ mr: 1 }} /> Withdraw
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Account Select */}
            <TextField
              select
              label="Select Account"
              fullWidth
              value={selectedAccount || ""}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
            >
              {accounts
                .filter((a) => a.isActive)
                .map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.accountNumber} — {a.user?.name ?? `User #${a.userId}`} ({a.type})
                  </MenuItem>
                ))}
            </TextField>

            {/* Current Balance Display */}
            {currentAccount && (
              <Box
                sx={{
                  bgcolor: "background.default",
                  borderRadius: 2,
                  p: 2.5,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Current Balance
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                  ৳ {Number(currentAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}

            <Divider />

            {/* Amount */}
            <TextField
              label="Amount (৳)"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 1, step: "0.01" }}
            />

            {/* Submit */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={!selectedAccount || !amount || Number(amount) <= 0 || submitting}
              color={mode === "deposit" ? "success" : "error"}
              sx={{ py: 1.5, fontWeight: 700, fontSize: "1rem" }}
            >
              {submitting
                ? "Processing..."
                : mode === "deposit"
                ? `Deposit ৳${amount || "0"}`
                : `Withdraw ৳${amount || "0"}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
