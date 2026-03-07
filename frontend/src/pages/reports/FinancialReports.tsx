import { Box, Typography, Card, CardContent, Grid, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import DownloadIcon from "@mui/icons-material/Download";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";

export default function FinancialReports() {
  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Financial Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            View comprehensive financial analytics and reports
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ fontWeight: 600 }}>
          Export Report
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Total Revenue</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>৳12.5M</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>+12.5%</Typography>
                  </Box>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Total Expenses</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>৳4.2M</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    <TrendingDownIcon fontSize="small" color="error" />
                    <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>+5.2%</Typography>
                  </Box>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, color: "error.main", opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Net Profit</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>৳8.3M</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>+18.3%</Typography>
                  </Box>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, color: "success.main", opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>ROI</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>24.8%</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>+3.2%</Typography>
                  </Box>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Sections */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Income Statement</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Interest Income</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳8,500,000</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Fee & Commission</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳2,100,000</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Other Income</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳1,900,000</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "primary.main", color: "white", p: 1.5, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Income</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳12,500,000</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Expense Breakdown</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Employee Salaries</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳2,200,000</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Operating Expenses</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳1,100,000</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Marketing</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳450,000</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Other Expenses</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳450,000</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "error.main", color: "white", p: 1.5, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Expenses</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>৳4,200,000</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

