import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

interface InviteInfo {
  email: string;
  name?: string;
  department?: string;
  position?: string;
  expiresAt?: string;
}

const InviteAccept: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token) {
        setError("Invite token is missing. Please use the link from your email.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/invite/verify", { params: { token } });
        const data = response.data?.data;
        setInviteInfo(data);
        setName(data?.name || "");
      } catch (err: any) {
        setError(err?.response?.data?.message || "Invite is invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [token]);

  const handleSubmit = async () => {
    if (!inviteInfo) return;

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await api.post("/auth/invite/complete", {
        token,
        name: name.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      setSuccess("Invite accepted successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to accept invite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: "linear-gradient(135deg, #fef3c7 0%, #e0f2fe 100%)",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 520, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800} mb={1}>
            Accept Employee Invite
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Complete your profile to activate your employee account.
          </Typography>

          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {!loading && inviteInfo && !success && (
            <Stack spacing={2}>
              <Alert severity="info">
                Invited email: <strong>{inviteInfo.email}</strong>
              </Alert>

              <TextField
                label="Full Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
              />

              <TextField
                label="Phone (Optional)"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
              />

              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                fullWidth
              />

              <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Accepting..." : "Accept Invite"}
              </Button>

              <Button component={Link} to="/login" variant="text">
                Back to Login
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InviteAccept;
