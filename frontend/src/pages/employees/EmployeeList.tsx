import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { motion } from "framer-motion";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "Active" | "On Leave" | "Inactive";
}

const mockEmployees: Employee[] = [
  { id: 1, name: "John Smith", email: "john@bank.com", phone: "+880 1234567890", department: "Operations", position: "Manager", status: "Active" },
  { id: 2, name: "Sarah Johnson", email: "sarah@bank.com", phone: "+880 1234567891", department: "Customer Service", position: "Officer", status: "Active" },
  { id: 3, name: "Michael Brown", email: "michael@bank.com", phone: "+880 1234567892", department: "Finance", position: "Accountant", status: "On Leave" },
  { id: 4, name: "Emily Davis", email: "emily@bank.com", phone: "+880 1234567893", department: "IT", position: "Developer", status: "Active" },
  { id: 5, name: "David Wilson", email: "david@bank.com", phone: "+880 1234567894", department: "Operations", position: "Clerk", status: "Inactive" },
];

export default function EmployeeList() {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "success";
      case "On Leave": return "warning";
      case "Inactive": return "error";
      default: return "default";
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Employees</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bank employees and staff
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 600 }}>
          Add Employee
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Total Employees</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{employees.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Active</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                {employees.filter(e => e.status === "Active").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Departments</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>4</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Cards */}
      <Grid container spacing={3}>
        {employees.map((employee, index) => (
          <Grid item xs={12} sm={6} md={4} key={employee.id}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              sx={{ 
                border: "1px solid", 
                borderColor: "divider",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48, fontWeight: 600 }}>
                    {employee.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{employee.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{employee.position}</Typography>
                  </Box>
                  <Chip label={employee.status} size="small" color={getStatusColor(employee.status) as any} sx={{ fontWeight: 500 }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{employee.email}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{employee.phone}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip label={employee.department} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                  <Box>
                    <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Employee Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add New Employee</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField label="Full Name" fullWidth />
          <TextField label="Email" fullWidth />
          <TextField label="Phone" fullWidth />
          <TextField label="Department" fullWidth />
          <TextField label="Position" fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>Add Employee</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

