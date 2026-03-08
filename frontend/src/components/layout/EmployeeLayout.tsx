import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, AppBar, Toolbar, IconButton, Drawer, Typography, InputBase, Badge, Avatar, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EmployeeSidebar from "./EmployeeSidebar";
import { useAuth } from "../../context/AuthContext";

const DRAWER_WIDTH = 260;

export default function EmployeeLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = <EmployeeSidebar />;

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
            Employee Panel
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
            <IconButton>
              <Badge badgeContent={2} color="error">
                <NotificationsIcon sx={{ color: "text.secondary" }} />
              </Badge>
            </IconButton>
            {/* Profile */}
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontWeight: 600 }}>
                {user?.name?.charAt(0) || "E"}
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
                  {user?.name || "Employee"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || "employee@bank.com"}
                </Typography>
              </Box>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Logout</MenuItem>
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

