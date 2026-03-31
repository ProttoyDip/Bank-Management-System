import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Button, Container, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Link, TextField, useMediaQuery, useTheme, InputAdornment } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PublicIcon from "@mui/icons-material/Public";
import SavingsIcon from "@mui/icons-material/Savings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import api from "../services/api";
import { AccountType, UserRole } from "../types";

const accountTypes = [
  { value: AccountType.SAVINGS, label: "Savings" },
  { value: AccountType.CURRENT, label: "Current" },
  { value: AccountType.FIXED_DEPOSIT, label: "Fixed Deposit" },
];

const roles = [
  { id: "customer", label: "Customer", icon: AccountCircleIcon },
];

const floatingElements = [
  { id: 1, icon: MonetizationOnIcon, delay: 0, position: { top: "8%", left: "8%" } },
  { id: 2, icon: CreditCardIcon, delay: 0.5, position: { top: "12%", right: "6%" } },
  { id: 3, icon: BusinessCenterIcon, delay: 1, position: { bottom: "35%", left: "6%" } },
  { id: 4, icon: SavingsIcon, delay: 1.5, position: { bottom: "28%", right: "8%" } },
  { id: 5, icon: PublicIcon, delay: 2, position: { top: "35%", left: "4%" } },
  { id: 6, icon: AccountBalanceWalletIcon, delay: 0.8, position: { top: "20%", right: "18%" } },
  { id: 7, icon: TrendingUpIcon, delay: 1.2, position: { bottom: "40%", right: "15%" } },
  { id: 8, icon: AccountBalanceIcon, delay: 0.3, position: { top: "45%", right: "5%" } },
];

const mobileFloatingElements = [
  { id: 1, icon: MonetizationOnIcon, delay: 0, position: { top: "8%", left: "5%" } },
  { id: 2, icon: CreditCardIcon, delay: 0.5, position: { top: "12%", right: "5%" } },
  { id: 3, icon: SavingsIcon, delay: 1, position: { bottom: "25%", left: "8%" } },
];

