import { createTheme } from "@mui/material/styles";

// ── Dark theme for better UX (Low Blue Light Professional Banking) ──────────────────────────
export const darkThemeConfig = {
  palette: {
    mode: "dark" as const,
    primary: {
      main: "#1e3a8a", // Low blue light professional banking blue
      light: "#60a5fa",
      dark: "#1e40af",
    },
    secondary: {
      main: "#80deea",
      light: "#b2ebf2",
      dark: "#26c6da",
    },
    background: {
      default: "#0f0f23", // Ultra-dark navy for low blue light
      paper: "#1a1a2e",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#b0b0b0",
    },
    error: { main: "#f48fb1" },
    warning: { main: "#ffcc02" },
    success: { main: "#a5d6a7" },
    divider: "#333333",
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
          "&:hover": { boxShadow: "0 2px 8px rgba(30,58,138,0.3)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid #333",
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
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          minWidth: 420,
          maxWidth: "90vw",
          backgroundColor: "#1a1a2e",
          "& .MuiMenuItem-root": {
            borderRadius: 8,
            margin: "4px",
            transition: "all 0.2s ease",
            color: "#e0e0e0",
            "&:hover": {
              backgroundColor: "rgba(30, 58, 138, 0.15)",
              transform: "translateX(4px)",
              boxShadow: "4px 4px 12px rgba(0,0,0,0.3)"
            }
          },
          "& .MuiTypography-body2": {
            fontWeight: 600,
            lineHeight: 1.3,
            color: "#e0e0e0"
          },
          "& .MuiTypography-caption": {
            fontSize: "0.875rem !important",
            lineHeight: 1.4,
            color: "#b0b0b0",
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
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          color: "#e0e0e0",
          "& .MuiAlert-icon": {
            fontSize: "1.5rem",
            color: "inherit"
          },
          "& .MuiAlert-message": {
            fontWeight: 500,
            lineHeight: 1.4,
            color: "inherit"
          }
        }
      }
    }
  },
};

