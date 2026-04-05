import { useState } from "react";
import { useSearch } from "../../context/SearchContext";
import ClearIcon from "@mui/icons-material/Clear";
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/useNotification";
import { Notification } from "../../types";

interface NavbarProps {
  onMenuClick: () => void;
  sidebarWidth: number;
}

export default function Navbar({ onMenuClick, sidebarWidth }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotification();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    markAllAsRead();
    setNotifAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  const handleProfileClick = () => {
    handleClose();
    navigate("/admin/settings");
  };

  const handleSettingsClick = () => {
    handleClose();
    navigate("/admin/settings");
  };

  const handleLogoutClick = () => {
    handleClose();
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const input = event.currentTarget.querySelector('input') as HTMLInputElement | null;
    const query = input?.value || '';
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const lowerQuery = trimmedQuery.toLowerCase();
    let path = '';
    if (lowerQuery.includes('transaction')) {
      path = `/customer/transactions?q=${encodeURIComponent(trimmedQuery)}`;
    } else if (lowerQuery.includes('account')) {
      path = `/customer/accounts?q=${encodeURIComponent(trimmedQuery)}`;
    } else {
      return;
    }
    navigate(path);
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
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1.5, md: 3 }, gap: {xs:1, md:0} }}>
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
          flexBasis: {xs: '100%', md: 0},
          maxWidth: {xs: '100%', md: 480},
          ml: { xs: 0, md: 0 },
          order: {xs: 3, md: 2},
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={handleSearchSubmit}
              sx={{
                flex: 1,
                fontSize: "0.9rem",
                "& input::placeholder": {
                  color: "text.secondary",
                  opacity: 1,
                },
              }}
            />
            {searchQuery && (
              <IconButton
                size="small"
                onClick={() => setSearchQuery("")}
                sx={{ ml: 1 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
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
            <Badge badgeContent={unreadCount} color="error">
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
              <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2">{notif.title}</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {notif.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notif.createdAt).toLocaleString()}
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
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogoutClick} sx={{ color: "error.main" }}>
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
