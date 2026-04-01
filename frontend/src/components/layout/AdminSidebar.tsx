import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import BadgeIcon from "@mui/icons-material/Badge";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useAuth } from "../../context/AuthContext";

const adminNavItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
  { label: "Employees", path: "/admin/employees", icon: <BadgeIcon /> },
  { label: "Customers", path: "/admin/customers", icon: <PeopleIcon /> },
  { label: "Accounts", path: "/admin/accounts", icon: <AccountBalanceIcon /> },
  { label: "Transactions", path: "/admin/transactions", icon: <SwapHorizIcon /> },
  { label: "Loans", path: "/admin/loans", icon: <RequestQuoteIcon /> },
  { label: "KYC", path: "/admin/kyc", icon: <VerifiedUserIcon /> },
  { label: "Reports", path: "/admin/reports", icon: <AssessmentIcon /> },
  { label: "Settings", path: "/admin/settings", icon: <SettingsIcon /> },
  { label: "Audit Logs", path: "/admin/logs", icon: <ReceiptLongIcon /> },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isItemActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <AccountBalanceWalletIcon sx={{ color: "primary.main", fontSize: 32 }} />
        <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700 }}>
          BMS Admin
        </Typography>
      </Box>

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {adminNavItems.map((item) => {
          const isActive = isItemActive(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? "rgba(56, 189, 248, 0.12)" : "transparent",
                  color: isActive ? "primary.main" : "text.secondary",
                  "&:hover": {
                    bgcolor: "rgba(56, 189, 248, 0.08)",
                    color: "primary.main",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <List sx={{ px: 1.5, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "error.main",
              "&:hover": { bgcolor: "error.light", color: "white" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}