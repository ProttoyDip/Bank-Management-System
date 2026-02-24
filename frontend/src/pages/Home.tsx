import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const features = [
  {
    icon: <SecurityIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "Secure Transactions",
    desc: "End-to-end encrypted transfers with multi-factor authentication keeping your money safe around the clock.",
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "24/7 Support",
    desc: "Our dedicated support team is available round the clock to help you with any questions or issues.",
  },
  {
    icon: <AccountBalanceIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "Easy Loans",
    desc: "Get pre-approved loan offers with competitive rates and a fully digital, paperless application process.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Hero Section ────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)",
          color: "#fff",
          py: { xs: 10, md: 14 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}
          >
            Banking for the Future
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 5, fontWeight: 400, opacity: 0.9, maxWidth: 560, mx: "auto" }}
          >
            Experience seamless, secure, and smart banking — crafted for the
            modern world.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: "#fff",
                color: "primary.main",
                px: 4,
                "&:hover": { bgcolor: "#e3f2fd" },
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                borderColor: "#fff",
                color: "#fff",
                px: 4,
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
              }}
            >
              Open Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Features Grid ───────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 1 }}
        >
          Why Choose Us
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 520, mx: "auto" }}
        >
          We combine cutting-edge technology with trusted banking practices to
          deliver a superior financial experience.
        </Typography>

        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid size={{ xs: 12, md: 4 }} key={f.title}>
              <Card
                sx={{
                  textAlign: "center",
                  height: "100%",
                  py: 2,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-6px)" },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Footer ──────────────────────────────────────── */}
      <Box
        component="footer"
        sx={{
          mt: "auto",
          py: 3,
          borderTop: "1px solid",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Bank Management System &mdash; CSE
          3104 Database Lab Project, AUST
        </Typography>
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 3 }}>
          <Link href="#" underline="hover" color="text.secondary" variant="body2">
            Contact
          </Link>
          <Link href="#" underline="hover" color="text.secondary" variant="body2">
            Privacy Policy
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