const inputSx = {
  "& .MuiOutlinedInput-root": { color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" }, "&.Mui-focused fieldset": { borderColor: "#06b6d4" } },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#06b6d4" },
};

export default function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", address: "", accountType: AccountType.SAVINGS, initialDeposit: "2000", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("customer");

  const getRoleFromId = (id: string): UserRole => {
    switch (id) {
      case "admin":
        return UserRole.ADMIN;
      case "employee":
        return UserRole.EMPLOYEE;
      default:
        return UserRole.CUSTOMER;
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (selectedRole !== "customer") {
      setError("Public registration is available for Customer accounts only.");
      setLoading(false);
      return;
    }
    
    // Validate password
    if (!form.password) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter");
      setLoading(false);
      return;
    }

    if (!/[a-z]/.test(form.password)) {
      setError("Password must contain at least one lowercase letter");
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number");
      setLoading(false);
      return;
    }

    if (!/[^A-Za-z0-9]/.test(form.password)) {
      setError("Password must contain at least one special character");
      setLoading(false);
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (Number(form.initialDeposit) < 0 || Number.isNaN(Number(form.initialDeposit))) {
      setError("Initial deposit must be a valid non-negative number");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Creating user with:", { name: form.firstName + " " + form.lastName, email: form.email, phone: form.phone || undefined, address: form.address || undefined, password: form.password, role: UserRole.CUSTOMER, accountType: form.accountType, initialDeposit: Number(form.initialDeposit || "2000") });
      await api.post("/auth/register", {
        name: form.firstName + " " + form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        password: form.password,
        role: UserRole.CUSTOMER,
        accountType: form.accountType,
        initialDeposit: Number(form.initialDeposit || "2000")
      });
      navigate("/login");
    } catch (err: any) { 
      console.error("Registration error:", err);
      const validationDetails = err.response?.data?.details;
      const detailMessage = Array.isArray(validationDetails) && validationDetails.length > 0
        ? validationDetails[0]?.message
        : null;
      setError(detailMessage || err.response?.data?.error || err.message || "Registration failed"); 
    } 
    finally { setLoading(false); }
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
      // Navigate to home page first, then scroll to section
      const sectionId = href.substring(2); // Remove "/#"
      Promise.resolve(navigate("/")).then(() => {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      });
    } else if (href.startsWith("#")) {
      // Scroll to section on current page
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Box sx={{ background: scrolled ? "rgba(15, 23, 42, 0.95)" : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none", boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.3)" : "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/")}>
                <Box sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: "12px", background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)" }}>
                  <AccountBalanceIcon sx={{ color: "white", fontSize: { xs: 22, md: 26 } }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: { xs: "1.2rem", md: "1.5rem" }, lineHeight: 1 }}>BankPro</Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem" }}>Secure Banking</Typography>
                </Box>
              </Box>
            </motion.div>
            {!isMobile && <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>{navItems.map((item, i) => (<motion.div key={item.label} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}><Typography component="a" href={item.href} onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, item.href)} sx={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontWeight: 500, cursor: "pointer", "&:hover": { color: "white" } }}>{item.label}</Typography></motion.div>))}</Box>}
            {!isMobile ? <Box sx={{ display: "flex", gap: 2 }}><Button variant="text" onClick={() => navigate("/login")} sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>Sign In</Button><Button variant="contained" onClick={() => navigate("/register")} sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}>Get Started</Button></Box> : <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "white" }}><MenuIcon /></IconButton>}
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 280, bgcolor: "rgba(15, 23, 42, 0.95)" } }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>BankPro</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><CloseIcon sx={{ color: "white" }} /></IconButton>
          </Box>
          <List>{navItems.map((item) => (<ListItem key={item.label} disablePadding><ListItemButton onClick={() => { setMobileOpen(false); navigate(item.href); }} sx={{ py: 1.5 }}><ListItemText primary={item.label} primaryTypographyProps={{ sx: { color: "white" } }} /></ListItemButton></ListItem>))}</List>
        </Box>
      </Drawer>

      {/* Background */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #06b6d4 100%)", zIndex: -1 }}>
        <Box sx={{ position: "absolute", bottom: 0, left: "-50%", width: "200%", height: "35%", opacity: 0.3, className: "grid-3d-login" }} />
        {[...Array(12)].map((_, i) => (<motion.div key={i} style={{ position: "absolute", width: Math.random() * 6 + 4 + "px", height: Math.random() * 6 + 4 + "px", left: Math.random() * 100 + "%", borderRadius: "50%", background: "hsl(" + (180 + Math.random() * 60) + ", 70%, 60%)" }} animate={{ y: [0, window.innerHeight + 100], opacity: [0, 0.8, 0] }} transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }} />))}
        {(isMobile ? mobileFloatingElements : floatingElements).map((el, i) => (<motion.div key={el.id} style={{ position: "absolute", ...el.position }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: el.delay }}><motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, delay: i * 0.5 }} style={{ width: isMobile ? 45 : 60, height: isMobile ? 45 : 60, borderRadius: 14, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><el.icon sx={{ fontSize: isMobile ? 20 : 26, color: "rgba(255,255,255,0.8)" }} /></motion.div></motion.div>))}
        <Box sx={{ position: "absolute", top: 0, left: "20%", width: 300, height: 300, borderRadius: "50%", background: "rgba(59, 130, 246, 0.15)", filter: "blur(80px)", animation: "loginPulse 8s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", bottom: 0, right: "20%", width: 300, height: 300, borderRadius: "50%", background: "rgba(6, 182, 212, 0.15)", filter: "blur(80px)", animation: "loginPulse 8s ease-in-out infinite", animationDelay: "1s" }} />
      </Box>

      {/* Registration Form */}
      <Box sx={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: { xs: 12, md: 0 }, pt: { xs: 14, sm: 11, md: 8 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 500 }}>
          <Box sx={{ bgcolor: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "24px", p: { xs: 3, md: 5 }, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)" }}>
            {isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #06b6d4 0%, #1976d2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AccountBalanceIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
              </Box>
            )}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "white", mb: 1, fontSize: { xs: "1.5rem", md: "1.75rem" } }}>Create Your Account</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Join thousands of happy customers banking with us</Typography>
            </Box>

            {/* Role Selection */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      borderRadius: "12px",
                      border: `2px solid ${
                        isSelected
                          ? "#06b6d4"
                          : "rgba(255,255,255,0.2)"
                      }`,
                      background: isSelected
                        ? "rgba(6, 182, 212, 0.2)"
                        : "rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 20,
                        color: isSelected ? "#06b6d4" : "rgba(255,255,255,0.6)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: isSelected ? "#06b6d4" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {role.label}
                    </span>
                  </motion.button>
                );
              })}
            </Box>

            <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 16, padding: 12, background: "rgba(239, 68, 68, 0.2)", borderRadius: 12, color: "#fca5a5", textAlign: "center", fontSize: "0.875rem" }}>{error}</motion.div>}</AnimatePresence>
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Personal Information</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
                <TextField label="First Name" required fullWidth value={form.firstName} onChange={setField("firstName")} sx={inputSx} />
                <TextField label="Last Name" required fullWidth value={form.lastName} onChange={setField("lastName")} sx={inputSx} />
                <TextField label="Phone" fullWidth value={form.phone} onChange={setField("phone")} sx={inputSx} />
                <TextField label="Email" type="email" required fullWidth value={form.email} onChange={setField("email")} sx={inputSx} />
                <TextField 
                  label="Password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  fullWidth 
                  value={form.password} 
                  onChange={setField("password")} 
                  sx={inputSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "rgba(255,255,255,0.6)" }}>
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField 
                  label="Confirm Password" 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  fullWidth 
                  value={form.confirmPassword} 
                  onChange={setField("confirmPassword")} 
                  sx={inputSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: "rgba(255,255,255,0.6)" }}>
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Box sx={{ gridColumn: "1 / -1" }}><TextField label="Address" fullWidth multiline rows={2} value={form.address} onChange={setField("address")} sx={inputSx} /></Box>
              </Box>
              <Box sx={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", mb: 3 }} />
              <Typography variant="subtitle2" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Account Preferences</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 4 }}>
                <TextField select label="Account Type" fullWidth value={form.accountType} onChange={setField("accountType")} SelectProps={{ native: true }} sx={inputSx}>{accountTypes.map((t) => <option key={t.value} value={t.value} style={{ color: "black" }}>{t.label}</option>)}</TextField>
                <TextField label="Initial Deposit (৳)" type="number" fullWidth value={form.initialDeposit} onChange={setField("initialDeposit")} sx={inputSx} />
              </Box>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #06b6d4 0%, #1976d2 100%)", color: "white", fontWeight: 600, fontSize: "1rem", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)", marginBottom: 16 }}>
                {loading ? <Box style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <><Typography>Create Account</Typography><ArrowForwardIcon sx={{ fontSize: 20 }} /></>}
              </motion.button>
              <Typography variant="body2" align="center" sx={{ color: "rgba(255,255,255,0.6)" }}>Already have an account? <Link component={RouterLink} to="/login" sx={{ color: "#06b6d4", textDecoration: "none", fontWeight: 600, "&:hover": { color: "#0891b2" } }}>Login here</Link></Typography>
            </Box>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.4)" }}><LockIcon sx={{ fontSize: 16 }} /><span style={{ fontSize: "0.75rem" }}>256-bit SSL</span></Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.4)" }}><SecurityIcon sx={{ fontSize: 16 }} /><span style={{ fontSize: "0.75rem" }}>Bank grade Security</span></Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.4)" }}><VerifiedUserIcon sx={{ fontSize: 16 }} /><span style={{ fontSize: "0.75rem" }}>FDIC Insured</span></Box>
            </motion.div>
          </Box>
        </motion.div>
      </Box>

      {/* Footer */}
      <Box component="footer" id="contact" sx={{ bgcolor: "#0f172a", color: "white", py: 6, position: "relative", zIndex: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 2fr" }, gap: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>BankPro</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>Comprehensive Bank Management System for modern financial institutions.</Typography>
              <Box sx={{ display: "flex", gap: 1 }}><IconButton sx={{ color: "rgba(255,255,255,0.7)" }}><FacebookIcon /></IconButton><IconButton sx={{ color: "rgba(255,255,255,0.7)" }}><TwitterIcon /></IconButton><IconButton sx={{ color: "rgba(255,255,255,0.7)" }}><LinkedInIcon /></IconButton><IconButton sx={{ color: "rgba(255,255,255,0.7)" }}><InstagramIcon /></IconButton></Box>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Quick Links</Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>Home</Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#about" onClick={(e) => { e.preventDefault(); navigate("/#about"); setTimeout(() => { document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>About</Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>Services</Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#contact" onClick={(e) => { e.preventDefault(); navigate("/#contact"); setTimeout(() => { document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>Contact</Link>
                </ListItem>
              </List>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Services</Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>Account Management</Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>Loans</Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>Investments</Link>
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <Link component="a" href="/#features" onClick={(e) => { e.preventDefault(); navigate("/#features"); setTimeout(() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }, 100); }} underline="none" sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer", "&:hover": { color: "primary.main" } }}>Transfers</Link>
                </ListItem>
              </List>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Contact Us</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><PhoneAndroidIcon sx={{ color: "primary.main" }} /><Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>01968776048</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><LockIcon sx={{ color: "primary.main" }} /><Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>support@bankpro.com</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><StorefrontIcon sx={{ color: "primary.main" }} /><Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>Eastern Galaxy,﻿109, Katasur, Sher-e-Bangla Road, Mohammadpur Dhaka-1207</Typography></Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}><Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>© {new Date().getFullYear()} BankPro. All rights reserved.</Typography></Box>
        </Container>
      </Box>
    </Box>
  );
}
