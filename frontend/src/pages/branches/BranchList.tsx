import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { motion } from "framer-motion";

interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
}

const mockBranches: Branch[] = [
  { id: 1, name: "Main Branch", code: "BR001", address: "Dhaka, Bangladesh", phone: "+880 1234567890", email: "main@bank.com", status: "Active" },
  { id: 2, name: "Chittagong Branch", code: "BR002", address: "Chittagong, Bangladesh", phone: "+880 1234567891", email: "ctg@bank.com", status: "Active" },
  { id: 3, name: "Sylhet Branch", code: "BR003", address: "Sylhet, Bangladesh", phone: "+880 1234567892", email: "sylhet@bank.com", status: "Active" },
  { id: 4, name: "Khulna Branch", code: "BR004", address: "Khulna, Bangladesh", phone: "+880 1234567893", email: "khulna@bank.com", status: "Inactive" },
];

export default function BranchList() {
  const [branches] = useState<Branch[]>(mockBranches);
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Branches</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bank branches
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 600 }}>
          Add Branch
        </Button>
      </Box>

      <Grid container spacing={3}>
        {branches.map((branch, index) => (
          <Grid item xs={12} sm={6} md={4} key={branch.id}>
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{branch.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Code: {branch.code}</Typography>
                  </Box>
                  <Chip 
                    label={branch.status} 
                    size="small" 
                    color={branch.status === "Active" ? "success" : "error"}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{branch.address}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{branch.phone}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{branch.email}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Branch Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add New Branch</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField label="Branch Name" fullWidth />
          <TextField label="Branch Code" fullWidth />
          <TextField label="Address" fullWidth multiline rows={2} />
          <TextField label="Phone" fullWidth />
          <TextField label="Email" fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>Add Branch</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

