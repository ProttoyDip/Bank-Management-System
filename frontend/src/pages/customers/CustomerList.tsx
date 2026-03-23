import { useEffect, useState, useMemo } from "react";
import { useSearch } from "../../context/SearchContext";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Grid,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import api from "../../services/api";
import type { User, ApiResponse, CreateUserPayload } from "../../types";
import { motion } from "framer-motion";

const emptyForm: CreateUserPayload = { name: "", email: "", phone: "", address: "" };

export default function CustomerList() {
  const [users, setUsers] = useState<User[]>([]);
  const { searchQuery } = useSearch();

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.address?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserPayload>(emptyForm);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const fetchUsers = async () => {
    try {
      const res = await api.get<ApiResponse<User[]>>("/users");
      setUsers(res.data.data);
    } catch {
      setSnack({ open: true, message: "Failed to load customers", severity: "error" });
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
        setSnack({ open: true, message: "Customer updated successfully", severity: "success" });
      } else {
        await api.post("/users", form);
        setSnack({ open: true, message: "Customer created successfully", severity: "success" });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Operation failed";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this customer? All their accounts will also be deleted.")) return;
    try {
      await api.delete(`/users/${id}`);
      setSnack({ open: true, message: "Customer deleted", severity: "success" });
      fetchUsers();
    } catch {
      setSnack({ open: true, message: "Failed to delete customer", severity: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: {xs: '100%', sm: 1200, lg: 1600}, mx: "auto", px: {xs: 2, sm: 0} }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 3, sm: 0 },
          px: {xs: 1, md: 0}
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bank customers
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ fontWeight: 600 }}>
          Add Customer
        </Button>
      </Box>

      {/* Customer Cards */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ border: "1px solid", borderColor: "divider", p: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">.</Typography>
                    <Typography variant="body2">.</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : users.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No customers found. Click "Add Customer" to get started.</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user, index) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
                }}
              >
                <CardContent sx={{ p: {xs: 2.5, md: 3} }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48, fontWeight: 600 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setViewUser(user)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {user.phone || "—"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Chip
                      label={`${user.accounts?.length || 0} Accounts`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => openEdit(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingUser ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Full Name"
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
            {editingUser ? "Save Changes" : "Add Customer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Customer Details</DialogTitle>
        <DialogContent>
          {viewUser && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, fontSize: "1.5rem", fontWeight: 600 }}>
                  {viewUser.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{viewUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Customer ID: {viewUser.id}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{viewUser.email}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PhoneIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body2">{viewUser.phone || "—"}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Address</Typography>
                    <Typography variant="body2">{viewUser.address || "—"}</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Accounts ({viewUser.accounts?.length || 0})</Typography>
                  {viewUser.accounts?.map((acc) => (
                    <Chip
                      key={acc.id}
                      label={`${acc.accountNumber} - ${acc.type}`}
                      size="small"
                      sx={{ mr: 1, mb: 1, fontWeight: 500 }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

