import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Link,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import api from "../services/api";
import { AccountType } from "../types";

const accountTypes = [
  { value: AccountType.SAVINGS, label: "Savings" },
  { value: AccountType.CURRENT, label: "Current" },
  { value: AccountType.FIXED_DEPOSIT, label: "Fixed Deposit" },
];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    accountType: AccountType.SAVINGS,
    initialDeposit: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1 — Create user
      const userRes = await api.post("/users", {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });

      const userId = userRes.data.data.id;

      // 2 — Create account
      await api.post("/accounts", {
        userId,
        type: form.accountType,
      });

      // 3 — Deposit initial amount (if provided)
      if (form.initialDeposit && Number(form.initialDeposit) > 0) {
        const accRes = await api.get(`/users/${userId}`);
        const accountId = accRes.data.data.accounts?.[0]?.id;
        if (accountId) {
          await api.post(`/accounts/${accountId}/deposit`, {
            amount: Number(form.initialDeposit),
          });
        }
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Typography variant="h4" align="center" sx={{ mb: 0.5 }}>
              Create Your Account
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of happy customers banking with us
            </Typography>

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* ── Personal Info ────────────────────── */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}>
                Personal Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="First Name" required fullWidth value={form.firstName} onChange={set("firstName")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Last Name" required fullWidth value={form.lastName} onChange={set("lastName")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone" fullWidth value={form.phone} onChange={set("phone")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Email" type="email" required fullWidth value={form.email} onChange={set("email")} />
                </Grid>
                <Grid size={12}>
                  <TextField label="Address" fullWidth multiline rows={2} value={form.address} onChange={set("address")} />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ── Account Preferences ──────────────── */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}>
                Account Preferences
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Account Type"
                    fullWidth
                    value={form.accountType}
                    onChange={set("accountType")}
                  >
                    {accountTypes.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Initial Deposit (৳)"
                    type="number"
                    fullWidth
                    value={form.initialDeposit}
                    onChange={set("initialDeposit")}
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </Grid>
              </Grid>

              {/* ── Submit ───────────────────────────── */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.4, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
              </Button>

              <Typography variant="body2" align="center">
                Already have an account?{" "}
                <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
                  Login here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
