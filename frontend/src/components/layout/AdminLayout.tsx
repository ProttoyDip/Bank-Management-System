import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, AppBar, Toolbar, IconButton, Drawer, useMediaQuery, useTheme, Typography, InputBase, Badge, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/useNotification";
import { Notification } from "../../types";

const DRAWER_WIDTH = 260;

export default function AdminLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotification();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    markAllAsRead();
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifMenuClose = () => {
    setNotifAnchor(null);
  };

  const drawer = <AdminSidebar />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar for mobile */}
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          bgcolor: "background.paper", 
          borderBottom: "1px solid", 
          borderColor: "divider", 
          display: { md: "none" },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton 
            color="inherit" 
            edge="start" 
            onClick={() => setMobileOpen(!mobileOpen)} 
            sx={{ color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, ml: 1 }}>
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box 
        component="nav" 
        sx={{ 
          width: { md: DRAWER_WIDTH }, 
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ 
            display: { xs: "block", md: "none" }, 
            "& .MuiDrawer-paper": { 
              width: DRAWER_WIDTH, 
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            } 
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ 
            display: { xs: "none", md: "block" }, 
            "& .MuiDrawer-paper": { 
              width: DRAWER_WIDTH, 
              bgcolor: "background.paper", 
              borderRight: "1px solid", 
              borderColor: "divider",
            } 
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          mt: { xs: 8, md: 0 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, 
          bgcolor: "background.default", 
          minHeight: "100vh",
          transition: "width 0.3s ease",
        }}
      >
        {/* Top Navbar */}
        <AppBar 
          position="sticky" 
          elevation={0} 
          sx={{ 
            bgcolor: "background.paper", 
            borderBottom: "1px solid", 
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ gap: 2, px: { xs: 2, md: 3 } }}>
            {/* Search */}
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                bgcolor: "background.default", 
                borderRadius: 2, 
                px: 2, 
                py: 0.5, 
                flex: 1, 
                maxWidth: 400,
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "primary.main",
                },
                "&:focus-within": {
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                },
              }}
            >
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              <InputBase 
                placeholder="Search customers, accounts..." 
                sx={{ flex: 1, fontSize: "0.9rem" }} 
              />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            {/* Notifications */}
            <IconButton onClick={handleNotifMenuOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: "text.secondary" }} />
              </Badge>
            </IconButton>
            {/* Notification Menu */}
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={handleNotifMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>
              <Divider />
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <MenuItem 
                    key={notif.id} 
                    onClick={handleNotifMenuClose}
                    sx={{ 
                      px: 3, 
                      py: 2,
                      borderRadius: 1,
                      mx: 1,
                      mb: 1,
                      transition: "all 0.2s ease",
                      "&:hover": { transform: "translateX(4px)" }
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 700,
                          color: notif.isRead ? "text.primary" : "primary.main"
                        }}>
                          {notif.title}
                        </Typography>
                        {!notif.isRead && (
                          <Box sx={{
                            width: 8, height: 8, borderRadius: "50%", bgcolor: "error.main"
                          }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {notif.message}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </MenuItem>
              )}
              <Divider />
              <MenuItem sx={{ justifyContent: "center", py: 1.5 }} onClick={handleNotifMenuClose}>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  View All
                </Typography>
              </MenuItem>
            </Menu>
            {/* Profile */}
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontWeight: 600 }}>
                {user?.name?.charAt(0) || "A"}
              </Avatar>
            </IconButton>
            <Menu 
              anchorEl={anchorEl} 
              open={Boolean(anchorEl)} 
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  minWidth: 180,
                  mt: 1,
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.name || "Admin User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || "admin@bank.com"}
                </Typography>
              </Box>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate("/admin/settings"); }}>Profile</MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate("/admin/settings"); }}>Settings</MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); logout(); navigate("/login"); }}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        
        {/* Page Content */}
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
