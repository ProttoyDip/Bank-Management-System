import { createTheme } from "@mui/material/styles";

// ── Light "Modern Fintech" theme (Synced with Dark Professional) ──────────────────────────
export const lightThemeConfig = {
  palette: {
    mode: "light" as const,
    primary: {
      main: "#1e3a8a", // Synced professional banking blue
      light: "#60a5fa",
      dark: "#1e40af",
    },
    secondary: {
      main: "#26c6da",
      light: "#80deea",
      dark: "#00838f",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    error: { main: "#ef4444" },
    warning: { main: "#f59e0b" },
    success: { main: "#22c55e" },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "0 2px 8px rgba(30,58,138,0.25)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" as const, size: "medium" as const },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)",
          minWidth: 420,
          maxWidth: "90vw",
          "& .MuiMenuItem-root": {
            borderRadius: 8,
            margin: "4px",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(30, 58, 138, 0.08)",
              transform: "translateX(4px)",
              boxShadow: "4px 4px 12px rgba(0,0,0,0.1)"
            }
          },
          "& .MuiTypography-body2": {
            fontWeight: 600,
            lineHeight: 1.3
          },
          "& .MuiTypography-caption": {
            fontSize: "0.875rem !important",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }
        }
      }
    },
    MuiAlert: {
      defaultProps: {
        sx: {
          fontSize: { xs: "0.9rem", sm: "1rem" },
          padding: "16px 20px",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          "& .MuiAlert-icon": {
            fontSize: "1.5rem"
          },
          "& .MuiAlert-message": {
            fontWeight: 500,
            lineHeight: 1.4
          }
        }
      }
    }
  },
};

