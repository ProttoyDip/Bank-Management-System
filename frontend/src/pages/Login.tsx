import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const roles = ["Customer", "Employee", "Admin"];

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay — replace with real API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // After login, navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* ── Left — gradient panel ─────────────────────── */}
      <Grid
        size={{ xs: 0, md: 6 }}
        sx={{
          display: { xs: "none", md: "flex" },
          background: "linear-gradient(160deg, #1976d2 0%, #0d47a1 100%)",
          color: "#fff",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 6,
        }}
      >
        <AccountBalanceWalletIcon sx={{ fontSize: 72, mb: 3, opacity: 0.9 }} />
        <Typography variant="h3" sx={{ mb: 2, textAlign: "center" }}>
          Welcome Back
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 400, opacity: 0.85, textAlign: "center", maxWidth: 420 }}
        >
          Sign in to access your accounts, manage transactions, and stay in
          control of your finances.
        </Typography>
      </Grid>

      {/* ── Right — login form ────────────────────────── */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          px: 3,
          py: 6,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 440,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Mobile logo */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                justifyContent: "center",
                mb: 2,
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>

            <Typography variant="h5" align="center" sx={{ mb: 0.5 }}>
              Sign In
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Choose your role and enter credentials
            </Typography>

            {/* Role tabs */}
            <Tabs
              value={role}
              onChange={(_, v) => setRole(v)}
              variant="fullWidth"
              sx={{
                mb: 3,
                "& .MuiTab-root": { fontWeight: 600, fontSize: "0.85rem" },
              }}
            >
              {roles.map((r) => (
                <Tab key={r} label={r} />
              ))}
            </Tabs>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type={showPw ? "text" : "password"}
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(!showPw)} edge="end">
                        {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ textAlign: "right", mt: -1 }}>
                <Link href="#" underline="hover" variant="body2">
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.4 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Don't have an account?{" "}
              <Link component={RouterLink} to="/register" underline="hover" fontWeight={600}>
                Register here
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
