import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type UploadedKycDocument = {
    id: string;
    type: string;
    fileName: string;
    mimeType: string;
    size: number;
    filePath: string;
};

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const KYC_ROOT = path.join(UPLOAD_ROOT, "kyc");
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
]);

export function isAllowedKycMimeType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.has(String(mimeType || "").toLowerCase());
}

export function isAllowedKycSize(size: number): boolean {
    return Number.isFinite(size) && size > 0 && size <= MAX_DOCUMENT_SIZE;
}

export async function ensureKycStorageDir(userId: number): Promise<string> {
    const dir = path.join(KYC_ROOT, `user-${userId}`);
    await fs.mkdir(dir, { recursive: true });
    return dir;
}

function sanitizeFileName(name: string): string {
    const base = path.basename(String(name || "").trim() || "document");
    return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function extensionFromMimeType(mimeType: string): string {
    switch (String(mimeType).toLowerCase()) {
        case "image/png":
            return ".png";
        case "image/jpeg":
            return ".jpg";
        case "image/webp":
            return ".webp";
        case "application/pdf":
            return ".pdf";
        default:
            return "";
    }
}

export function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
    const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/i);
    if (!match) {
        throw new Error("Invalid file payload");
    }

    const mimeType = match[1].toLowerCase();
    const buffer = Buffer.from(match[2], "base64");
    return { mimeType, buffer };
}

export async function saveKycDocument(userId: number, document: {
    type: string;
    name: string;
    dataUrl: string;
}): Promise<UploadedKycDocument> {
    const { mimeType, buffer } = parseDataUrl(document.dataUrl);

    if (!isAllowedKycMimeType(mimeType)) {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (!isAllowedKycSize(buffer.length)) {
        throw new Error("File exceeds the 5MB limit");
    }

    const dir = await ensureKycStorageDir(userId);
    const safeName = sanitizeFileName(document.name);
    const stamp = Date.now();
    const suffix = crypto.randomUUID();
    const ext = path.extname(safeName) || extensionFromMimeType(mimeType);
    const fileName = `${stamp}-${suffix}-${safeName.replace(/\.[^.]+$/, "")}${ext}`;
    const absolutePath = path.join(dir, fileName);
    await fs.writeFile(absolutePath, buffer);

    return {
        id: crypto.randomUUID(),
        type: document.type,
        fileName,
        mimeType,
        size: buffer.length,
        filePath: `/uploads/kyc/user-${userId}/${fileName}`,
    };
}

