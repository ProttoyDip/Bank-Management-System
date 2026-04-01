import { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import employeeService from "../../services/employeeService";
import { Account } from "../../types";

type CustomerForm = { name: string; email: string; phone: string; address: string };

export default function EmployeeAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Account | null>(null);
  const [form, setForm] = useState<CustomerForm>({ name: "", email: "", phone: "", address: "" });

  const fetchAccounts = async (q?: string) => {
    try {
      const data = q ? await employeeService.searchAccounts(q) : await employeeService.getAccounts();
      setAccounts(data);
      setError("");
    } catch {
      setError("Failed to load account list.");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchAccounts(query.trim());
  };

  const openEditor = (account: Account) => {
    setSelected(account);
    setForm({
      name: account.user?.name || "",
      email: account.user?.email || "",
      phone: account.user?.phone || "",
      address: account.user?.address || "",
    });
  };

  const updateCustomer = async () => {
    if (!selected) return;
    await employeeService.updateCustomerInfo(selected.id, form);
    await fetchAccounts(query.trim());
    setSelected(null);
  };

  const toggleStatus = async (account: Account) => {
    await employeeService.updateAccountStatus(account.id, !account.isActive);
    await fetchAccounts(query.trim());
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ border: "1px solid", borderColor: "divider", mb: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Customer Account Management</Typography>
          <Box component="form" onSubmit={onSearch} display="flex" gap={2}>
            <TextField
              fullWidth
              label="Search by account no / name / email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="contained">Search</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>{account.user?.name || "-"}</TableCell>
                  <TableCell>{account.user?.email || "-"}</TableCell>
                  <TableCell align="right">{Number(account.balance).toLocaleString()}</TableCell>
                  <TableCell>{account.isActive ? "Active" : "Frozen"}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEditor(account)}><VisibilityIcon /></IconButton>
                    <IconButton onClick={() => openEditor(account)}><EditIcon /></IconButton>
                    <Button size="small" onClick={() => toggleStatus(account)}>{account.isActive ? "Freeze" : "Activate"}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Account & Customer Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
              <Grid2 size={12}><TextField fullWidth label="Account Number" value={selected.accountNumber} disabled /></Grid2>
              <Grid2 size={12}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} /></Grid2>
              <Grid2 size={6}><TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} /></Grid2>
              <Grid2 size={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} /></Grid2>
              <Grid2 size={12}><TextField fullWidth label="Address" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} /></Grid2>
            </Grid2>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" onClick={updateCustomer}>Update Customer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
