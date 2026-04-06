import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { KycRequest } from "../../types";
import kycService, { KycSubmissionPayload } from "../../services/kycService";

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

// Client-side validation matching backend Zod schema exactly
const submitKycSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  dob: z.string().trim().min(4).max(40),
  address: z.string().trim().min(5).max(255),
  nationalId: z.string().trim().min(3).max(80).optional().nullable(),
  passportNumber: z.string().trim().min(3).max(80).optional().nullable(),
  country: z.string().trim().min(2).max(80),
  transactionIntent: z.string().trim().min(3).max(255),
  idDocument: z.object({
    name: z.string().trim().min(1),
    dataUrl: z.string().min(20), // Base64 data URL minimum length
  }),
  addressDocument: z.object({
    name: z.string().trim().min(1),
    dataUrl: z.string().min(20),
  }),
});

const emptyForm = {
  fullName: "",
  dob: "",
  address: "",
  nationalId: "",
  passportNumber: "",
  country: "",
  transactionIntent: "",
};

export default function CustomerKyc() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [currentKyc, setCurrentKyc] = useState<KycRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // New: Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const current = await kycService.getMyKyc();
        setCurrentKyc(current);
        if (current?.profile) {
          setForm((prev) => ({
            ...prev,
            fullName: current.profile?.fullName || current.fullName || prev.fullName,
            dob: current.profile?.dob || current.dob || prev.dob,
            address: current.profile?.address || current.user?.address || prev.address,
            nationalId: current.profile?.nationalId || current.user?.nationalId || prev.nationalId,
            passportNumber: current.profile?.passportNumber || prev.passportNumber,
            country: current.profile?.country || current.country || prev.country,
            transactionIntent: current.profile?.transactionIntent || current.transactionIntent || prev.transactionIntent,
          }));
        } else if (user) {
          setForm((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName,
            address: user.address || prev.address,
            nationalId: user.nationalId || prev.nationalId,
          }));
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load your KYC status.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const statusBadge = useMemo(() => {
    const status = currentKyc?.status || "Not Submitted";
    if (status === "Verified") return <Chip color="success" label="Verified" />;
    if (status === "Rejected") return <Chip color="error" label="Rejected" />;
    if (status === "Pending") return <Chip color="warning" label="Pending Review" />;
    return <Chip label="Not Submitted" />;
  }, [currentKyc]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setFieldErrors({});

    // Client-side validation first
    if (!idFile || !addressFile) {
      setError("Please upload both an identity document and a proof of address.");
      return;
    }

    try {
      const [idDocument, addressDocument] = await Promise.all([
        readFileAsDataUrl(idFile),
        readFileAsDataUrl(addressFile),
      ]);

      const payload: KycSubmissionPayload = {
        fullName: form.fullName.trim(),
        dob: form.dob.trim(),
        address: form.address.trim(),
        nationalId: form.nationalId?.trim() || undefined,
        passportNumber: form.passportNumber?.trim() || undefined,
        country: form.country.trim(),
        transactionIntent: form.transactionIntent.trim(),
        idDocument: { name: idFile.name, dataUrl: idDocument },
        addressDocument: { name: addressFile.name, dataUrl: addressDocument },
      };

      // Validate against backend schema BEFORE API call
      const validation = submitKycSchema.safeParse(payload);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          errors[path] = issue.message;
        });
        setFieldErrors(errors);
        setError("Please fix the errors below before submitting.");
        return;
      }

      // All good - proceed with API
      setSubmitting(true);
      const response = await kycService.submitKyc(payload);
      setCurrentKyc(response);
      setMessage("Your KYC submission has been sent for review.");
      // Reset form
      setIdFile(null);
      setAddressFile(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to submit KYC.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          KYC Verification
        </Typography>
        <Typography color="text.secondary">
          Submit your identity documents so we can verify your account securely.
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <CloudUploadIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Submit KYC
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload a valid identity document and proof of address.
                  </Typography>
                </Box>
              </Stack>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                      error={!!fieldErrors.fullName}
                      helperText={fieldErrors.fullName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date of Birth"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!!fieldErrors.dob}
                      helperText={fieldErrors.dob}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      required
                      multiline
                      minRows={2}
                      error={!!fieldErrors.address}
                      helperText={fieldErrors.address}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="National ID or Passport"
                      value={form.nationalId}
                      onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                      error={!!fieldErrors.nationalId}
                      helperText={fieldErrors.nationalId}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      required
                      error={!!fieldErrors.country}
                      helperText={fieldErrors.country}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Transaction Intent"
                      placeholder="Why are you opening or using this account?"
                      value={form.transactionIntent}
                      onChange={(e) => setForm({ ...form, transactionIntent: e.target.value })}
                      required
                      multiline
                      minRows={3}
                      error={!!fieldErrors.transactionIntent}
                      helperText={fieldErrors.transactionIntent}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      startIcon={<DescriptionIcon />}
                      sx={{ py: 1.5 }}
                      disabled={submitting}
                    >
                      Upload ID Document {idFile ? `(${idFile.name})` : ""}
                      <input
                        hidden
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      {idFile ? idFile.name : "PNG, JPG, WEBP, or PDF up to 5MB"}
                    </Typography>
                    {fieldErrors["idDocument.name"] && (
                      <Typography variant="caption" color="error" sx={{ display: "block" }}>
                        {fieldErrors["idDocument.name"]}
                      </Typography>
                    )}
                    {fieldErrors["idDocument.dataUrl"] && (
                      <Typography variant="caption" color="error" sx={{ display: "block" }}>
                        {fieldErrors["idDocument.dataUrl"]}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      startIcon={<DescriptionIcon />}
                      sx={{ py: 1.5 }}
                      disabled={submitting}
                    >
                      Upload Proof of Address {addressFile ? `(${addressFile.name})` : ""}
                      <input
                        hidden
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setAddressFile(e.target.files?.[0] || null)}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      {addressFile ? addressFile.name : "Utility bill, bank statement, or similar"}
                    </Typography>
                    {fieldErrors["addressDocument.name"] && (
                      <Typography variant="caption" color="error" sx={{ display: "block" }}>
                        {fieldErrors["addressDocument.name"]}
                      </Typography>
                    )}
                    {fieldErrors["addressDocument.dataUrl"] && (
                      <Typography variant="caption" color="error" sx={{ display: "block" }}>
                        {fieldErrors["addressDocument.dataUrl"]}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting || !idFile || !addressFile}
                      fullWidth
                      startIcon={<VerifiedUserIcon />}
                    >
                      {submitting ? "Submitting..." : "Submit KYC"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={3}>
            <Card sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <SecurityIcon color="primary" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Submission Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current verification state
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    {statusBadge}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Risk Level</Typography>
                    <Chip
                      label={currentKyc?.riskLevel || "Not calculated"}
                      color={currentKyc?.riskLevel === "Low" ? "success" : currentKyc?.riskLevel === "High" ? "error" : "warning"}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Submitted At</Typography>
                    <Typography variant="body1">
                      {currentKyc?.submittedDate ? new Date(currentKyc.submittedDate).toLocaleString() : "Not submitted yet"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Remarks</Typography>
                    <Typography variant="body1">
                      {currentKyc?.remarks || "No review comments yet"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  What Happens Next
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    "Our compliance team reviews the documents.",
                    "You will receive an email when the decision is made.",
                    "Approved accounts remain active; rejected submissions can be corrected and resubmitted.",
                  ].map((item) => (
                    <Box key={item} sx={{ display: "flex", gap: 1.5 }}>
                      <Box sx={{ mt: 0.75, width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
                      <Typography variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

