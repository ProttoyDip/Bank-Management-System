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
  const { user: authUser, login } = useAuth();
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: "success" | "error" }>({ open: false, message: "", severity: "success" });
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

  const [loading, setLoading] = useState(false);

  // Load notifications preferences from localStorage on mount/update
  useEffect(() => {
    if (authUser?.id) {
      try {
        const savedPrefs = localStorage.getItem(`notification_prefs_${authUser.id}`);
        if (savedPrefs) {
          setNotifications(JSON.parse(savedPrefs));
        }
      } catch (e) {
        console.warn("Failed to load notification prefs:", e);
      }
    }
  }, [authUser?.id]);

  const handleSaveProfile = async () => {
    // Validation
    if (!profile.name.trim()) {
      setSnack({ open: true, message: "Name is required", severity: "error" });
      return;
    }
    
    if (!authUser?.id) {
      setSnack({ open: true, message: "User not authenticated", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/users/${authUser.id}`, {
        name: profile.name.trim(),
        phone: profile.phone.trim() || null,
        address: profile.address.trim() || null,
      });

      const updatedData = response.data.data || {};
      
      // Update local profile safely
      setProfile({
        name: updatedData.name || profile.name,
        email: profile.email,
        phone: updatedData.phone || profile.phone || "",
        address: updatedData.address || profile.address || "",
      });

      // Sync with AuthContext only if name changed
      if (updatedData.name && updatedData.name !== authUser.name) {
        const token = localStorage.getItem("token") || "";
        login({
          ...authUser,
          name: updatedData.name
        }, token);
      }

      setSnack({ open: true, message: "Profile updated successfully!", severity: "success" });
    } catch (error: any) {
      console.error("Profile save error:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to save profile changes";
      setSnack({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    try {
      if (authUser?.id) {
        localStorage.setItem(`notification_prefs_${authUser.id}`, JSON.stringify(notifications));
      }
      setSnack({ open: true, message: "Notification preferences saved!", severity: "success" });
    } catch (error) {
      setSnack({ open: true, message: "Failed to save preferences", severity: "error" });
    }
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");


  const handleSaveSecurity = async () => {
    setLoading(true);

    // Handle password change
    if (currentPassword && newPassword && confirmPassword) {
      // Validate confirm matches new
      if (newPassword !== confirmPassword) {
        setSnack({ open: true, message: "New passwords do not match!", severity: "error" });
        setLoading(false);
        return;
      }

      // Validate length
      if (newPassword.length < 6) {
        setSnack({ open: true, message: "New password must be at least 6 characters", severity: "error" });
        setLoading(false);
        return;
      }

      try {
        console.log('Changing password for user:', authUser?.id);
        await api.post("/users/change-password-auth", {
          currentPassword,
          newPassword
        });
        console.log('Password change success');

        // Clear all fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setSnack({ 
          open: true, 
          message: "Password changed successfully! Please logout and login with new password.", 
          severity: "success" 
        });
      } catch (error: any) {
        console.error("Password change error:", error.response?.data || error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to change password";
        setSnack({ open: true, message: errorMsg, severity: "error" });
      }
    } else {
      setSnack({ open: true, message: "Please fill all password fields", severity: "error" });
    }

    setLoading(false);
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
                  disabled
                  value={profile.email}
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

              <Button 
                variant="contained" 
                sx={{ mt: 3, fontWeight: 600 }} 
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
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
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                />
              <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </Box>

              <Button 
                variant="contained" 
                sx={{ mt: 3, fontWeight: 600 }} 
                onClick={handleSaveSecurity}
              disabled={loading}
              >
"Change Password"
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

              <Button variant="contained" sx={{ mt: 3, fontWeight: 600 }} onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity || "success"} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

