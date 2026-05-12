// Infrastructure: Resume Parser
// Handles extraction of text from PDF and text-based resumes

export interface ParsedFile {
  text: string;
  fileType: "pdf" | "text";
  fileName: string;
  charCount: number;
}

export async function parseResumeFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedFile> {
  const fileType = mimeType === "application/pdf" ? "pdf" : "text";

  if (fileType === "pdf") {
    return parsePDF(buffer, fileName);
  } else {
    return parseText(buffer, fileName);
  }
}

async function parsePDF(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  try {
    // Dynamic import to avoid issues with Next.js bundling
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error(
        "Could not extract text from PDF. The file may be scanned or image-based."
      );
    }

    const cleanedText = cleanExtractedText(data.text);

    return {
      text: cleanedText,
      fileType: "pdf",
      fileName,
      charCount: cleanedText.length,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Could not extract")) {
      throw error;
    }
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function parseText(buffer: Buffer, fileName: string): ParsedFile {
  const text = buffer.toString("utf-8");
  const cleanedText = cleanExtractedText(text);

  return {
    text: cleanedText,
    fileType: "text",
    fileName,
    charCount: cleanedText.length,
  };
}

function cleanExtractedText(text: string): string {
  return text
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove null bytes and control chars (except newlines/tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse 3+ blank lines to 2
    .replace(/\n{3,}/g, "\n\n")
    // Remove leading/trailing whitespace per line
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

export function validateFileSize(
  buffer: Buffer,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB
): void {
  if (buffer.length > maxSizeBytes) {
    throw new Error(
      `File size ${(buffer.length / (1024 * 1024)).toFixed(1)}MB exceeds the ${maxSizeBytes / (1024 * 1024)}MB limit`
    );
  }
}

export function validateMimeType(mimeType: string): void {
  const allowed = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowed.includes(mimeType)) {
    throw new Error(
      `File type "${mimeType}" is not supported. Please upload a PDF or text file.`
    );
  }
}
