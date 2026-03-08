import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import api from "../../services/api";
import { AccountType } from "../../types";
import type { Account, User, ApiResponse } from "../../types";
import { useAuth } from "../../context/AuthContext";

export default function CustomerAccounts() {
  const { user: authUser } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "error" as "success" | "error" });

  useEffect(() => {
    if (!authUser) return;
    api
      .get<ApiResponse<User>>(`/users/${authUser.id}`)
      .then((res) => {
        setAccounts(res.data.data.accounts || []);
      })
      .catch(() => {
        setSnack({ open: true, message: "Failed to load accounts", severity: "error" });
      })
      .finally(() => setLoading(false));
  }, [authUser]);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>My Accounts</Typography>
        <Typography variant="body2" color="text.secondary">
          View your bank accounts
        </Typography>
      </Box>

      {!loading && accounts.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">
            No accounts found. Contact your bank to open an account.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Account #</TableCell>
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

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
