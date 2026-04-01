import { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid2,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import employeeService from "../../services/employeeService";
import { Transaction } from "../../types";

type CashForm = { accountNumber: string; amount: string; description: string };
type TransferForm = { senderAccountNumber: string; receiverAccountNumber: string; amount: string; description: string };

export default function EmployeeTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({ date: "", type: "", status: "" });
  const [depositForm, setDepositForm] = useState<CashForm>({ accountNumber: "", amount: "", description: "" });
  const [withdrawForm, setWithdrawForm] = useState<CashForm>({ accountNumber: "", amount: "", description: "" });
  const [transferForm, setTransferForm] = useState<TransferForm>({ senderAccountNumber: "", receiverAccountNumber: "", amount: "", description: "" });
  const [receiverName, setReceiverName] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const load = async () => {
    try {
      const data = await employeeService.getTransactions({
        date: filters.date || undefined,
        type: filters.type || undefined,
        status: filters.status || undefined,
      });
      setTransactions(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load transactions." });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitDeposit = async (e: FormEvent) => {
    e.preventDefault();
    await employeeService.deposit({
      accountNumber: depositForm.accountNumber.trim(),
      amount: Number(depositForm.amount),
      description: depositForm.description.trim(),
    });
    setMessage({ type: "success", text: "Deposit completed." });
    setDepositForm({ accountNumber: "", amount: "", description: "" });
    load();
  };

  const submitWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    await employeeService.withdraw({
      accountNumber: withdrawForm.accountNumber.trim(),
      amount: Number(withdrawForm.amount),
      description: withdrawForm.description.trim(),
    });
    setMessage({ type: "success", text: "Withdrawal completed." });
    setWithdrawForm({ accountNumber: "", amount: "", description: "" });
    load();
  };

  const verifyReceiver = async () => {
    if (!transferForm.receiverAccountNumber.trim()) return;
    const receiver = await employeeService.searchAccountByNumber(transferForm.receiverAccountNumber.trim());
    setReceiverName(receiver.name);
  };

  const submitTransfer = async (e: FormEvent) => {
    e.preventDefault();
    await employeeService.transfer({
      senderAccountNumber: transferForm.senderAccountNumber.trim(),
      receiverAccountNumber: transferForm.receiverAccountNumber.trim(),
      amount: Number(transferForm.amount),
      description: transferForm.description.trim(),
    });
    setMessage({ type: "success", text: "Transfer completed." });
    setTransferForm({ senderAccountNumber: "", receiverAccountNumber: "", amount: "", description: "" });
    setReceiverName("");
    load();
  };

  const markTransaction = async (id: number, status: "Approved" | "Suspicious") => {
    await employeeService.reviewTransaction(id, { status });
    load();
  };

  return (
    <Box>
      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
      <Grid2 container spacing={2} sx={{ mb: 2 }}>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent component="form" onSubmit={submitDeposit}>
              <Typography variant="h6" mb={2}>Counter Deposit</Typography>
              <TextField fullWidth label="Account Number" value={depositForm.accountNumber} onChange={(e) => setDepositForm((s) => ({ ...s, accountNumber: e.target.value }))} sx={{ mb: 1.5 }} />
              <TextField fullWidth label="Amount" type="number" value={depositForm.amount} onChange={(e) => setDepositForm((s) => ({ ...s, amount: e.target.value }))} sx={{ mb: 1.5 }} />
              <TextField fullWidth label="Description" value={depositForm.description} onChange={(e) => setDepositForm((s) => ({ ...s, description: e.target.value }))} sx={{ mb: 1.5 }} />
              <Button type="submit" variant="contained" fullWidth>Deposit</Button>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent component="form" onSubmit={submitWithdraw}>
              <Typography variant="h6" mb={2}>Counter Withdraw</Typography>
              <TextField fullWidth label="Account Number" value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm((s) => ({ ...s, accountNumber: e.target.value }))} sx={{ mb: 1.5 }} />
              <TextField fullWidth label="Amount" type="number" value={withdrawForm.amount} onChange={(e) => setWithdrawForm((s) => ({ ...s, amount: e.target.value }))} sx={{ mb: 1.5 }} />
              <TextField fullWidth label="Description" value={withdrawForm.description} onChange={(e) => setWithdrawForm((s) => ({ ...s, description: e.target.value }))} sx={{ mb: 1.5 }} />
              <Button type="submit" variant="contained" color="warning" fullWidth>Withdraw</Button>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent component="form" onSubmit={submitTransfer}>
              <Typography variant="h6" mb={2}>Assisted Transfer</Typography>
              <TextField fullWidth label="Sender Account" value={transferForm.senderAccountNumber} onChange={(e) => setTransferForm((s) => ({ ...s, senderAccountNumber: e.target.value }))} sx={{ mb: 1.5 }} />
              <Box display="flex" gap={1} sx={{ mb: 1.5 }}>
                <TextField fullWidth label="Receiver Account" value={transferForm.receiverAccountNumber} onChange={(e) => setTransferForm((s) => ({ ...s, receiverAccountNumber: e.target.value }))} />
                <Button onClick={verifyReceiver}>Verify</Button>
              </Box>
              <TextField fullWidth label="Receiver Name" value={receiverName} disabled sx={{ mb: 1.5 }} />
              <TextField fullWidth label="Amount" type="number" value={transferForm.amount} onChange={(e) => setTransferForm((s) => ({ ...s, amount: e.target.value }))} sx={{ mb: 1.5 }} />
              <Button type="submit" variant="contained" color="secondary" fullWidth disabled={!receiverName}>Transfer</Button>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Transaction Monitoring</Typography>
          <Grid2 container spacing={1} mb={2}>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField type="date" fullWidth label="Date" value={filters.date} onChange={(e) => setFilters((s) => ({ ...s, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField select fullWidth label="Type" value={filters.type} onChange={(e) => setFilters((s) => ({ ...s, type: e.target.value }))}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdraw">Withdraw</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <Box display="flex" gap={1}>
                <TextField select fullWidth label="Status" value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Suspicious">Suspicious</MenuItem>
                </TextField>
                <Button variant="outlined" onClick={load}>Filter</Button>
              </Box>
            </Grid2>
          </Grid2>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Ref</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{tx.referenceNumber}</TableCell>
                  <TableCell>{tx.account?.accountNumber || tx.accountId}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell align="right">{Number(tx.amount).toLocaleString()}</TableCell>
                  <TableCell>{tx.status || "-"}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => markTransaction(tx.id, "Approved")}>Approve</Button>
                    <Button size="small" color="error" onClick={() => markTransaction(tx.id, "Suspicious")}>Suspicious</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
