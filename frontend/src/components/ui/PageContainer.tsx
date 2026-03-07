import { Box, Typography, Button, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  loading?: boolean;
  children: ReactNode;
}

export default function PageContainer({
  title,
  subtitle,
  action,
  loading = false,
  children,
}: PageContainerProps) {
  if (loading) {
    return (
      <Box
        sx={{
          maxWidth: 1600,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={24} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        maxWidth: 1600,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, md: 3 },
        width: "100%",
      }}
    >
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              color: "text.primary",
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ color: "text.secondary" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Button
            variant="contained"
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{
              fontWeight: 600,
              px: 3,
              py: 1,
              boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(25, 118, 210, 0.35)",
              },
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>

      {/* Page Content */}
      {children}
    </Box>
  );
}

