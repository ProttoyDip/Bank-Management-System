import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";

const customerNavItems = [
  { label: "Dashboard", path: "/customer/dashboard", icon: <DashboardIcon /> },
  { label: "My Accounts", path: "/customer/accounts", icon: <AccountBalanceIcon /> },
  { label: "My Card", path: "/customer/card", icon: <CreditCardIcon /> },
  { label: "Transactions", path: "/customer/transactions", icon: <SwapHorizIcon /> },
  { label: "Loans", path: "/customer/loans", icon: <RequestQuoteIcon /> },
  { label: "Settings", path: "/customer/settings", icon: <SettingsIcon /> },
];

export default function CustomerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      className="glass"
      component={motion.div}
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: isDarkMode ? theme.palette.background.paper : theme.palette.background.default,
        color: theme.palette.text.primary,
        borderRight: 1,
        borderColor: theme.palette.divider,
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo / Header */}
      <Box
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box component={motion.div} whileHover={{ rotate: 5 }}>
          <AccountBalanceWalletIcon sx={{ color: theme.palette.primary.main, fontSize: 30 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, lineHeight: 1, color: theme.palette.text.primary, fontSize: {xs: '1rem', sm: '1.25rem'} }}>
            BMS Customer
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: {xs: '0.65rem', sm: '0.75rem'} }}>
            Banking System
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {customerNavItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Box key={item.path} component={motion.div} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    px: 2.5,
                    py: 1.8,
                    minHeight: 48,
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    bgcolor: active
                      ? `linear-gradient(90deg, ${theme.palette.primary.main}22 0%, transparent 50%)`
                      : "transparent",
                    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                      color: theme.palette.primary.main,
                      transform: "translateX(8px)",
                      boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                    },
                    ...(active && {
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        bgcolor: theme.palette.primary.main,
                        boxShadow: "0 0 20px 1px currentColor",
                      }
                    })
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: 44,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active ? 700 : 500,
                      fontSize: "0.95rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Box>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Logout */}
      <Box component={motion.div} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <List sx={{ px: 2, py: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1.8,
                minHeight: 48,
                color: "#f87171",
                transition: "all 0.25s ease",
                "&:hover": {
                  bgcolor: "#ef4444",
                  color: "#fff",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 44 }}>
                <LogoutIcon />
              </ListItemIcon>

              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
