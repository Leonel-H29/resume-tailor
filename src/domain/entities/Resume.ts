// Domain Entity: Resume
// Represents the raw resume input from the user

export interface Resume {
  rawText: string;
  fileName?: string;
  fileType?: "pdf" | "text";
  uploadedAt?: Date;
}

export function createResume(
  rawText: string,
  fileName?: string,
  fileType?: "pdf" | "text"
): Resume {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Resume content cannot be empty");
  }
  if (rawText.trim().length < 50) {
    throw new Error("Resume content is too short to process");
  }
  return {
    rawText: rawText.trim(),
    fileName,
    fileType,
    uploadedAt: new Date(),
  };
}
