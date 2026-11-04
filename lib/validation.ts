/**
 * Validation shared by the browser (friendly, instant errors) and /api/upload (the real gate).
 */
import { site } from "@/content/site";

const { upload } = site;

export type FileLike = { name: string; size: number; type: string };

export type FileCheck =
  | { ok: true; ext: string }
  | { ok: false; reason: "type" | "size" | "empty"; message: string };

const GENERIC_TYPES = ["", "application/octet-stream", "application/zip", "application/x-zip-compressed"];

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function checkResumeFile(file: FileLike): FileCheck {
  const ext = fileExtension(file.name);
  // Browsers and phones often label .docx vaguely (empty, octet-stream, zip), so the extension is the
  // source of truth here; the server also checks the file's real bytes.
  const typeOk = upload.extensions.includes(ext) && (GENERIC_TYPES.includes(file.type) || upload.mimeTypes.includes(file.type));
  if (!typeOk) return { ok: false, reason: "type", message: upload.errors.wrongType(ext) };
  if (file.size === 0) return { ok: false, reason: "empty", message: upload.errors.empty };
  if (file.size > upload.maxBytes) {
    return { ok: false, reason: "size", message: upload.errors.tooBig(formatBytes(file.size)) };
  }
  return { ok: true, ext };
}
