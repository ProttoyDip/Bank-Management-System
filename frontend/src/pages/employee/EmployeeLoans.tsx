import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
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
import { Loan } from "../../types";

export default function EmployeeLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  const load = async () => {
    const data = await employeeService.getLoans(status);
    setLoans(data);
  };

  useEffect(() => {
    load();
  }, [status]);

  const review = async (id: number, action: "approve" | "reject") => {
    const remark = remarks[id] || "";
    if (action === "approve") await employeeService.approveLoan(id, remark);
    else await employeeService.rejectLoan(id, remark);
    load();
  };

  return (
    <Box>
      <Card sx={{ border: "1px solid", borderColor: "divider", mb: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Loan Management</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Employee approval forwards the loan to admin for final approval.
          </Typography>
          <TextField select label="Filter Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 240 }}>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Under Review (Admin)">Under Review (Admin)</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </CardContent>
      </Card>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Loan #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Account</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.loanNumber}</TableCell>
                  <TableCell>{loan.user?.name || loan.userId}</TableCell>
                  <TableCell>{loan.account?.accountNumber || loan.accountId}</TableCell>
                  <TableCell align="right">{Number(loan.amount).toLocaleString()}</TableCell>
                  <TableCell>{loan.status}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={remarks[loan.id] || ""}
                      onChange={(e) => setRemarks((s) => ({ ...s, [loan.id]: e.target.value }))}
                      placeholder="Add remarks"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => review(loan.id, "approve")}
                      disabled={String(loan.status).toLowerCase() !== "pending"}
                    >
                      Send To Admin
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => review(loan.id, "reject")}
                      disabled={String(loan.status).toLowerCase() !== "pending"}
                    >
                      Reject
                    </Button>
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
