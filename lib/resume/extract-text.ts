import mammoth from "mammoth";
import path from "node:path";
import { pathToFileURL } from "node:url";
// pdf-parse is imported dynamically so we can polyfill DOMMatrix before
// pdfjs-dist (its dependency) evaluates. Node.js 18 (Vercel default) does
// not include DOMMatrix; a static import would crash at module load time.

type PdfParseModule = typeof import("pdf-parse");

const SUPPORTED_TYPES = new Set([
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

async function loadPdfParse(): Promise<PdfParseModule> {
  // pdfjs-dist references DOMMatrix at module evaluation; provide a minimal
  // stub for Node.js 18 which does not include this browser API.
  if (typeof globalThis.DOMMatrix === "undefined") {
    (globalThis as Record<string, unknown>).DOMMatrix = class {};
  }
  const mod = await import("pdf-parse");
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  );
  mod.PDFParse.setWorker(pathToFileURL(workerPath).href);
  return mod;
}

export async function extractResumeText(file: File) {
  const extension = getExtension(file.name);

  if (extension === "doc") {
    throw new Error("Legacy .doc files are not supported. Upload .txt, .pdf, or .docx.");
  }

  if (!SUPPORTED_TYPES.has(file.type) && !["txt", "pdf", "docx"].includes(extension)) {
    throw new Error("Unsupported resume format. Upload a .txt, .pdf, or .docx file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === "txt" || file.type === "text/plain") {
    return buffer.toString("utf8").trim();
  }

  if (extension === "pdf" || file.type === "application/pdf") {
    const { PDFParse } = await loadPdfParse();
    const parser = new PDFParse({ data: buffer });

    try {
      const parsed = await parser.getText();
      return parsed.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  if (
    extension === "docx" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value.trim();
  }

  throw new Error("Unsupported resume format. Upload a .txt, .pdf, or .docx file.");
}
