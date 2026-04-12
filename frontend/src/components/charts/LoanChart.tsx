import { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import api from "../../services/api";
import { ApiResponse, Loan, LoanType } from "../../types";

interface LoanChartEntry {
  name: string;
  value: number;
  color: string;
}

interface LoanChartProps {
  data?: LoanChartEntry[];
}

const LOAN_COLORS: Record<string, string> = {
  [LoanType.PERSONAL]: "#3b82f6",
  [LoanType.HOME]: "#8b5cf6",
  [LoanType.CAR]: "#06b6d4",
  [LoanType.EDUCATION]: "#10b981",
  [LoanType.BUSINESS]: "#f59e0b",
};

export default function LoanChart({ data }: LoanChartProps) {
  const theme = useTheme();
  const [chartData, setChartData] = useState<LoanChartEntry[]>([]);

  useEffect(() => {
    if (data) {
      setChartData(data);
      return;
    }
    api.get<ApiResponse<Loan[]>>("/loans").then((res) => {
      const loans = res.data.data;
      const counts: Record<string, number> = {};
      loans.forEach((loan) => {
        counts[loan.type] = (counts[loan.type] || 0) + 1;
      });
      const entries = Object.values(LoanType)
        .map((type) => ({
          name: type,
          value: counts[type] || 0,
          color: LOAN_COLORS[type] || "#94a3b8",
        }))
        .filter((e) => e.value > 0);
      setChartData(entries);
    }).catch(() => {
      setChartData([]);
    });
  }, [data]);

  return (
    <Box sx={{ width: "100%", height: 300, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
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
            formatter={(value) => [`${value} loan(s)`, "Count"]}
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
  );
}
