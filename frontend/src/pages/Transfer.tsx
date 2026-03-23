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
  InputAdornment,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SearchIcon from "@mui/icons-material/Search";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import type { Account, ApiResponse, User } from "../types";

export default function Transfer() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"deposit" | "withdraw" | "transfer">("deposit");
  const [selectedAccount, setSelectedAccount] = useState<number>(0);
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("");
  const [foundDestinationAccount, setFoundDestinationAccount] = useState<Account | null>(null);
  const [searchingDestination, setSearchingDestination] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const fetchAccounts = async () => {
    try {
      if (user?.role === UserRole.CUSTOMER) {
        const res = await api.get<ApiResponse<User>>(`/users/${user.id}`);
        setAccounts(res.data.data.accounts || []);
      } else {
        const res = await api.get<ApiResponse<Account[]>>("/accounts");
        setAccounts(res.data.data);
      }
    } catch {
      showSnack("Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const currentAccount = accounts.find((a) => a.id === selectedAccount);

  const showSnack = (message: string, severity: "success" | "error") => {
    setSnack({ open: true, message, severity });
  };

  // Search for destination account
  const handleSearchDestination = async () => {
    if (!destinationAccountNumber.trim()) return showSnack("Please enter an account number", "error");
    setSearchingDestination(true);
    try {
      const res = await api.get<ApiResponse<Account>>(`/accounts/by-account-number/${destinationAccountNumber.trim()}`);
      const foundAccount = res.data.data;

      if (foundAccount.id === selectedAccount) return showSnack("Cannot transfer to the same account", "error");
      if (!foundAccount.isActive) return showSnack("Destination account is not active", "error");

      setFoundDestinationAccount(foundAccount);
      showSnack(`Account ${foundAccount.accountNumber} found ✅`, "success");
    } catch (err: any) {
      if (err.response?.status === 404) showSnack("Account not found", "error");
      else showSnack("Failed to find account", "error");
      setFoundDestinationAccount(null);
    } finally {
      setSearchingDestination(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !amount || Number(amount) <= 0) return;

    if (mode === "transfer" && !foundDestinationAccount)
      return showSnack("Please search and select a valid destination account", "error");

    setSubmitting(true);
    try {
      if (mode === "transfer") {
        const res = await api.post("/accounts/transfer", {
          fromAccountId: selectedAccount,
          toAccountId: foundDestinationAccount!.id,
          amount: Number(amount),
        });
        const toAccountNumber = res.data.toTransaction?.account?.accountNumber || "XXXXXX";
        showSnack(`💸 Transfer of ৳${amount} to ${toAccountNumber} successful!`, "success");
        setDestinationAccountNumber("");
        setFoundDestinationAccount(null);
      } else {
        const res = await api.post(`/accounts/${selectedAccount}/${mode}`, { amount: Number(amount) });
        const accountNumber = res.data.transaction?.account?.accountNumber || "XXXXXX";
        const action = mode === "deposit" ? "Deposit" : "Withdrawal";
        showSnack(`✅ ${action} of ৳${amount} on ${accountNumber} successful!`, "success");
      }
      setAmount("");
      fetchAccounts();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Transaction failed";
      showSnack(`❌ ${msg}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 650, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Transfer</Typography>
        <Typography variant="body2" color="text.secondary">
          Deposit, withdraw, or transfer money between accounts
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
            <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} fullWidth size="large">
              <ToggleButton
                value="deposit"
                sx={{ fontWeight: 600, "&.Mui-selected": { bgcolor: "rgba(74, 222, 128,0.15)", color: "success.main" } }}
              >
                <ArrowDownwardIcon sx={{ mr: 1 }} /> Deposit
              </ToggleButton>
              <ToggleButton
                value="withdraw"
                sx={{ fontWeight: 600, "&.Mui-selected": { bgcolor: "rgba(248,113,113,0.15)", color: "error.main" } }}
              >
                <ArrowUpwardIcon sx={{ mr: 1 }} /> Withdraw
              </ToggleButton>
              <ToggleButton
                value="transfer"
                sx={{ fontWeight: 600, "&.Mui-selected": { bgcolor: "rgba(59,130,246,0.15)", color: "primary.main" } }}
              >
                <SwapHorizIcon sx={{ mr: 1 }} /> Transfer
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Account Select */}
            <TextField
              select
              label={mode === "transfer" ? "From Account (Source)" : "Select Account"}
              fullWidth
              value={selectedAccount || ""}
              onChange={(e) => {
                setSelectedAccount(Number(e.target.value));
                if (mode === "transfer") {
                  setDestinationAccountNumber("");
                  setFoundDestinationAccount(null);
                }
              }}
            >
              {accounts.filter(a => a.isActive).map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.accountNumber} — {a.user?.name ?? `User #${a.userId}`} ({a.type})
                </MenuItem>
              ))}
            </TextField>

            {/* Destination Account */}
            {mode === "transfer" && (
              <>
                <TextField
                  label="To Account Number (Destination)"
                  fullWidth
                  value={destinationAccountNumber}
                  onChange={(e) => { setDestinationAccountNumber(e.target.value); setFoundDestinationAccount(null); }}
                  placeholder="Enter destination account number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleSearchDestination}
                          disabled={searchingDestination || !destinationAccountNumber.trim()}
                        >
                          {searchingDestination ? "..." : "Search"}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                {foundDestinationAccount && (
                  <Box sx={{ bgcolor: "rgba(74,222,128,0.1)", borderRadius: 2, p: 2, border: "1px solid", borderColor: "success.main" }}>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>✓ Account Found</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {foundDestinationAccount.accountNumber} — {foundDestinationAccount.user?.name ?? `User #${foundDestinationAccount.userId}`} ({foundDestinationAccount.type})
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Balance Box */}
            {currentAccount && (
              <Box
                sx={{
                  bgcolor: mode === "transfer" ? "rgba(59,130,246,0.08)" : "background.default",
                  borderRadius: 2,
                  p: 2.5,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: mode === "transfer" ? "primary.light" : "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {mode === "transfer" ? "Available Balance" : "Current Balance"}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "monospace", color: mode === "transfer" ? "primary.main" : "text.primary" }}>
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
              disabled={
                !selectedAccount ||
                !amount ||
                Number(amount) <= 0 ||
                (mode === "transfer" && (!foundDestinationAccount || foundDestinationAccount.id === selectedAccount)) ||
                submitting
              }
              color={mode === "deposit" ? "success" : mode === "withdraw" ? "error" : "primary"}
              sx={{ py: 1.5, fontWeight: 700, fontSize: "1rem" }}
            >
              {submitting
                ? "Processing..."
                : mode === "deposit"
                ? `Deposit ৳${amount || "0"}`
                : mode === "withdraw"
                ? `Withdraw ৳${amount || "0"}`
                : `Transfer ৳${amount || "0"}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{
            width: "100%",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
          }}
          iconMapping={{
            success: <Box sx={{ fontSize: "1.8rem", mr: 1 }}></Box>,
            error: <Box sx={{ fontSize: "1.8rem", mr: 1 }}>❌</Box>,
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}