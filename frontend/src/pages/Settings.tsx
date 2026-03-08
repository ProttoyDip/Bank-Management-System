import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import { motion } from "framer-motion";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { ApiResponse, User } from "../types";

export default function Settings() {
  const { user: authUser } = useAuth();
  const [snack, setSnack] = useState({ open: false, message: "" });
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (authUser) {
      api.get<ApiResponse<User>>(`/users/${authUser.id}`).then((res) => {
        const u = res.data.data;
        setProfile({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || "",
        });
      }).catch(() => {
        setProfile({
          name: authUser.name || "",
          email: authUser.email || "",
          phone: "",
          address: "",
        });
      });
    }
  }, [authUser]);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    transactions: true,
    loans: true,
    marketing: false,
  });

  const handleSave = () => {
    setSnack({ open: true, message: "Settings saved successfully!" });
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile Information</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: "2rem", fontWeight: 600 }}>
                  {profile.name?.charAt(0)?.toUpperCase() || authUser?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{profile.name || authUser?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{authUser?.role || "User"}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <TextField
                  label="Email"
                  fullWidth
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
                <TextField
                  label="Phone"
                  fullWidth
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </Box>

              <Button variant="contained" sx={{ mt: 3, fontWeight: 600 }} onClick={handleSave}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <LockIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Security</Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Two-Factor Authentication</Typography>
              <FormControlLabel
                control={<Switch />}
                label="Enable 2FA"
              />

              <Button variant="contained" sx={{ mt: 3, fontWeight: 600 }} onClick={handleSave}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Notification Channels</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} />}
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={<Switch checked={notifications.sms} onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })} />}
                      label="SMS Notifications"
                    />
                    <FormControlLabel
                      control={<Switch checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} />}
                      label="Push Notifications"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Notification Types</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={notifications.transactions} onChange={(e) => setNotifications({ ...notifications, transactions: e.target.checked })} />}
                      label="Transaction Alerts"
                    />
                    <FormControlLabel
                      control={<Switch checked={notifications.loans} onChange={(e) => setNotifications({ ...notifications, loans: e.target.checked })} />}
                      label="Loan Updates"
                    />
                    <FormControlLabel
                      control={<Switch checked={notifications.marketing} onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })} />}
                      label="Marketing & Promotions"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Button variant="contained" sx={{ mt: 3, fontWeight: 600 }} onClick={handleSave}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity="success" variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

