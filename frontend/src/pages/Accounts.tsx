import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../services/api";
import { AccountType } from "../types";
import type { Account, User, ApiResponse, CreateAccountPayload } from "../types";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateAccountPayload>({ userId: 0, type: AccountType.SAVINGS });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const fetchData = async () => {
    try {
      const [accRes, usrRes] = await Promise.all([
        api.get<ApiResponse<Account[]>>("/accounts"),
        api.get<ApiResponse<User[]>>("/users"),
      ]);
      setAccounts(accRes.data.data);
      setUsers(usrRes.data.data);
    } catch {
      setSnack({ open: true, message: "Failed to load data", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!form.userId) {
      setSnack({ open: true, message: "Please select a user", severity: "error" });
      return;
    }
    try {
      await api.post("/accounts", form);
      setSnack({ open: true, message: "Account created successfully", severity: "success" });
      setDialogOpen(false);
      setForm({ userId: 0, type: AccountType.SAVINGS });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to create account";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case AccountType.SAVINGS:
        return "success";
      case AccountType.CURRENT:
        return "primary";
      case AccountType.FIXED_DEPOSIT:
        return "warning";
      case AccountType.LOAN:
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Accounts</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bank accounts
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 600 }}>
          New Account
        </Button>
      </Box>

      {/* Accounts Table */}
      {!loading && accounts.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">
            No accounts found. Click "New Account" to create one.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Account #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow key={acc.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>{acc.accountNumber}</TableCell>
                    <TableCell>{acc.user?.name ?? `User #${acc.userId}`}</TableCell>
                    <TableCell>
                      <Chip
                        label={acc.type}
                        size="small"
                        color={typeColor(acc.type) as any}
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                      ৳ {Number(acc.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={acc.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={acc.isActive ? "success" : "default"}
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      {new Date(acc.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create Account Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Account</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            select
            label="Select User"
            required
            fullWidth
            value={form.userId || ""}
            onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name} ({u.email})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Account Type"
            fullWidth
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })}
          >
            {Object.values(AccountType).map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.userId}>
            Create Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
