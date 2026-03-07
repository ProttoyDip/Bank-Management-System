import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface TransactionChartProps {
  data?: Array<{
    month: string;
    deposits: number;
    withdrawals: number;
  }>;
}

const defaultData = [
  { month: "Jan", deposits: 45000, withdrawals: 28000 },
  { month: "Feb", deposits: 52000, withdrawals: 35000 },
  { month: "Mar", deposits: 48000, withdrawals: 32000 },
  { month: "Apr", deposits: 61000, withdrawals: 45000 },
  { month: "May", deposits: 55000, withdrawals: 38000 },
  { month: "Jun", deposits: 67000, withdrawals: 48000 },
  { month: "Jul", deposits: 72000, withdrawals: 52000 },
  { month: "Aug", deposits: 68000, withdrawals: 49000 },
  { month: "Sep", deposits: 75000, withdrawals: 55000 },
  { month: "Oct", deposits: 82000, withdrawals: 58000 },
  { month: "Nov", deposits: 78000, withdrawals: 52000 },
  { month: "Dec", deposits: 95000, withdrawals: 68000 },
];

export default function TransactionChart({ data = defaultData }: TransactionChartProps) {
  const theme = useTheme();

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      sx={{ height: "100%" }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Monthly Transactions
        </Typography>
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDeposits)"
                name="Deposits"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWithdrawals)"
                name="Withdrawals"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

