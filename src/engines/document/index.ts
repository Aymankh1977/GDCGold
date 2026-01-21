import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import type { Document, DocumentCategory } from "@/types";

// Configure PDF.js worker (Vite-friendly)
try {
  // @ts-expect-error - pdfjs typing differences across builds
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} catch {
  // If this fails in some environments, pdfjs may still work with a default worker setup.
}

type SupportedDocType = Document["type"];

function inferDocType(file: File): SupportedDocType {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc";
  // Fallback (keeps app running). You can hard-reject if you prefer.
  return "pdf";
}

function now(): Date {
  return new Date();
}

function safeString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function safeNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function safeDate(v: unknown): Date {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return now();
}

function generateId(): string {
  // Crypto when available; otherwise deterministic-enough fallback.
  // (IDs are local-only; no security claim.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;
  if (g?.crypto?.randomUUID) return g.crypto.randomUUID();
  return "doc_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

export async function extractTextFromFile(file: File): Promise<{
  extractedText: string;
  pages?: number;
  metadata?: Record<string, unknown>;
}> {
  const type = inferDocType(file);

  if (type === "pdf") {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-expect-error - pdfjs typing differences
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const numPages: number = pdf.numPages || 0;
    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = (textContent as any).items || [];
      const pageText = items
        .map((it: { str?: string }) => (it?.str ? String(it.str) : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      fullText += "\n[PAGE " + i + "]\n" + pageText;
    }

    let info: Record<string, unknown> | undefined;
    try {
      const meta = await pdf.getMetadata();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      info = (meta as any)?.info as Record<string, unknown> | undefined;
    } catch {
      // ignore
    }

    return {
      extractedText: fullText.trim(),
      pages: numPages,
      metadata: info,
    };
  }

  // DOCX / DOC
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const cleaned = String(result.value || "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return {
    extractedText: cleaned,
    metadata: { messages: result.messages },
  };
}

/**
 * Canonical Document factory — the ONLY place we create Document objects.
 * Always returns a fully valid Document that matches "@/types".
 */
export function createDocument(args: {
  file: File;
  category: DocumentCategory;
  extractedText: string;
  pages?: number;
  metadata?: Record<string, unknown>;
}): Document {
  const { file, category, extractedText, pages, metadata } = args;

  return {
    id: generateId(),
    name: file.name,
    type: inferDocType(file),
    size: file.size,
    uploadedAt: now(),
    content: "", // reserved for future (e.g., raw text, OCR, etc.)
    extractedText: extractedText || "",
    metadata: {
      pages,
      // best-effort (avoid hard assumptions)
      // author/createdDate/modifiedDate/keywords can be filled later
      ...(metadata || {}),
    } as Document["metadata"],
    status: "completed",
    category,
  };
}

/**
 * Backwards-compatible API used by your pages:
 * - Documents.tsx calls processFile(file, category)
 */
export async function processFile(
  file: File,
  category: DocumentCategory = "other"
): Promise<{ document: Document }> {
  const extracted = await extractTextFromFile(file);
  const document = createDocument({
    file,
    category,
    extractedText: extracted.extractedText,
    pages: extracted.pages,
    metadata: extracted.metadata,
  });
  return { document };
}
