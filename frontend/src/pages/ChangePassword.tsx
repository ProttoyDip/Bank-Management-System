import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Container,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SavingsIcon from "@mui/icons-material/Savings";
import PublicIcon from "@mui/icons-material/Public";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import StorefrontIcon from "@mui/icons-material/Storefront";
import api from "../services/api";

const floatingElements = [
  { id: 1, icon: MonetizationOnIcon, name: "coin", delay: 0, position: { top: "8%", left: "5%" } },
  { id: 2, icon: CreditCardIcon, name: "card", delay: 0.5, position: { top: "15%", right: "8%" } },
  { id: 3, icon: BusinessCenterIcon, name: "bank", delay: 1, position: { bottom: "30%", left: "8%" } },
  { id: 4, icon: SavingsIcon, name: "piggy", delay: 1.5, position: { bottom: "25%", right: "5%" } },
  { id: 5, icon: PublicIcon, name: "globe", delay: 2, position: { top: "40%", left: "3%" } },
  { id: 6, icon: AccountBalanceWalletIcon, name: "wallet", delay: 0.8, position: { top: "25%", right: "15%" } },
];

const mobileFloatingElements = [
  { id: 1, icon: MonetizationOnIcon, name: "coin", delay: 0, position: { top: "10%", left: "5%" } },
  { id: 2, icon: CreditCardIcon, name: "card", delay: 0.5, position: { top: "15%", right: "5%" } },
];

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const email = location.state?.email || "";
  const code = location.state?.code || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!email || !code) {
      navigate("/forgot-password");
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/users/change-password", {
        email,
        code,
        newPassword,
      });
      
      setSuccess(true);
      
      // Navigate to login after short delay
      setTimeout(() => {
        navigate("/login", { state: { passwordChanged: true } });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Services", href: "/#features" },
    { label: "Contact", href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith("/#")) {
      const sectionId = href.substring(2);
      Promise.resolve(navigate("/")).then(() => {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      });
    } else if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  const drawer = (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <AccountBalanceIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
            BankPro
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => { handleDrawerToggle(); navigate(item.href); }} sx={{ py: 1.5 }}>
              <ListItemText primary={item.label} primaryTypographyProps={{ sx: { color: "white" } }} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button variant="outlined" fullWidth onClick={() => navigate("/login")} sx={{
              borderColor: "rgba(255,255,255,0.3)",
              color: "white",
              "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}>
              Sign In
            </Button>
            <Button variant="contained" fullWidth onClick={() => navigate("/register")} sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}>
              Get Started
            </Button>
          </Box>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Bar */}
      <Box sx={{ 
        background: scrolled ? "rgba(15, 23, 42, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.3)" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/")}>
                <Box sx={{
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
                }}>
                  <AccountBalanceIcon sx={{ color: "white", fontSize: { xs: 22, md: 26 } }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1.2rem", md: "1.5rem" },
                    lineHeight: 1,
                  }}>
                    BankPro
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem", mt: -0.5 }}>
                    Secure Banking
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                {navItems.map((item, index) => (
                  <motion.div key={item.label} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Typography component="a" href={item.href} onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, item.href)} sx={{
                      color: "rgba(255,255,255,0.8)",
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "color 0.2s",
                      cursor: "pointer",
                      position: "relative",
                      "&:hover": { color: "white" },
                    }}>
                      {item.label}
                    </Typography>
                  </motion.div>
                ))}
              </Box>
            )}

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="text" onClick={() => navigate("/login")} sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
                  Sign In
                </Button>
                <Button variant="contained" onClick={() => navigate("/register")} sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}>
                  Get Started
                </Button>
              </Box>
            )}

            {isMobile && <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}><MenuIcon /></IconButton>}
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280, bgcolor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(20px)" },
      }}>
        {drawer}
      </Drawer>

      {/* Animated Background */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #06b6d4 100%)", zIndex: -1 }}>
        <Box className="grid-3d-login" sx={{ position: "absolute", bottom: 0, left: "-50%", width: "200%", height: "35%", opacity: 0.3 }} />
        
        {[...Array(15)].map((_, i) => (
          <motion.div key={`particle-${i}`} style={{
            position: "absolute",
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            left: `${Math.random() * 100}%`,
            borderRadius: "50%",
            background: `hsl(${180 + Math.random() * 60}, ${70 + Math.random() * 30}%, ${50 + Math.random() * 20}%)`,
            boxShadow: `0 0 10px currentColor`,
          }} animate={{ y: [0, window.innerHeight + 100], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], opacity: [0, 0.8, 0] }} transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 10, ease: "linear" }} />
        ))}

        {(isMobile ? mobileFloatingElements : floatingElements).map((element, index) => {
          const Icon = element.icon;
          return (
            <motion.div key={element.id} style={{ position: "absolute", ...element.position, display: isMobile ? (index < 2 ? "flex" : "none") : "flex" }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: element.delay, duration: 0.5 }}>
              <motion.div animate={{ y: [0, -15, 0], rotateX: [0, 5, 0], rotateY: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, delay: index * 0.5 }} style={{
                width: isMobile ? 50 : 70,
                height: isMobile ? 50 : 70,
                borderRadius: "16px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }} whileHover={{ scale: 1.2, rotate: 5 }}>
                <Icon sx={{ fontSize: isMobile ? 24 : 32, color: "rgba(255,255,255,0.8)" }} />
              </motion.div>
            </motion.div>
          );
        })}

        <Box sx={{ position: "absolute", top: 0, left: "25%", width: 300, height: 300, borderRadius: "50%", background: "rgba(59, 130, 246, 0.2)", filter: "blur(80px)", animation: "loginPulse 8s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", bottom: 0, right: "25%", width: 300, height: 300, borderRadius: "50%", background: "rgba(6, 182, 212, 0.2)", filter: "blur(80px)", animation: "loginPulse 8s ease-in-out infinite", animationDelay: "1s" }} />
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, borderRadius: "50%", background: "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))", filter: "blur(100px)" }} />
      </Box>

      {/* Form */}
      <Box sx={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: { xs: 12, md: 0 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: 450 }}>
          <Box sx={{ bgcolor: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "24px", p: { xs: 3, md: 5 }, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)" }}>
            {/* Back Button */}
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/verify-code", { state: { email } })} sx={{
              color: "rgba(255,255,255,0.6)",
              mb: 2,
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}>
              Back
            </Button>

            {isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "14px", background: "linear-gradient(135deg, #06b6d4 0%, #1976d2 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)" }}>
                  <LockIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
              </Box>
            )}

            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "white", mb: 1, fontSize: { xs: "1.75rem", md: "2rem" } }}>
                Create New Password
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Enter a new password for your account
              </Typography>
            </Box>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ marginBottom: 16, padding: "12px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", color: "#fca5a5", fontSize: "0.875rem" }}>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ marginBottom: 16, padding: "12px", background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "12px", color: "#86efac", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <CheckCircleIcon /> Password Changed Successfully!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 1, fontWeight: 500 }}>
                  New Password
                </Typography>
                <Box sx={{ position: "relative" }}>
                  <LockIcon sx={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 20 }} />
                  <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{
                    width: "100%",
                    padding: "14px 44px 14px 44px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "all 0.2s",
                  }} placeholder="Enter new password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                  }}>
                    {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                  </button>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 1, fontWeight: 500 }}>
                  Confirm Password
                </Typography>
                <Box sx={{ position: "relative" }}>
                  <LockIcon sx={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 20 }} />
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{
                    width: "100%",
                    padding: "14px 44px 14px 44px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "all 0.2s",
                  }} placeholder="Confirm new password" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                  }}>
                    {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                  </button>
                </Box>
              </Box>

              <motion.button type="submit" disabled={loading || !newPassword || !confirmPassword} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={{
                width: "100%",
                padding: "14px",
                background: newPassword && confirmPassword ? "linear-gradient(135deg, #06b6d4 0%, #1976d2 100%)" : "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "12px",
                border: "none",
                cursor: loading || !newPassword || !confirmPassword ? "not-allowed" : "pointer",
                opacity: loading || !newPassword || !confirmPassword ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: newPassword && confirmPassword ? "0 4px 14px rgba(25, 118, 210, 0.4)" : "none",
                transition: "all 0.2s",
              }}>
                {loading ? (
                  <Box style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                ) : (
                  "Change Password"
                )}
              </motion.button>
            </form>

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Remember your password?{" "}
                <Link component={RouterLink} to="/login" sx={{ color: "#06b6d4", textDecoration: "none", fontWeight: 600, "&:hover": { color: "#0891b2" } }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(15, 23, 42, 0.5), transparent)", pointerEvents: "none" }} />

      {/* ==================== FOOTER ==================== */}
      <Box
        component="footer"
        id="contact"
        sx={{
          bgcolor: "#0f172a",
          color: "white",
          py: { xs: 4, md: 6 },
          position: "relative",
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                  BankPro
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 3, lineHeight: 1.8 }}>
                Comprehensive Bank Management System for modern financial institutions. 
                Secure, efficient, and scalable banking solutions.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <IconButton sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "primary.main" } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "primary.main" } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "primary.main" } }}>
                  <LinkedInIcon />
                </IconButton>
                <IconButton sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "primary.main" } }}>
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    Home
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#about" onClick={(e) => { e.preventDefault(); navigate("/#about"); setTimeout(() => { document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    About
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    Services
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#contact" onClick={(e) => { e.preventDefault(); navigate("/#contact"); setTimeout(() => { document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    Contact
                  </Link>
                </ListItem>
              </List>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Services
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    Account Management
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    Loans
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    Investments
                  </Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>
                    Transfers
                  </Link>
                </ListItem>
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contact Us
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneAndroidIcon sx={{ color: "primary.main" }} />
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    01968776048
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LockIcon sx={{ color: "primary.main" }} />
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    support@bankpro.com
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StorefrontIcon sx={{ color: "primary.main" }} />
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                   Eastern Galaxy,﻿109, Katasur, Sher-e-Bangla Road, Mohammadpur Dhaka-1207 
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 6,
              pt: 3,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
              © {new Date().getFullYear()} BankPro. All rights reserved. | Secure Banking System
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

