import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import api from "../../services/api";
import { KycRequest } from "../../types";

const DOCUMENT_TYPES = [
  "National ID",
  "Passport",
  "Driving License",
  "Utility Bill",
  "Tax ID",
  "Other",
];

const KYC_STATUS_LABEL: Record<string, string> = {
  Pending: "Pending Employee Review",
  "Under Review (Admin)": "Under Review By Admin",
  Verified: "Verified",
  Rejected: "Rejected",
};

function getStatusChipColor(status: string): "warning" | "info" | "success" | "error" | "default" {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("pending")) return "warning";
  if (normalized.includes("under review")) return "info";
  if (normalized.includes("verified")) return "success";
  if (normalized.includes("reject")) return "error";
  return "default";
}

export default function CustomerKyc() {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [documentType, setDocumentType] = useState("National ID");
  const [remarks, setRemarks] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const activeRequest = useMemo(() => {
    return kycRequests.find((item) => {
      const status = String(item.status || "").toLowerCase();
      return status.includes("pending") || status.includes("under review");
    });
  }, [kycRequests]);

  const loadKycRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/users/me/kyc");
      setKycRequests(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load your KYC requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKycRequests();
  }, []);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setSelectedFiles((prev) => {
      const merged = [...prev, ...files];
      if (merged.length > 10) {
        setError("You can upload up to 10 files.");
      }
      return merged.slice(0, 10);
    });

    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submitKyc = async () => {
    if (selectedFiles.length === 0) {
      setError("Select at least one document file from your device.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("documentType", documentType);
      if (remarks.trim()) {
        formData.append("remarks", remarks.trim());
      }
      selectedFiles.forEach((file) => {
        formData.append("documents", file);
      });

      await api.post("/users/me/kyc", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("KYC request submitted successfully.");
      setRemarks("");
      setSelectedFiles([]);
      await loadKycRequests();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit KYC request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: "grid", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VerifiedUserIcon color="primary" />
          KYC Document Submission
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Submit your identity documents for verification by employee and admin reviewers.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}

      {activeRequest && (
        <Alert severity="info">
          You already have an active KYC request: <strong>{KYC_STATUS_LABEL[activeRequest.status] || activeRequest.status}</strong>.
          You can submit another request after this one is completed.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            New KYC Request
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            Select files directly from your device. Employees and admins will review and download these files from the dashboard.
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              select
              label="Primary Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={Boolean(activeRequest) || submitting}
            >
              {DOCUMENT_TYPES.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={Boolean(activeRequest) || submitting}
              placeholder="Any context for reviewers"
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={Boolean(activeRequest) || submitting || selectedFiles.length >= 10}
            >
              Choose Documents
              <input
                hidden
                type="file"
                multiple
                onChange={handleFileSelection}
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
            </Button>

            {selectedFiles.length > 0 && (
              <Stack spacing={1}>
                {selectedFiles.map((file, index) => (
                  <Card key={`${file.name}-${index}`} variant="outlined" sx={{ p: 1.25 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                      <Box>
                        <Typography fontWeight={600}>{file.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => removeSelectedFile(index)}
                        disabled={Boolean(activeRequest) || submitting}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={submitKyc}
                disabled={Boolean(activeRequest) || submitting}
              >
                {submitting ? "Uploading..." : "Submit KYC"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            KYC Request History
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : kycRequests.length === 0 ? (
            <Typography color="text.secondary">No KYC request submitted yet.</Typography>
          ) : (
            <Stack spacing={1.25}>
              {kycRequests.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    flexDirection: { xs: "column", md: "row" },
                    gap: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1.5,
                    p: 1.5,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>{item.documentType || "Document Set"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submitted: {new Date(item.createdAt).toLocaleString()}
                    </Typography>
                    {item.remarks && (
                      <Typography variant="body2" color="text.secondary">
                        Remarks: {item.remarks}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={KYC_STATUS_LABEL[item.status] || item.status}
                    color={getStatusChipColor(item.status)}
                    size="small"
                  />
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
