import { useEffect, useMemo, useState } from "react";
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
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import type { Account, ApiResponse } from "../types";

interface AccountSearchResult {
  id: number;
  accountNumber: string;
  userId: number;
  name: string;
  isActive: boolean;
}

export default function Transfer() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"deposit" | "withdraw" | "transfer">("deposit");
  const [selectedAccount, setSelectedAccount] = useState<number>(0);
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("");
  const [foundDestinationAccount, setFoundDestinationAccount] = useState<AccountSearchResult | null>(null);
  const [searchingDestination, setSearchingDestination] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const showSnack = (message: string, severity: "success" | "error") => {
    setSnack({ open: true, message, severity });
  };

  const fetchAccounts = async () => {
    try {
      if (user?.role === UserRole.CUSTOMER) {
        const res = await api.get<ApiResponse<Account[]>>("/accounts/my-accounts");
        const myAccounts = res.data.data || [];
        setAccounts(myAccounts);
        if (myAccounts.length > 0) {
          setSelectedAccount(myAccounts[0].id);
        }
      } else {
        const res = await api.get<ApiResponse<Account[]>>("/accounts");
        setAccounts(res.data.data || []);
      }
    } catch {
      showSnack("Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user?.id, user?.role]);

  const currentAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccount),
    [accounts, selectedAccount]
  );

  const handleSearchDestination = async () => {
    if (!destinationAccountNumber.trim()) return showSnack("Please enter an account number", "error");
    setSearchingDestination(true);
    try {
      const res = await api.get<ApiResponse<AccountSearchResult>>(
        `/accounts/search?accountNumber=${encodeURIComponent(destinationAccountNumber.trim())}`
      );
      const found = res.data.data;
      if (found.id === selectedAccount) return showSnack("Cannot transfer to the same account", "error");
      if (!found.isActive) return showSnack("Destination account is not active", "error");
      setFoundDestinationAccount(found);
      showSnack(`Account found: ${found.name}`, "success");
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
    if (mode === "transfer" && !foundDestinationAccount) {
      return showSnack("Please verify destination account first", "error");
    }

    setSubmitting(true);
    try {
      if (mode === "transfer") {
        await api.post("/accounts/transfer", {
          fromAccountId: selectedAccount,
          toAccountId: foundDestinationAccount!.id,
          amount: Number(amount),
        });
        showSnack(`Transfer of ৳${Number(amount).toLocaleString()} successful`, "success");
        setDestinationAccountNumber("");
        setFoundDestinationAccount(null);
      } else {
        await api.post(`/accounts/${selectedAccount}/${mode}`, { amount: Number(amount) });
        showSnack(`${mode === "deposit" ? "Deposit" : "Withdrawal"} successful`, "success");
      }
      setAmount("");
      await fetchAccounts();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Transaction failed";
      showSnack(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 650, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Transfer</Typography>
        <Typography variant="body2" color="text.secondary">
          Deposit, withdraw, or transfer money between accounts
        </Typography>
      </Box>

      {!loading && accounts.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No accounts available.</Typography>
        </Card>
      ) : (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} fullWidth size="large">
              <ToggleButton value="deposit"><ArrowDownwardIcon sx={{ mr: 1 }} />Deposit</ToggleButton>
              <ToggleButton value="withdraw"><ArrowUpwardIcon sx={{ mr: 1 }} />Withdraw</ToggleButton>
              <ToggleButton value="transfer"><SwapHorizIcon sx={{ mr: 1 }} />Transfer</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              select
              label={mode === "transfer" ? "From Account (Auto Selected)" : "Account"}
              fullWidth
              value={selectedAccount || ""}
              onChange={(e) => {
                setSelectedAccount(Number(e.target.value));
                setDestinationAccountNumber("");
                setFoundDestinationAccount(null);
              }}
              disabled={user?.role === UserRole.CUSTOMER}
            >
              {accounts.filter((a) => a.isActive).map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.accountNumber} — ৳{Number(a.balance).toLocaleString()}
                </MenuItem>
              ))}
            </TextField>

            {mode === "transfer" && (
              <>
                <TextField
                  label="To Account Number"
                  fullWidth
                  value={destinationAccountNumber}
                  onChange={(e) => {
                    setDestinationAccountNumber(e.target.value);
                    setFoundDestinationAccount(null);
                  }}
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
                  <Alert severity="success">
                    Account found: {foundDestinationAccount.name} ({foundDestinationAccount.accountNumber})
                  </Alert>
                )}
              </>
            )}

            {currentAccount && (
              <Box sx={{ bgcolor: "background.default", borderRadius: 2, p: 2.5, textAlign: "center", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary">Current Balance</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                  ৳ {Number(currentAccount.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}

            <Divider />

            <TextField
              label="Amount (৳)"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 1, step: "0.01" }}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={
                !selectedAccount ||
                !amount ||
                Number(amount) <= 0 ||
                (mode === "transfer" && !foundDestinationAccount) ||
                submitting
              }
              color={mode === "deposit" ? "success" : mode === "withdraw" ? "error" : "primary"}
            >
              {submitting ? "Processing..." : mode === "deposit" ? "Deposit" : mode === "withdraw" ? "Withdraw" : "Transfer"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

