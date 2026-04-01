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
import { Ticket } from "../../types";

export default function EmployeeSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("");
  const [responses, setResponses] = useState<Record<number, string>>({});

  const load = async () => {
    const data = await employeeService.getTickets(status || undefined);
    setTickets(data);
  };

  useEffect(() => {
    load();
  }, [status]);

  const resolve = async (id: number) => {
    const response = responses[id] || "";
    if (!response.trim()) return;
    await employeeService.resolveTicket(id, response);
    load();
  };

  return (
    <Box>
      <Card sx={{ border: "1px solid", borderColor: "divider", mb: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Customer Support Tickets</Typography>
          <TextField select label="Status Filter" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
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
                <TableCell>Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Response</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.user?.name || ticket.userId}</TableCell>
                  <TableCell>{ticket.message}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={responses[ticket.id] || ticket.response || ""}
                      onChange={(e) => setResponses((s) => ({ ...s, [ticket.id]: e.target.value }))}
                      placeholder="Type response"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" onClick={() => resolve(ticket.id)}>Resolve</Button>
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
