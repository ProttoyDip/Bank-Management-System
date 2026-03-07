import { Box, Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export default function StatCard({ title, value, icon, color, trend, delay = 0 }: StatCardProps) {
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: `0 8px 24px ${color}20` }}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {trend && (
              <Typography
                variant="caption"
                sx={{
                  color: trend.isPositive ? "success.main" : "error.main",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 1,
                }}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                <Typography component="span" variant="caption" color="text.secondary">
                  vs last month
                </Typography>
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

