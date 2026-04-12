import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import employeeService from "../../services/employeeService";
import { KycRequest } from "../../types";

interface ParsedKycDocument {
  id: string;
  type: string;
  filePath: string;
  fileName: string;
}

const parseKycDocuments = (documentRef?: string | null): ParsedKycDocument[] => {
  if (!documentRef) return [];

  let parsed: unknown = documentRef;
  try {
    parsed = JSON.parse(documentRef);
  } catch {
    return [];
  }

  const normalizeDocument = (item: Record<string, unknown>, index: number): ParsedKycDocument | null => {
    const filePath = typeof item.filePath === "string" ? item.filePath : "";
    if (!filePath) return null;
    const fileName = typeof item.fileName === "string"
      ? item.fileName
      : filePath.split("/").filter(Boolean).pop() || `document-${index + 1}`;
    return {
      id: typeof item.id === "string" ? item.id : `${fileName}-${index}`,
      type: typeof item.type === "string" ? item.type : "Document",
      filePath,
      fileName,
    };
  };

  if (Array.isArray(parsed)) {
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map(normalizeDocument)
      .filter((doc): doc is ParsedKycDocument => Boolean(doc));
  }

  if (parsed && typeof parsed === "object") {
    const data = parsed as Record<string, unknown>;
    if (Array.isArray(data.documents)) {
      return data.documents
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map(normalizeDocument)
        .filter((doc): doc is ParsedKycDocument => Boolean(doc));
    }
  }

  return [];
};

const buildDocumentUrl = (filePath: string): string => {
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const normalized = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `http://localhost:3000${normalized}`;
};

export default function EmployeeKyc() {
  const [rows, setRows] = useState<KycRequest[]>([]);
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await employeeService.getKyc(status);
      setRows(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load KYC records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const verify = async (id: number) => {
    try {
      setError("");
      await employeeService.verifyKyc(id, remarks[id] || "");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to forward KYC to admin");
    }
  };

  return (
    <Box>
      <Card sx={{ border: "1px solid", borderColor: "divider", mb: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>KYC Verification System</Typography>
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 240 }}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Under Review (Admin)">Under Review (Admin)</MenuItem>
            <MenuItem value="Verified">Verified</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
          )}
        </CardContent>
      </Card>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          {loading ? (
            <Typography color="text.secondary">Loading KYC data...</Typography>
          ) : rows.length === 0 ? (
            <Typography color="text.secondary">No KYC requests found for this status.</Typography>
          ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Document</TableCell>
                <TableCell>Files</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.user?.name || row.userId}</TableCell>
                  <TableCell>{row.documentType || "-"}</TableCell>
                  <TableCell>
                    {parseKycDocuments(row.documentRef).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No files</Typography>
                    ) : (
                      <Stack spacing={0.75}>
                        {parseKycDocuments(row.documentRef).map((doc) => (
                          <Button
                            key={doc.id}
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(buildDocumentUrl(doc.filePath), "_blank", "noopener,noreferrer")}
                          >
                            Download {doc.fileName}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={remarks[row.id] || ""}
                      onChange={(e) => setRemarks((s) => ({ ...s, [row.id]: e.target.value }))}
                      placeholder="Remarks"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => verify(row.id)}
                      disabled={String(row.status).toLowerCase() !== "pending"}
                    >
                      Forward to Admin
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
