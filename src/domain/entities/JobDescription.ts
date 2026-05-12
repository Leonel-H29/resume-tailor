// Domain Entity: JobDescription
// Represents the job posting the user wants to target

export interface JobDescription {
  rawText: string;
  title?: string;
  company?: string;
  language?: string;
}

export function createJobDescription(
  rawText: string,
  title?: string,
  company?: string
): JobDescription {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Job description cannot be empty");
  }
  if (rawText.trim().length < 30) {
    throw new Error("Job description is too short to process");
  }
  return {
    rawText: rawText.trim(),
    title,
    company,
  };
}
