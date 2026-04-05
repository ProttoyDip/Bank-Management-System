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
import { KycRequest } from "../../types";

export default function EmployeeKyc() {
  const [rows, setRows] = useState<KycRequest[]>([]);
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  const load = async () => {
    const data = await employeeService.getKyc(status);
    setRows(data);
  };

  useEffect(() => {
    load();
  }, [status]);

  const verify = async (id: number) => {
    await employeeService.verifyKyc(id, remarks[id] || "");
    load();
  };

  return (
    <Box>
      <Card sx={{ border: "1px solid", borderColor: "divider", mb: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>KYC Verification System</Typography>
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 240 }}>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Employee Approved">Employee Approved</MenuItem>
            <MenuItem value="Admin Verified">Admin Verified</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </CardContent>
      </Card>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Document</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.user?.name || row.userId}</TableCell>
                  <TableCell>{row.documentType || "-"}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={remarks[row.id] || ""}
                      onChange={(e) => setRemarks((s) => ({ ...s, [row.id]: e.target.value }))}
                      placeholder="Remarks"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => verify(row.id)}
                      disabled={row.status !== "Pending"}
                    >
                      Employee Approve
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
