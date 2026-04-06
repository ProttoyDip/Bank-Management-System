import { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import { ApiResponse, Transaction, TransactionType } from "../../types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ChartEntry {
  month: string;
  deposits: number;
  withdrawals: number;
}

interface TransactionChartProps {
  data?: ChartEntry[];
}

export default function TransactionChart({ data }: TransactionChartProps) {
  const theme = useTheme();
  const [chartData, setChartData] = useState<ChartEntry[]>([]);

  useEffect(() => {
    if (data) {
      setChartData(data);
      return;
    }
    api.get<ApiResponse<Transaction[]>>("/transactions").then((res) => {
      const txs = res.data.data;
      const aggregated: Record<string, ChartEntry> = {};
      MONTHS.forEach((m) => {
        aggregated[m] = { month: m, deposits: 0, withdrawals: 0 };
      });
      txs.forEach((tx) => {
        const month = MONTHS[new Date(tx.createdAt).getMonth()];
        if (
          tx.type === TransactionType.DEPOSIT ||
          tx.type === TransactionType.TRANSFER_IN ||
          tx.type === TransactionType.LOAN_DISBURSEMENT
        ) {
          aggregated[month].deposits += Number(tx.amount);
        } else {
          aggregated[month].withdrawals += Number(tx.amount);
        }
      });
      setChartData(MONTHS.map((m) => aggregated[m]));
    }).catch(() => {
      setChartData(MONTHS.map((m) => ({ month: m, deposits: 0, withdrawals: 0 })));
    });
  }, [data]);

  return (
    <Box sx={{ width: "100%", height: 300, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tickFormatter={(value) => `৳${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`৳${Number(value).toLocaleString()}`, ""]}
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
  );
}
