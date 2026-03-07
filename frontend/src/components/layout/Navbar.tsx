import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { motion } from "framer-motion";

interface NavbarProps {
  onMenuClick: () => void;
  sidebarWidth: number;
}

const notifications = [
  { id: 1, message: "New account created", time: "2 min ago" },
  { id: 2, message: "Loan application received", time: "1 hour ago" },
  { id: 3, message: "Transaction completed", time: "3 hours ago" },
];

export default function Navbar({ onMenuClick, sidebarWidth }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s ease, margin-left 0.3s ease",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 3 } }}>
        {/* Mobile Menu Button */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: "none" }, color: "text.primary" }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search Bar */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 480,
            ml: { xs: 2, md: 0 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              borderRadius: 2,
              px: 2,
              py: 0.5,
              border: "1px solid",
              borderColor: searchFocused ? "primary.main" : "transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            <InputBase
              placeholder="Search customers, accounts, transactions..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              sx={{
                flex: 1,
                fontSize: "0.9rem",
                "& input::placeholder": {
                  color: "text.secondary",
                  opacity: 1,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: { xs: "none", sm: "block" },
                bgcolor: "background.default",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                color: "text.secondary",
                fontSize: "0.7rem",
              }}
            >
              Ctrl+K
            </Typography>
          </Box>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          <IconButton onClick={handleNotifMenuOpen} sx={{ color: "text.secondary" }}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              ml: 1,
              p: 0.5,
              pr: 2,
              borderRadius: 3,
              cursor: "pointer",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              A
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrator
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Notification Menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 360,
              maxHeight: 400,
              mt: 1,
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          <Divider />
          {notifications.map((notif) => (
            <MenuItem key={notif.id} onClick={handleClose} sx={{ py: 1.5 }}>
              <Box>
                <Typography variant="body2">{notif.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {notif.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem sx={{ justifyContent: "center", py: 1.5 }}>
            <Typography variant="body2" color="primary" fontWeight={600}>
              View All Notifications
            </Typography>
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 220, mt: 1 },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Admin User
            </Typography>
            <Typography variant="caption" color="text.secondary">
              admin@bank.com
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

