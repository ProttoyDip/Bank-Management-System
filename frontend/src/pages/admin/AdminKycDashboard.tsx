import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ShieldIcon from "@mui/icons-material/Shield";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import api from "../../services/api";
import { ApiResponse, AuditLogEntry, KycDocumentPreview, KycOverviewStats, KycRequest } from "../../types";

type Decision = "Approved" | "Rejected";
const STATUSES = ["ALL", "Pending", "Employee Approved", "Admin Verified", "Rejected"];
const LIMITS = [10, 25, 50];
const COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  "Employee Approved": "#0284c7",
  "Admin Verified": "#16a34a",
  Rejected: "#dc2626",
};
const RISK: Record<string, string> = { Low: "#16a34a", Medium: "#f59e0b", High: "#dc2626" };

const fmt = (v?: string | Date | null) => (v ? new Date(v).toLocaleString() : "N/A");
const fmtShort = (v?: string | Date | null) => (v ? new Date(v).toLocaleDateString() : "N/A");
const csv = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const rowsByDay = (rows: KycRequest[]) => {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const d = new Date(r.submittedDate || r.createdAt);
    if (!Number.isNaN(d.getTime())) {
      const k = d.toISOString().slice(0, 10);
      m.set(k, (m.get(k) || 0) + 1);
    }
  });
  return Array.from(m.entries()).map(([day, value]) => ({ day, value }));
};

