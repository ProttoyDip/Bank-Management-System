import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function EmployeeList() {
  const [dialogOpen, setDialogOpen] = useState(false);

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

      {/* Employee Cards */}
      <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 6 }}>
        <Typography color="text.secondary">
          No employees found. Employee management is not yet available.
        </Typography>
      </Card>

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

