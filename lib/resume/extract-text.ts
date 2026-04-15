import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SUPPORTED_TYPES = new Set([
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function configurePdfWorker() {
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  );

  PDFParse.setWorker(pathToFileURL(workerPath).href);
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
    configurePdfWorker();
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
