import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleSidebarToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar 
        open={mobileOpen} 
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        onCollapse={handleSidebarCollapse}
      />
      
      <Navbar 
        onMenuClick={handleSidebarToggle}
        sidebarWidth={sidebarWidth}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: 7, md: 0 },
          pt: { xs: 2, md: 3 },
          px: { xs: 2, sm: 3 },
          pb: 3,
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          ml: { md: 0 },
          minHeight: "100vh",
          bgcolor: "background.default",
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

