import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { motion, AnimatePresence } from "framer-motion";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
}

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Customers", path: "/customers", icon: <PeopleIcon /> },
  { label: "Accounts", path: "/accounts", icon: <AccountBalanceIcon /> },
  { label: "Transactions", path: "/transactions", icon: <SwapHorizIcon /> },
  { label: "Loans", path: "/loans", icon: <RequestQuoteIcon /> },
  { label: "Employees", path: "/employees", icon: <BadgeIcon /> },
  { label: "Branches", path: "/branches", icon: <BusinessIcon /> },
  { label: "Reports", path: "/reports", icon: <AssessmentIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

export default function Sidebar({ open, collapsed, onToggle, onCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawerWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) onToggle();
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #1E3A8A 0%, #1e40af 100%)",
        color: "#fff",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "space-between",
          minHeight: 64,
        }}
      >
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 32, color: "#38bdf8" }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #fff 0%, #38bdf8 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BMS
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && !isMobile && (
          <AccountBalanceWalletIcon sx={{ fontSize: 32, color: "#38bdf8" }} />
        )}

        {!isMobile && (
          <IconButton
            onClick={onCollapse}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip
              key={item.path}
              title={collapsed && !isMobile ? item.label : ""}
              placement="right"
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    py: 1.25,
                    px: collapsed && !isMobile ? 1.5 : 2,
                    justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                    bgcolor: isActive ? "rgba(56, 189, 248, 0.2)" : "transparent",
                    color: isActive ? "#38bdf8" : "rgba(255,255,255,0.7)",
                    borderLeft: isActive ? "3px solid #38bdf8" : "3px solid transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(56, 189, 248, 0.15)",
                      color: "#fff",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: collapsed && !isMobile ? 0 : 40,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <AnimatePresence>
                    {(!collapsed || isMobile) && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 600 : 400,
                            fontSize: "0.9rem",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Logout */}
      <List sx={{ px: 1, py: 1 }}>
        <Tooltip title={collapsed && !isMobile ? "Logout" : ""} placement="right">
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/login")}
              sx={{
                borderRadius: 2,
                mx: 1,
                py: 1.25,
                px: collapsed && !isMobile ? 1.5 : 2,
                justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                color: "rgba(255,255,255,0.7)",
                "&:hover": {
                  bgcolor: "rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: collapsed && !isMobile ? 0 : 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <AnimatePresence>
                {(!collapsed || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{ fontSize: "0.9rem" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile AppBar */}
      <Box
        sx={{
          display: { md: "none" },
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", px: 2, minHeight: 56 }}>
          <IconButton onClick={onToggle}>
            <MenuIcon />
          </IconButton>
          <AccountBalanceWalletIcon sx={{ color: "primary.main", ml: 1, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
            Bank Management
          </Typography>
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open && isMobile}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
            transition: "width 0.3s ease",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

