import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface LoanChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const defaultData = [
  { name: "Personal Loans", value: 35, color: "#3b82f6" },
  { name: "Home Loans", value: 28, color: "#8b5cf6" },
  { name: "Car Loans", value: 18, color: "#06b6d4" },
  { name: "Education Loans", value: 12, color: "#10b981" },
  { name: "Business Loans", value: 7, color: "#f59e0b" },
];

export default function LoanChart({ data = defaultData }: LoanChartProps) {
  const theme = useTheme();

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      sx={{ height: "100%" }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Loan Distribution
        </Typography>
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [`${value}%`, "Share"]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span style={{ color: theme.palette.text.primary, fontSize: 12 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

