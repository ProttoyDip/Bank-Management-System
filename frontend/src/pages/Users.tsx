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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";
import type { User, ApiResponse, CreateUserPayload } from "../types";

const emptyForm: CreateUserPayload = { name: "", email: "", phone: "", address: "" };

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserPayload>(emptyForm);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const fetchUsers = async () => {
    try {
      const res = await api.get<ApiResponse<User[]>>("/users");
      setUsers(res.data.data);
    } catch {
      setSnack({ open: true, message: "Failed to load users", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, phone: user.phone ?? "", address: user.address ?? "" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, form);
        setSnack({ open: true, message: "User updated successfully", severity: "success" });
      } else {
        await api.post("/users", form);
        setSnack({ open: true, message: "User created successfully", severity: "success" });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Operation failed";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user? All their accounts will also be deleted.")) return;
    try {
      await api.delete(`/users/${id}`);
      setSnack({ open: true, message: "User deleted", severity: "success" });
      fetchUsers();
    } catch {
      setSnack({ open: true, message: "Failed to delete user", severity: "error" });
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bank customers
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ fontWeight: 600 }}>
          Add User
        </Button>
      </Box>

      {/* Users Table */}
      {!loading && users.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No users found. Click "Add User" to get started.</Typography>
        </Card>
      ) : (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Accounts</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "—"}</TableCell>
                    <TableCell>
                      <Chip label={user.accounts?.length ?? 0} size="small" color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => openEdit(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Name"
            required
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            required
            type="email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Address"
            fullWidth
            multiline
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.name || !form.email}>
            {editingUser ? "Save Changes" : "Create User"}
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