export default function AdminKycDashboard() {
  const [rows, setRows] = useState<KycRequest[]>([]);
  const [stats, setStats] = useState<KycOverviewStats | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Employee Approved");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<KycRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decision, setDecision] = useState<Decision>("Approved");
  const [remarks, setRemarks] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [kycRes, statsRes, logsRes] = await Promise.all([
        api.get<ApiResponse<KycRequest[]>>("/admin/kyc", {
          params: { status, search, dateFrom: fromDate || undefined, dateTo: toDate || undefined, page: page + 1, limit },
        }),
        api.get<ApiResponse<any>>("/admin/stats"),
        api.get<ApiResponse<AuditLogEntry[]>>("/admin/logs"),
      ]);
      const meta = (kycRes.data as any).meta || {};
      const data = kycRes.data.data || [];
      const s = statsRes.data.data || {};
      setRows(data);
      setTotal(Number(meta.total || data.length));
      setStats({
        total: Number(s.totalKyc || meta.total || data.length),
        pending: Number(s.pendingKyc || 0),
        approved: Number(s.approvedKyc || 0),
        rejected: Number(s.rejectedKyc || 0),
        approvalRate: Number(s.kycApprovalRate || 0),
      });
      setLogs((logsRes.data.data || []).filter((l) => String(l.action || "").toUpperCase().includes("KYC")));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load KYC dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(0); }, [status, search, fromDate, toDate, limit]);
  useEffect(() => { load(); }, [page, limit, status, search, fromDate, toDate]);

  const openDetails = async (row: KycRequest) => {
    setSelected(row);
    setDetailsOpen(true);
    setSaving(true);
    try {
      const res = await api.get<ApiResponse<KycRequest>>(`/admin/kyc/${row.id}`);
      const data = res.data.data || row;
      setSelected(data);
      setRows((curr) => curr.map((item) => (item.id === data.id ? data : item)));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load KYC details");
    } finally {
      setSaving(false);
    }
  };

  const applyDecision = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const endpoint = decision === "Approved" ? "approve" : "reject";
      const res = await api.post<ApiResponse<KycRequest>>(`/admin/kyc/${selected.id}/${endpoint}`, { remarks });
      const data = res.data.data || selected;
      setRows((curr) => curr.map((item) => (item.id === data.id ? data : item)));
      setSelected(data);
      setMessage(`KYC ${decision.toLowerCase()} successfully.`);
      setDecisionOpen(false);
      setDetailsOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update KYC");
    } finally {
      setSaving(false);
    }
  };

  const updateDoc = async (doc: KycDocumentPreview, isValid: boolean) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.patch<ApiResponse<KycRequest>>(`/admin/kyc/${selected.id}/documents/${doc.id}`, {
        isValid,
        remarks: isValid ? "Validated by admin" : "Marked invalid by admin",
      });
      const data = res.data.data || selected;
      setRows((curr) => curr.map((item) => (item.id === data.id ? data : item)));
      setSelected(data);
      setMessage(`Document marked as ${isValid ? "valid" : "invalid"}.`);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  const trend = useMemo(() => rowsByDay(rows), [rows]);
  const statusData = useMemo(() => ([
    { name: "Pending", value: Number(stats?.pending || 0), color: COLORS["Pending"] },
    { name: "Admin Verified", value: Number(stats?.approved || 0), color: COLORS["Admin Verified"] },
    { name: "Rejected", value: Number(stats?.rejected || 0), color: COLORS["Rejected"] },
  ]), [stats]);
  const riskData = useMemo(() => {
    const tally = { Low: 0, Medium: 0, High: 0 };
    rows.forEach((r) => { const risk = String(r.riskLevel || "Medium"); if (risk in tally) tally[risk as keyof typeof tally] += 1; });
    return (Object.keys(tally) as Array<keyof typeof tally>).map((name) => ({ name, value: tally[name], color: RISK[name] }));
  }, [rows]);

  const exportCsv = () => {
    const content = [
      ["User ID", "Full Name", "Email", "Submitted", "Status", "Risk", "Score"],
      ...rows.map((r) => [r.userId, r.fullName || r.user?.name || "", r.user?.email || "", fmt(r.submittedDate || r.createdAt), r.status, r.riskLevel || "", r.riskScore ?? ""]),
    ].map((r) => r.map(csv).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyc-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>KYC Admin Dashboard</Typography>
        <Typography color="text.secondary">Review submissions, validate documents, approve or reject requests, and keep a complete audit trail.</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Total", stats?.total || total, <AnalyticsIcon />],
          ["Pending", stats?.pending || 0, <AssessmentIcon sx={{ color: COLORS.Pending }} />],
          ["Admin Verified", stats?.approved || 0, <VerifiedUserIcon sx={{ color: COLORS["Admin Verified"] }} />],
          ["Rejected", stats?.rejected || 0, <ShieldIcon sx={{ color: COLORS.Rejected }} />],
          ["Approval", `${stats?.approvalRate || 0}%`, <ReceiptLongIcon />],
        ].map(([label, value, icon]) => (
          <Grid item xs={12} sm={6} lg={2} key={String(label)}>
            <Card><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="body2" color="text.secondary">{label as string}</Typography><Typography variant="h5" sx={{ fontWeight: 800 }}>{String(value)}</Typography></Box>{icon as any}</Stack></CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>KYC Requests</Typography>
                  <Typography variant="body2" color="text.secondary">Filter the queue and open any submission for detailed review.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={exportCsv} startIcon={<DownloadIcon />}>CSV</Button>
                  <Button variant="contained" onClick={load}>Refresh</Button>
                </Stack>
              </Stack>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}><TextField fullWidth label="Search" value={search} onChange={(e) => setSearch(e.target.value)} /></Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value={status} onChange={(e: SelectChangeEvent) => setStatus(e.target.value)}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Rows</InputLabel>
                    <Select label="Rows" value={String(limit)} onChange={(e: SelectChangeEvent) => setLimit(Number(e.target.value))}>{LIMITS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}</Select>
                  </FormControl>
                </Grid>
              </Grid>

              {loading ? <LinearProgress sx={{ my: 4 }} /> : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead><TableRow><TableCell>User ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Submitted</TableCell><TableCell>Status</TableCell><TableCell>Risk</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.userId}</TableCell>
                          <TableCell>{row.fullName || row.user?.name || "N/A"}</TableCell>
                          <TableCell>{row.user?.email || "N/A"}</TableCell>
                          <TableCell>{fmtShort(row.submittedDate || row.createdAt)}</TableCell>
                          <TableCell><Chip size="small" label={row.status} color={(row.status === "Admin Verified" ? "success" : row.status === "Rejected" ? "error" : row.status === "Employee Approved" ? "info" : "warning") as any} /></TableCell>
                          <TableCell><Chip size="small" label={`${row.riskLevel || "Medium"}${row.riskScore ? ` ${row.riskScore}` : ""}`} color={(row.riskLevel === "Low" ? "success" : row.riskLevel === "High" ? "error" : "warning") as any} /></TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" startIcon={<VisibilityIcon />} onClick={() => openDetails(row)}>View</Button>
                              {row.status === "Employee Approved" && (
                                <>
                                  <Button size="small" color="success" variant="contained" startIcon={<CheckCircleIcon />} onClick={async () => { await openDetails(row); setDecision("Approved"); setRemarks(""); setDecisionOpen(true); }}>Approve</Button>
                                  <Button size="small" color="error" variant="outlined" startIcon={<CancelIcon />} onClick={async () => { await openDetails(row); setDecision("Rejected"); setRemarks(""); setDecisionOpen(true); }}>Reject</Button>
                                </>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!rows.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No KYC submissions found.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </Box>
              )}
              <TablePagination component="div" count={total} rowsPerPage={limit} page={page} onPageChange={(_, n) => setPage(n)} onRowsPerPageChange={(e) => setLimit(Number(e.target.value))} rowsPerPageOptions={LIMITS} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Card sx={{ border: "1px solid", borderColor: "divider" }}><CardContent><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Status Distribution</Typography><Box sx={{ height: 220, minWidth: 0, minHeight: 0 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>{statusData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Box></CardContent></Card>
            <Card sx={{ border: "1px solid", borderColor: "divider" }}><CardContent><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Submission Trend</Typography><Box sx={{ height: 220, minWidth: 0, minHeight: 0 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" hide /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></Box></CardContent></Card>
            <Card sx={{ border: "1px solid", borderColor: "divider" }}><CardContent><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Risk Mix</Typography><Stack spacing={1.25}>{riskData.map((item) => (<Box key={item.name}><Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography><Typography variant="body2" color="text.secondary">{item.value}</Typography></Stack><LinearProgress variant="determinate" value={rows.length ? (item.value / rows.length) * 100 : 0} sx={{ height: 8, borderRadius: 999, bgcolor: `${item.color}22`, "& .MuiLinearProgress-bar": { bgcolor: item.color } }} /></Box>))}</Stack></CardContent></Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>KYC Profile</Typography>
              <Typography variant="body2" color="text.secondary">Identity details, documents, timeline, and audit trail.</Typography>
            </Box>
            <IconButton onClick={() => setDetailsOpen(false)}><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {saving ? <LinearProgress sx={{ mb: 2 }} /> : null}
          {selected && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined"><CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{selected.fullName || selected.user?.name || "Unknown"}</Typography>
                  <Typography variant="body2" color="text.secondary">{selected.user?.email || "N/A"}</Typography>
                  <Typography variant="body2" color="text.secondary">User ID: {selected.userId}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}><Chip label={selected.status} color={(selected.status === "Admin Verified" ? "success" : selected.status === "Rejected" ? "error" : selected.status === "Employee Approved" ? "info" : "warning") as any} /><Chip label={`${selected.riskLevel || "Medium"} risk`} color={(selected.riskLevel === "Low" ? "success" : selected.riskLevel === "High" ? "error" : "warning") as any} /></Stack>
                </CardContent></Card>
                <Card variant="outlined" sx={{ mt: 2 }}><CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Risk Score</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{selected.riskScore ?? 0}</Typography>
                  <LinearProgress variant="determinate" value={selected.riskScore ?? 0} sx={{ height: 10, borderRadius: 999, my: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{(selected.riskFactors || []).length ? selected.riskFactors!.map((f) => <Chip key={f} size="small" label={f} variant="outlined" />) : <Typography variant="body2" color="text.secondary">No extra risk flags.</Typography>}</Stack>
                </CardContent></Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card variant="outlined" sx={{ mb: 2 }}><CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Identity Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Submitted</Typography><Typography>{fmt(selected.submittedDate || selected.createdAt)}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Reviewed</Typography><Typography>{fmt(selected.verifiedAt)}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Date of Birth</Typography><Typography>{selected.dob ? fmtShort(selected.dob) : selected.profile?.dob ? fmtShort(selected.profile.dob) : "Not stored"}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Country</Typography><Typography>{selected.country || selected.profile?.country || "Not stored"}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Address</Typography><Typography>{selected.profile?.address || selected.user?.address || "Not stored"}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">National ID</Typography><Typography>{selected.profile?.nationalId || selected.profile?.passportNumber || selected.user?.nationalId || "Not stored"}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Transaction Intent</Typography><Typography>{selected.transactionIntent || selected.profile?.transactionIntent || "Not stored"}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Document Type</Typography><Typography>{selected.documentType || "Not specified"}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Remarks</Typography><Typography>{selected.remarks || "No remarks yet"}</Typography></Grid>
                  </Grid>
                </CardContent></Card>
                <Card variant="outlined" sx={{ mb: 2 }}><CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Documents</Typography>
                  <Grid container spacing={2}>
                    {(selected.documents || []).length ? selected.documents!.map((doc) => (
                      <Grid item xs={12} md={6} key={doc.id}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{doc.type}</Typography><Typography variant="caption" color="text.secondary">{doc.fileName}</Typography></Box><Chip size="small" label={doc.isValid === null ? "Unreviewed" : doc.isValid ? "Valid" : "Invalid"} color={doc.isValid === null ? "default" : doc.isValid ? "success" : "error"} /></Stack>
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} href={doc.filePath} target="_blank" rel="noreferrer">Download</Button>
                            <Button size="small" variant="contained" color="success" onClick={() => updateDoc(doc, true)} disabled={saving}>Mark Valid</Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => updateDoc(doc, false)} disabled={saving}>Mark Invalid</Button>
                          </Stack>
                          {doc.validationRemark && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>{doc.validationRemark}</Typography>}
                        </Paper>
                      </Grid>
                    )) : <Grid item xs={12}><Typography variant="body2" color="text.secondary">No document metadata available.</Typography></Grid>}
                  </Grid>
                </CardContent></Card>
                <Card variant="outlined" sx={{ mb: 2 }}><CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Timeline</Typography>
                  <Stack spacing={1.5}>{(selected.timeline || []).map((item) => <Paper key={`${item.label}-${String(item.at)}`} variant="outlined" sx={{ p: 1.5 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.label}</Typography><Typography variant="body2" color="text.secondary">{item.comment || "No details provided"}</Typography></Box><Chip size="small" label={item.status} /></Stack><Typography variant="caption" color="text.secondary">{fmt(item.at)}</Typography></Paper>)}</Stack>
                </CardContent></Card>
                <Card variant="outlined"><CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Audit Trail</Typography>
                  <Stack spacing={1.25}>{(selected.auditTrail || []).length ? selected.auditTrail!.map((log) => <Paper key={log.id} variant="outlined" sx={{ p: 1.5 }}><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{log.action}</Typography><Typography variant="body2" color="text.secondary">{log.details || "No details provided"}</Typography><Typography variant="caption" color="text.secondary">{fmt(log.createdAt)}</Typography></Paper>) : <Typography variant="body2" color="text.secondary">No audit trail available yet.</Typography>}</Stack>
                </CardContent></Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selected?.status === "Employee Approved" && (
            <>
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => { setDecision("Approved"); setRemarks(""); setDecisionOpen(true); }} disabled={saving}>Approve</Button>
              <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => { setDecision("Rejected"); setRemarks(""); setDecisionOpen(true); }} disabled={saving}>Reject</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={decisionOpen} onClose={() => setDecisionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{decision === "Approved" ? "Approve KYC Submission" : "Reject KYC Submission"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity={decision === "Approved" ? "success" : "warning"}>
              {decision === "Approved"
                ? "The customer will be notified and their profile will be restored to active status."
                : "The customer will be notified and related accounts will be frozen until the KYC is resubmitted."}
            </Alert>
            <TextField fullWidth label="Remarks" multiline minRows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add reviewer notes or a rejection reason" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionOpen(false)}>Cancel</Button>
          <Button variant="contained" color={decision === "Approved" ? "success" : "error"} onClick={applyDecision} disabled={saving}>
            {decision === "Approved" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
