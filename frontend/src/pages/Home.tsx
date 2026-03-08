import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Link,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Rating,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import SavingsIcon from "@mui/icons-material/Savings";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PaymentIcon from "@mui/icons-material/Payment";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import BoltIcon from "@mui/icons-material/Bolt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

// Bank Management System Themed Features
const features = [
  {
    icon: <AccountBalanceIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "Account Management",
    desc: "Comprehensive account management system with real-time balance tracking, transaction history, and multi-currency support. Manage savings, checking, and investment accounts from a single unified dashboard.",
  },
  {
    icon: <PaymentIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "Secure Transactions",
    desc: "End-to-end encrypted transactions with multi-factor authentication, biometric verification, and real-time fraud detection. Every transfer is protected by bank-grade security protocols.",
  },
  {
    icon: <BusinessCenterIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "Loan Management",
    desc: "Streamlined loan processing from application to approval. Calculate EMI, track repayment schedules, manage collateral, and access competitive interest rates with instant pre-approval.",
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "Investment Portfolio",
    desc: "Diversify your wealth with our comprehensive investment tools. Access stocks, bonds, mutual funds, and fixed deposits with real-time market analytics and expert financial guidance.",
  },
  {
    icon: <CloudSyncIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "Core Banking Integration",
    desc: "Seamlessly integrated core banking infrastructure connecting all departments—tellers, ATMs, online banking, and mobile apps—for unified customer experience and real-time data synchronization.",
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 48, color: "primary.main" }} />,
    title: "24/7 Customer Support",
    desc: "Our dedicated relationship managers and AI-powered chatbots are available round-the-clock to assist with inquiries, resolve issues, and provide personalized banking solutions.",
  },
];

// How It Works - Bank System Process
const howItWorks = [
  {
    step: 1,
    icon: <AccountCircleIcon sx={{ fontSize: 36, color: "white" }} />,
    title: "Create Your Account",
    desc: "Register with your basic details and complete secure identity verification. Our automated KYC process ensures quick account activation within minutes.",
  },
  {
    step: 2,
    icon: <LockIcon sx={{ fontSize: 36, color: "white" }} />,
    title: "Secure Authentication",
    desc: "Set up multi-factor authentication including biometric login, OTP verification, and security questions. Your account is protected by military-grade encryption.",
  },
  {
    step: 3,
    icon: <BoltIcon sx={{ fontSize: 36, color: "white" }} />,
    title: "Access Full Banking",
    desc: "Explore our complete suite of banking services—transfers, loans, investments, and more. Experience seamless banking with real-time updates and notifications.",
  },
];

// Enhanced Stats
const stats = [
  { icon: <PeopleIcon sx={{ fontSize: 40, color: "white" }} />, value: "2.5M+", label: "Active Customers" },
  { icon: <AccountBalanceIcon sx={{ fontSize: 40, color: "white" }} />, value: "150+", label: "Bank Branches" },
  { icon: <TrendingUpIcon sx={{ fontSize: 40, color: "white" }} />, value: "$50B+", label: "Transactions Yearly" },
  { icon: <VerifiedUserIcon sx={{ fontSize: 40, color: "white" }} />, value: "99.99%", label: "System Uptime" },
  { icon: <SecurityIcon sx={{ fontSize: 40, color: "white" }} />, value: "256-bit", label: "Encryption" },
  { icon: <SupportAgentIcon sx={{ fontSize: 40, color: "white" }} />, value: "24/7", label: "Customer Service" },
];

// Testimonials
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Owner",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    text: "BankPro has revolutionized how I manage my business finances. The comprehensive loan management system helped me expand my operations with competitive rates.",
  },
  {
    name: "Michael Chen",
    role: "Investment Banker",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "The investment portfolio tools are exceptional. Real-time analytics and expert guidance have significantly improved my returns. Best banking experience ever.",
  },
  {
    name: "Emily Rodriguez",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    text: "I love the seamless mobile banking experience. Transaction tracking, bill payments, and fund transfers happen instantly. The security features give me complete peace of mind.",
  },
];

// Banking Features Data
const bankingFeatures = [
  {
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    title: "Digital Banking",
    desc: "Access your accounts 24/7 from anywhere in the world with our secure online banking platform. Check balances, transfer funds, and pay bills instantly.",
  },
  {
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    title: "Mobile Payments",
    desc: "Send and receive money instantly using our mobile app. NFC payments, QR code scanning, and peer-to-peer transfers at your fingertips.",
  },
  {
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
    title: "Financial Analytics",
    desc: "Get detailed insights into your spending patterns with comprehensive financial reports, charts, and budget tracking tools.",
  },
  {
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop",
    title: "Investment Solutions",
    desc: "Grow your wealth with our expert investment tools, personalized portfolios, and market analysis from financial professionals.",
  },
];

// ==================== 3D BANKING ELEMENTS ====================

// Floating Credit Card - BankPro Card
const FloatingCreditCard = () => (
  <Box
    className="float-3d"
    sx={{ position: "absolute", top: "12%", left: "3%", zIndex: 1 }}
  >
    <Box className="card-3d">
      <Box className="card-3d-front">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>BankPro</Typography>
          <CreditCardIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box className="card-chip" />
        <Typography className="card-number" sx={{ letterSpacing: 3 }}>•••• •••• •••• 7824</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>CARD HOLDER</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>ALEX SMITH</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>EXPIRES</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>09/29</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

// Second Credit Card
const FloatingCreditCard2 = () => (
  <Box
    className="float-3d-reverse"
    sx={{ position: "absolute", top: "20%", right: "3%", zIndex: 1 }}
  >
    <Box className="card-3d">
      <Box className="card-3d-front" sx={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>BankPro Gold</Typography>
          <CreditCardIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box className="card-chip" sx={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }} />
        <Typography className="card-number" sx={{ letterSpacing: 3 }}>•••• •••• •••• 4521</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>CARD HOLDER</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>JANE DOE</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>EXPIRES</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>11/28</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

// Spinning Coins
const FloatingCoin = () => (
  <Box
    className="float-3d-slow"
    sx={{ position: "absolute", top: "30%", left: "15%", zIndex: 1 }}
  >
    <Box className="coin-3d">
      <Box className="coin-face coin-front">$</Box>
      <Box className="coin-face coin-back">$</Box>
    </Box>
  </Box>
);

const FloatingCoin2 = () => (
  <Box
    className="float-3d"
    sx={{ position: "absolute", bottom: "25%", right: "10%", zIndex: 1 }}
  >
    <Box className="coin-3d" style={{ width: 60, height: 60 }}>
      <Box className="coin-face coin-front" style={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
      <Box className="coin-face coin-back" style={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
    </Box>
  </Box>
);

// Piggy Bank
const FloatingPiggyBank = () => (
  <Box
    className="float-3d-reverse"
    sx={{ position: "absolute", bottom: "18%", left: "8%", zIndex: 1 }}
  >
    <Box className="piggy-3d">
      <Box className="piggy-body" />
      <Box className="piggy-snout" />
      <Box className="piggy-ear" />
      <Box className="piggy-ear" />
      <Box className="piggy-eye" />
      <Box className="piggy-eye" />
    </Box>
  </Box>
);

// Globe - International Banking
const FloatingGlobe = () => (
  <Box
    className="float-3d"
    sx={{ position: "absolute", top: "8%", right: "15%", zIndex: 1 }}
  >
    <Box className="globe-3d" />
  </Box>
);

// ATM Machine
const FloatingATM = () => (
  <Box
    className="float-3d-slow"
    sx={{ position: "absolute", top: "35%", left: "5%", zIndex: 0, opacity: 0.7 }}
  >
    <Box className="atm-machine">
      <Box className="atm-screen" />
      <Box className="atm-keypad">
        <Box className="atm-key" />
        <Box className="atm-key" />
        <Box className="atm-key" />
        <Box className="atm-key" />
      </Box>
      <Box className="atm-card-slot" />
      <Box className="atm-cash-slot" />
    </Box>
  </Box>
);

// Mobile Phone - Mobile Banking
const FloatingPhone = () => (
  <Box
    className="float-3d-reverse"
    sx={{ position: "absolute", bottom: "30%", right: "5%", zIndex: 1, opacity: 0.8 }}
  >
    <Box className="mobile-bank">
      <Box className="mobile-screen">
        <Box className="mobile-notch" />
        <Box className="mobile-app" />
        <Box className="mobile-app" />
        <Box className="mobile-app" />
      </Box>
    </Box>
  </Box>
);

// Security Shield
const FloatingShield = () => (
  <Box
    className="float-3d"
    sx={{ position: "absolute", top: "45%", left: "12%", zIndex: 0, opacity: 0.6 }}
  >
    <Box className="shield-3d">
      <Box className="shield-icon">🔒</Box>
    </Box>
  </Box>
);

// Bank Building
const FloatingBank = () => (
  <Box
    className="float-3d-slow"
    sx={{ position: "absolute", top: "15%", right: "25%", zIndex: 0, opacity: 0.7 }}
  >
    <Box className="bank-3d">
      <Box className="bank-building">
        <Box className="bank-front" />
        <Box className="bank-side" />
        <Box className="bank-top" />
      </Box>
    </Box>
  </Box>
);

// Document/Contract
const FloatingDocument = () => (
  <Box
    className="float-3d"
    sx={{ position: "absolute", bottom: "35%", left: "18%", zIndex: 0, opacity: 0.6 }}
  >
    <Box className="document-3d">
      <Box className="doc-line" />
      <Box className="doc-line" />
      <Box className="doc-line" />
      <Box className="doc-line" />
      <Box className="doc-stamp">✓</Box>
    </Box>
  </Box>
);

// Money Stack
const FloatingMoneyStack = () => (
  <Box
    className="float-3d-reverse"
    sx={{ position: "absolute", top: "25%", left: "8%", zIndex: 0, opacity: 0.5 }}
  >
    <Box className="money-stack">
      <Box className="bill" />
      <Box className="bill" />
      <Box className="bill" />
    </Box>
  </Box>
);

// Chart/Graph
const FloatingChart = () => (
  <Box
    className="float-3d"
    sx={{ position: "absolute", bottom: "22%", right: "20%", zIndex: 0, opacity: 0.6 }}
  >
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
      <Box className="chart-3d-bar" sx={{ height: 40 }} />
      <Box className="chart-3d-bar" sx={{ height: 60 }} />
      <Box className="chart-3d-bar" sx={{ height: 80 }} />
      <Box className="chart-3d-bar" sx={{ height: 100 }} />
    </Box>
  </Box>
);

// Geometric Shapes
const FloatingCube = () => (
  <Box
    className="float-3d-slow"
    sx={{ position: "absolute", top: "40%", left: "3%", zIndex: 0, opacity: 0.5 }}
  >
    <Box className="shape-cube">
      <Box className="cube-face cube-front" />
      <Box className="cube-face cube-back" />
      <Box className="cube-face cube-right" />
      <Box className="cube-face cube-left" />
      <Box className="cube-face cube-top" />
      <Box className="cube-face cube-bottom" />
    </Box>
  </Box>
);

const FloatingSphere = () => (
  <Box
    className="float-3d-reverse"
    sx={{ position: "absolute", top: "50%", right: "3%", zIndex: 0, opacity: 0.5 }}
  >
    <Box className="shape-sphere" />
  </Box>
);

const FloatingPyramid = () => (
  <Box
    className="float-3d"
    sx={{ position: "absolute", bottom: "15%", right: "8%", zIndex: 0, opacity: 0.5 }}
  >
    <Box className="shape-pyramid" />
  </Box>
);

// Arrow/Transfer Animation
const FloatingArrow = () => (
  <Box
    className="float-3d-slow"
    sx={{ position: "absolute", top: "55%", left: "20%", zIndex: 0, opacity: 0.5 }}
  >
    <Box className="transfer-arrow">
      <ArrowForwardIcon sx={{ fontSize: 40, color: "#22c55e" }} />
    </Box>
  </Box>
);

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({} as Record<string, boolean>);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const statKey = entry.target.getAttribute("data-stat");
            if (statKey) {
              setAnimatedStats((prev) => ({ ...prev, [statKey]: true }));
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".stat-item").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  const drawer = (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        {/* Logo - Same as Login Page */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
          }}
          onClick={() => {
            handleDrawerToggle();
            navigate("/");
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
            }}
          >
            <AccountBalanceIcon sx={{ color: "white", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.2rem",
                lineHeight: 1,
              }}
            >
              BankPro
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.65rem",
                mt: -0.5,
              }}
            >
              Secure Banking
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => {
                handleDrawerToggle();
                document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/login")}
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            >
              Login
            </Button>
            <Button variant="contained" fullWidth onClick={() => navigate("/register")}>
              Open Account
            </Button>
          </Box>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Navigation Bar ───────────────────────────────── */}
      <Box
        className={`navbar-container ${scrolled ? "scrolled" : ""}`}
        sx={{
          background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
            }}
          >
            {/* Logo - Same as Login Page */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <Box
                sx={{
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)",
                }}
              >
                <AccountBalanceIcon sx={{ color: "white", fontSize: { xs: 22, md: 26 } }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: scrolled
                      ? "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)"
                      : "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1.2rem", md: "1.5rem" },
                    lineHeight: 1,
                  }}
                >
                  BankPro
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: scrolled ? "text.secondary" : "rgba(255,255,255,0.6)",
                    fontSize: "0.65rem",
                    mt: -0.5,
                  }}
                >
                  Secure Banking
                </Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    underline="none"
                    sx={{
                      color: scrolled ? "text.primary" : "white",
                      fontWeight: 500,
                      transition: "color 0.2s",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Box>
            )}

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant={scrolled ? "outlined" : "text"}
                  onClick={() => navigate("/login")}
                  sx={{
                    borderColor: scrolled ? "primary.main" : "white",
                    color: scrolled ? "primary.main" : "white",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: scrolled ? "transparent" : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/register")}
                  className="btn-3d"
                  sx={{
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                  }}
                >
                  Open Account
                </Button>
              </Box>
            )}

            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ color: scrolled ? "text.primary" : "white" }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280 },
        }}
      >
        {drawer}
      </Drawer>

      {/* ── Hero Section with Bank System 3D Elements ─────────────────────── */}
      <Box
        id="home"
        className="hero-section scene-3d"
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0d47a1 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 8s ease infinite",
          color: "#fff",
          py: { xs: 12, md: 18 },
          pt: { xs: 16, md: 20 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(25, 118, 210, 0.5) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(250, 204, 21, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 60% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 90% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 30%)
            `,
            pointerEvents: "none",
          },
        }}
      >
        {/* 3D Floating Bank System Elements */}
        {!isMobile && (
          <>
            <FloatingCreditCard />
            <FloatingCreditCard2 />
            <FloatingCoin />
            <FloatingCoin2 />
            <FloatingPiggyBank />
            <FloatingGlobe />
            <FloatingATM />
            <FloatingPhone />
            <FloatingShield />
            <FloatingBank />
            <FloatingDocument />
            <FloatingMoneyStack />
            <FloatingChart />
            <FloatingCube />
            <FloatingSphere />
            <FloatingPyramid />
            <FloatingArrow />
            
            {/* 3D Grid Floor */}
            <Box className="grid-3d" sx={{ opacity: 0.3 }} />
          </>
        )}

        {/* Particles */}
        {!isMobile && (
          <>
            <Box className="particle particle-1" sx={{ left: "10%", animationDelay: "0s" }} />
            <Box className="particle particle-2" sx={{ left: "20%", animationDelay: "2s" }} />
            <Box className="particle particle-3" sx={{ left: "30%", animationDelay: "4s" }} />
            <Box className="particle particle-4" sx={{ left: "40%", animationDelay: "6s" }} />
            <Box className="particle particle-5" sx={{ left: "50%", animationDelay: "8s" }} />
            <Box className="particle particle-1" sx={{ left: "60%", animationDelay: "1s" }} />
            <Box className="particle particle-2" sx={{ left: "70%", animationDelay: "3s" }} />
            <Box className="particle particle-3" sx={{ left: "80%", animationDelay: "5s" }} />
            <Box className="particle particle-4" sx={{ left: "90%", animationDelay: "7s" }} />
          </>
        )}

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h3"
            className="animate-fadeInUp text-3d-light"
            sx={{
              mb: 2,
              fontSize: { xs: "2.2rem", md: "3.5rem" },
              fontWeight: 800,
              opacity: 0,
              animationDelay: "200ms",
              lineHeight: 1.2,
            }}
          >
            Next-Gen{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #facc15 0%, #fbbf24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Bank Management
            </Box>
            <br />System
          </Typography>
          <Typography
            variant="h6"
            className="animate-fadeInUp hero-subtitle"
            sx={{
              mb: 5,
              fontWeight: 400,
              opacity: 0,
              maxWidth: 600,
              mx: "auto",
              animationDelay: "400ms",
              fontSize: { xs: "1rem", md: "1.125rem" },
              lineHeight: 1.7,
              position: "relative",
              "& .highlight": {
                color: "#facc15",
                fontWeight: 600,
                display: "inline-block",
                animation: "pulseGlow 2s ease-in-out infinite",
                px: 1,
              },
            }}
          >
            Experience the future of banking with our comprehensive{" "}
            <Box component="span" className="highlight">
              management system
            </Box>. 
            From account management to loan processing, security to analytics — 
            everything you need to transform your banking operations efficiently.
          </Typography>
          <Box
            className="animate-fadeInUp"
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
              opacity: 0,
              animationDelay: "600ms",
            }}
          >
            <Button
              variant="contained"
              size="large"
              className="btn-3d"
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: "#fff",
                color: "primary.main",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                "&:hover": { bgcolor: "#e3f2fd", transform: "translateY(-2px)" },
                transition: "all 0.3s ease",
              }}
            >
              Login to System
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                borderColor: "#fff",
                color: "#fff",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: "rgba(255,255,255,0.12)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Create Account
            </Button>
          </Box>

          {/* 3D Floating Cards for Mobile */}
          {isMobile && (
            <Box sx={{ mt: 6 }}>
              <Box
                className="card-3d"
                sx={{ maxWidth: 280, mx: "auto", mb: 3 }}
              >
                <Box className="card-3d-front" sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>BankPro</Typography>
                    <CreditCardIcon />
                  </Box>
                  <Box className="card-chip" sx={{ width: 40, height: 30, mb: 2 }} />
                  <Typography sx={{ fontFamily: "monospace", letterSpacing: 2 }}>•••• •••• •••• 7824</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Container>
        
        {/* Wave SVG */}
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            left: 0,
            width: "100%",
            overflow: "hidden",
            lineHeight: 0,
          }}
        >
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ width: "200%", height: "100px", animation: "waveMove 25s linear infinite" }}
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff" fillOpacity="0.1"/>
          </svg>
        </Box>
      </Box>

      {/* ── Enhanced Stats Section ──────────────────────────────── */}
      <Box 
        className="scene-3d"
        sx={{ bgcolor: "primary.main", py: { xs: 5, md: 8 }, position: "relative", overflow: "hidden" }}
      >
        {/* 3D decorative elements */}
        <Box className="float-3d-slow" sx={{ position: "absolute", top: -30, left: "10%", opacity: 0.3 }}>
          <Box className="shape-sphere" sx={{ width: 50, height: 50 }} />
        </Box>
        <Box className="float-3d-reverse" sx={{ position: "absolute", bottom: -20, right: "15%", opacity: 0.3 }}>
          <Box className="shape-cube" sx={{ width: 50, height: 50 }} />
        </Box>
        <Box className="float-3d" sx={{ position: "absolute", top: "30%", right: "25%", opacity: 0.2 }}>
          <Box className="coin-3d" sx={{ width: 40, height: 40 }}>
            <Box className="coin-face coin-front" style={{ width: 40, height: 40, fontSize: "1rem" }}>$</Box>
            <Box className="coin-face coin-back" style={{ width: 40, height: 40, fontSize: "1rem" }}>$</Box>
          </Box>
        </Box>
        
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 6, md: 4, lg: 2 }} key={stat.label}>
                <Box
                  className="stat-item tilt-card"
                  data-stat={stat.label}
                  sx={{
                    textAlign: "center",
                    opacity: animatedStats[stat.label] ? 1 : 0,
                    transform: animatedStats[stat.label] ? "scale(1)" : "scale(0.8)",
                    transition: "all 0.6s ease",
                    transitionDelay: `${index * 100}ms`,
                    cursor: "default",
                    p: 2,
                  }}
                >
                  <Box
                    className="glow-3d"
                    sx={{
                      display: "inline-flex",
                      p: 1.5,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.2)",
                      mb: 1,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h4"
                    className="count-3d"
                    sx={{ fontWeight: 800, color: "white", mb: 0.5 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── About Section ───────────────────────────────── */}
      <Box id="about" className="about-section scene-3d" sx={{ py: { xs: 8, md: 12 }, position: "relative", overflow: "hidden" }}>
        {/* Animated gradient background */}
        <Box
          className="about-bg-animated"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0fdfa 100%)",
            backgroundSize: "400% 400%",
            animation: "aboutGradientShift 10s ease infinite",
            zIndex: 0,
          }}
        />
        
        {/* Floating decorative elements */}
        <Box className="float-3d" sx={{ position: "absolute", top: "10%", left: "5%", opacity: 0.2, zIndex: 0 }}>
          <Box className="coin-3d" sx={{ width: 60, height: 60 }}>
            <Box className="coin-face coin-front" sx={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
            <Box className="coin-face coin-back" sx={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
          </Box>
        </Box>
        <Box className="float-3d-reverse" sx={{ position: "absolute", top: "15%", right: "8%", opacity: 0.2, zIndex: 0 }}>
          <Box className="shape-sphere" sx={{ width: 50, height: 50 }} />
        </Box>
        <Box className="float-3d-slow" sx={{ position: "absolute", bottom: "20%", left: "10%", opacity: 0.15, zIndex: 0 }}>
          <Box className="shape-cube" sx={{ width: 40, height: 40 }} />
        </Box>
        <Box className="float-3d" sx={{ position: "absolute", bottom: "15%", right: "15%", opacity: 0.2, zIndex: 0 }}>
          <Box className="globe-3d" sx={{ width: 50, height: 50 }} />
        </Box>
        
        {/* Decorative circles */}
        <Box
          className="decorative-circle-1"
          sx={{
            position: "absolute",
            top: "5%",
            right: "20%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, transparent 70%)",
            animation: "pulseGlow 4s ease-in-out infinite",
            zIndex: 0,
          }}
        />
        <Box
          className="decorative-circle-2"
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
            animation: "pulseGlow 4s ease-in-out infinite 2s",
            zIndex: 0,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="overline"
                sx={{ 
                  color: "primary.main", 
                  fontWeight: 600, 
                  letterSpacing: 2,
                  display: "block",
                  mb: 1,
                }}
              >
                About BankPro System
              </Typography>
              <Typography
                variant="h3"
                className="about-title-animate"
                sx={{ 
                  fontWeight: 800, 
                  mb: 3, 
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 50%, #1976d2 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientShift 4s linear infinite",
                }}
              >
                Comprehensive{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #facc15 0%, #fbbf24 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Banking Solutions
                </Box>
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8, fontSize: "1rem" }}>
                BankPro is a state-of-the-art{" "}
                <Box component="span" sx={{ fontWeight: 600, color: "primary.main" }}>Bank Management System</Box>{" "}
                designed to streamline all aspects of modern banking operations. From customer account management 
                to transaction processing, loan management, and comprehensive financial reporting — our platform 
                provides a centralized, integrated solution for efficient banking operations.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8, fontSize: "1rem" }}>
                Our system integrates seamlessly with core banking infrastructure, enabling real-time 
                synchronization across all touchpoints — branch tellers, ATMs, online banking, and mobile 
                applications. This ensures consistent customer experience while maintaining data integrity 
                and operational efficiency.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1rem" }}>
                With advanced security features including 256-bit encryption, multi-factor authentication, 
                biometric verification, and real-time fraud detection, we ensure your financial data remains 
                protected. Our intuitive dashboards and analytics tools empower both customers and administrators 
                with actionable insights for better financial decision-making.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                      animation: "pulseGlow 2s ease-in-out infinite",
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>2.5M+ Active Users</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      animation: "pulseGlow 2s ease-in-out infinite 0.5s",
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Bank-Grade Security</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                      animation: "pulseGlow 2s ease-in-out infinite 1s",
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>99.99% Uptime</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                className="gradient-border-3d"
                sx={{
                  position: "relative",
                  p: 4,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  minHeight: 350,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Card
                      className="feature-card tilt-card about-card-animate"
                      sx={{
                        p: 2.5,
                        textAlign: "center",
                        bgcolor: "white",
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.1), transparent)",
                          animation: "shimmer 3s infinite",
                        },
                      }}
                    >
                      <Box className="icon-float-3d" sx={{ mx: "auto", mb: 1.5 }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 32, color: "primary.main" }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>Account Management</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Complete account lifecycle management with real-time updates
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card
                      className="feature-card tilt-card about-card-animate"
                      sx={{
                        p: 2.5,
                        textAlign: "center",
                        bgcolor: "white",
                        border: "1px solid",
                        borderColor: "divider",
                        mt: 4,
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.1), transparent)",
                          animation: "shimmer 3s infinite 1s",
                        },
                      }}
                    >
                      <Box className="icon-float-3d" sx={{ mx: "auto", mb: 1.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 32, color: "success.main" }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>Loan Processing</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        End-to-end loan management from application to approval
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card
                      className="feature-card tilt-card about-card-animate"
                      sx={{
                        p: 2.5,
                        textAlign: "center",
                        bgcolor: "white",
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent)",
                          animation: "shimmer 3s infinite 0.5s",
                        },
                      }}
                    >
                      <Box className="icon-float-3d" sx={{ mx: "auto", mb: 1.5 }}>
                        <SecurityIcon sx={{ fontSize: 32, color: "warning.main" }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>Fraud Protection</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        AI-powered security monitoring and threat detection
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card
                      className="feature-card tilt-card about-card-animate"
                      sx={{
                        p: 2.5,
                        textAlign: "center",
                        bgcolor: "white",
                        border: "1px solid",
                        borderColor: "divider",
                        mt: 4,
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent)",
                          animation: "shimmer 3s infinite 1.5s",
                        },
                      }}
                    >
                      <Box className="icon-float-3d" sx={{ mx: "auto", mb: 1.5 }}>
                        <PeopleIcon sx={{ fontSize: 32, color: "info.main" }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>Customer Portal</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Self-service banking with personalized dashboard access
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Features Grid ───────────────────────────────── */}
      <Box id="features" className="scene-3d" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper", position: "relative", overflow: "hidden" }}>
        {/* Blue gradient background overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)",
            zIndex: 0,
          }}
        />
        {/* Blue decorative elements */}
        <Box className="float-3d" sx={{ position: "absolute", top: 50, left: "5%", opacity: 0.3 }}>
          <Box className="shape-pyramid" sx={{ 
            background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
            boxShadow: "0 0 30px rgba(25, 118, 210, 0.4)"
          }} />
        </Box>
        <Box className="float-3d-reverse" sx={{ position: "absolute", top: 100, right: "8%", opacity: 0.3 }}>
          <Box className="ring-3d" sx={{ 
            border: "4px solid #1976d2",
            boxShadow: "0 0 20px rgba(25, 118, 210, 0.3)"
          }} />
        </Box>
        <Box className="float-3d-slow" sx={{ position: "absolute", bottom: 50, left: "15%", opacity: 0.25 }}>
          <Box className="globe-3d" sx={{ width: 60, height: 60, background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)" }} />
        </Box>
        <Box className="float-3d" sx={{ position: "absolute", top: "30%", right: "20%", opacity: 0.2 }}>
          <Box className="coin-3d" sx={{ width: 40, height: 40 }}>
            <Box className="coin-face coin-front" style={{ width: 40, height: 40, fontSize: "1rem", background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)" }}>$</Box>
            <Box className="coin-face coin-back" style={{ width: 40, height: 40, fontSize: "1rem", background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)" }}>$</Box>
          </Box>
        </Box>
        
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.25rem" },
            background: "linear-gradient(135deg, #1976d2 0%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Powerful Banking Features
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: "auto", fontSize: "1rem" }}
          >
            Our comprehensive Bank Management System offers end-to-end solutions for all your banking needs, 
            from account management to advanced analytics.
          </Typography>

          <Grid container spacing={3} className="stagger-3d">
            {features.map((f, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={f.title}>
                <Card
                  className="feature-card tilt-card"
                  sx={{
                    textAlign: "center",
                    height: "100%",
                    py: 4,
                    px: 3,
                    border: "1px solid",
                    borderColor: "rgba(25, 118, 210, 0.2)",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240, 249, 255, 0.95) 100%)",
                    cursor: "pointer",
                    opacity: 0,
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease forwards",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#1976d2",
                      boxShadow: "0 8px 30px rgba(25, 118, 210, 0.25)",
                      transform: "translateY(-5px)",
                      "& .glow-icon": {
                        boxShadow: "0 0 25px rgba(25, 118, 210, 0.5)",
                      }
                    }
                  }}
                >
                  <CardContent>
                    <Box
                      className="glow-icon glow-3d"
                      sx={{
                        mb: 2.5,
                        p: 2,
                        display: "inline-flex",
                        borderRadius: "50%",
                        bgcolor: "rgba(25, 118, 210, 0.1)",
                        border: "2px solid rgba(25, 118, 210, 0.2)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, fontSize: "1.1rem", color: "#1565c0" }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── How It Works ────────────────────────────────── */}
      <Box
        id="how-it-works"
        className="about-section scene-3d"
        sx={{ py: { xs: 8, md: 12 }, position: "relative" }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
            Get Started in Minutes
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 520, mx: "auto", fontSize: "1rem" }}
          >
            Begin your journey with BankPro in just three simple steps
          </Typography>

          <Grid container spacing={4}>
            {howItWorks.map((item, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.step}>
                <Box
                  className="step-card tilt-card"
                  sx={{
                    textAlign: "center",
                    position: "relative",
                    cursor: "pointer",
                    opacity: 0,
                    animation: "fadeInUp 0.6s ease forwards",
                    animationDelay: `${index * 150}ms`,
                    py: 4,
                    px: 3,
                  }}
                >
                  <Box className="step-number">{item.step}</Box>
                  <Box
                    className="glow-3d"
                    sx={{
                      display: "inline-flex",
                      p: 2,
                      borderRadius: "50%",
                      bgcolor: "rgba(25, 118, 210, 0.1)",
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {item.desc}
                  </Typography>
                  {index < howItWorks.length - 1 && !isMobile && (
                    <ArrowForwardIcon
                      sx={{
                        position: "absolute",
                        right: -20,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "primary.light",
                        fontSize: 32,
                      }}
                    />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials Section ──────────────────────────── */}
      <Box 
        id="testimonials"
        className="scene-3d" 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background decorations */}
        <Box className="float-3d" sx={{ position: "absolute", top: "10%", left: "5%", opacity: 0.1 }}>
          <Box className="globe-3d" sx={{ width: 80, height: 80 }} />
        </Box>
        <Box className="float-3d-reverse" sx={{ position: "absolute", bottom: "10%", right: "8%", opacity: 0.1 }}>
          <Box className="coin-3d" sx={{ width: 60, height: 60 }}>
            <Box className="coin-face coin-front" sx={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
            <Box className="coin-face coin-back" sx={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
          </Box>
        </Box>
        
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
            Trusted by Millions
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: "auto", fontSize: "1rem" }}
          >
            See what our customers have to say about their experience with BankPro
          </Typography>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={testimonial.name}>
                <Card
                  className="testimonial-card tilt-card"
                  sx={{
                    height: "100%",
                    p: 3,
                    cursor: "pointer",
                    opacity: 0,
                    animationDelay: `${index * 150}ms`,
                    animation: "fadeInUp 0.6s ease forwards",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating 
                    value={testimonial.rating} 
                    readOnly 
                    sx={{ mb: 2, color: "#facc15" }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: "italic" }}>
                    "{testimonial.text}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Online Banking Section ──────────────────────────── */}
      <Box 
        id="online-banking"
        className="scene-3d" 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          bgcolor: "background.default",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background decorations */}
        <Box className="float-3d" sx={{ position: "absolute", top: "10%", left: "5%", opacity: 0.15 }}>
          <Box className="globe-3d" sx={{ width: 80, height: 80 }} />
        </Box>
        <Box className="float-3d-reverse" sx={{ position: "absolute", bottom: "10%", right: "8%", opacity: 0.15 }}>
          <Box className="coin-3d" sx={{ width: 60, height: 60 }}>
            <Box className="coin-face coin-front" sx={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
            <Box className="coin-face coin-back" sx={{ width: 60, height: 60, fontSize: "1.5rem" }}>$</Box>
          </Box>
        </Box>
        
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
            Experience Modern Banking
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: "auto", fontSize: "1rem" }}
          >
            Discover the future of banking with our cutting-edge digital platform. 
            Everything you need for seamless financial management.
          </Typography>

          <Grid container spacing={4}>
            {bankingFeatures.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
                <Card
                  className="feature-card tilt-card"
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                    cursor: "pointer",
                    opacity: 0,
                    animationDelay: `${index * 150}ms`,
                    animation: "fadeInUp 0.6s ease forwards",
                  }}
                >
                  <Box 
                    sx={{ 
                      position: "relative", 
                      height: 160, 
                      overflow: "hidden",
                      "&:hover img": {
                        transform: "scale(1.1)",
                      },
                      "&:hover .overlay": {
                        opacity: 1,
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={feature.image}
                      alt={feature.title}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                    />
                    <Box 
                      className="overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(6, 182, 212, 0.8) 100%)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: "white", 
                          fontWeight: 600,
                          textAlign: "center",
                          px: 2
                        }}
                      >
                        {feature.title}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: "1rem" }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA Section ─────────────────────────────────── */}
      <Box
        className="scene-3d"
        sx={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0d47a1 100%)",
          py: { xs: 8, md: 12 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 3D decorative elements */}
        <Box className="float-3d-slow" sx={{ position: "absolute", top: "20%", left: "10%", opacity: 0.3 }}>
          <Box className="coin-3d" sx={{ width: 50, height: 50 }}>
            <Box className="coin-face coin-front" sx={{ width: 50, height: 50, fontSize: "1.2rem" }}>$</Box>
            <Box className="coin-face coin-back" sx={{ width: 50, height: 50, fontSize: "1.2rem" }}>$</Box>
          </Box>
        </Box>
        <Box className="float-3d-reverse" sx={{ position: "absolute", bottom: "20%", right: "10%", opacity: 0.3 }}>
          <Box className="globe-3d" sx={{ width: 60, height: 60 }} />
        </Box>
        <Box className="float-3d" sx={{ position: "absolute", top: "60%", left: "20%", opacity: 0.2 }}>
          <Box className="shape-sphere" sx={{ width: 40, height: 40 }} />
        </Box>
        <Box className="float-3d-slow" sx={{ position: "absolute", bottom: "30%", right: "25%", opacity: 0.2 }}>
          <Box className="shape-cube" sx={{ width: 35, height: 35 }} />
        </Box>
        
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 30% 70%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(250, 204, 21, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 40%)
            `,
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            className="text-3d-light"
            sx={{ color: "white", fontWeight: 800, mb: 2, fontSize: { xs: "1.5rem", md: "2.25rem" } }}
          >
            Ready to Transform Your Banking Operations?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.9)", mb: 4, maxWidth: 550, mx: "auto", fontSize: "1.1rem", lineHeight: 1.7 }}
          >
            Join thousands of financial institutions that have revolutionized their operations with BankPro. 
            Experience the power of integrated banking solutions today.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              className="btn-3d"
              onClick={() => navigate("/register")}
              sx={{
                bgcolor: "#fff",
                color: "primary.main",
                px: 5,
                fontWeight: 600,
                fontSize: "1rem",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Footer ──────────────────────────────────────── */}
      <Box
        component="footer"
        id="contact"
        sx={{
          bgcolor: "#0f172a",
          color: "white",
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h5"
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
                {["Home", "About", "Features", "Contact"].map((item) => (
                  <ListItem key={item} disablePadding sx={{ py: 0.5 }}>
                    <Link
                      href={`#${item.toLowerCase().replace(" ", "-")}`}
                      underline="none"
                      sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "primary.main" } }}
                    >
                      {item}
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Services
              </Typography>
              <List disablePadding>
                {["Account Management", "Loans", "Investments", "Transfers"].map((item) => (
                  <ListItem key={item} disablePadding sx={{ py: 0.5 }}>
                    <Link href="#" underline="none" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "primary.main" } }}>
                      {item}
                    </Link>
                  </ListItem>
                ))}
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
