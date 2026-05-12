// Domain Service Interface (Port)
import type { Resume } from '../entities/Resume';
import type { JobDescription } from '../entities/JobDescription';
import type { GenerationBundle } from '../entities/GenerationBundle';

export interface OptimizationOptions {
  /** "en" (default) | "auto" | ISO-639-1 code — applies to ALL outputs */
  targetLanguage?: string;
  preserveStructure?: boolean;
  emphasizeKeywords?: boolean;
  /** Include a tailored cover letter in the bundle */
  generateCoverLetter?: boolean;
  /**
   * Newline-separated application questions.
   * When provided, AI-generated answers are included in the bundle.
   */
  applicationQuestions?: string;
  /** Include a ready-to-send application email in the bundle */
  generateApplicationEmail?: boolean;
  /** Personalises the email salutation — falls back to "Hiring Manager" */
  recipientName?: string;
}

export interface IResumeOptimizationService {
  /**
   * Returns a GenerationBundle from a single API call.
   * All optional outputs are generated in the same request as the resume.
   */
  optimize(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions
  ): Promise<GenerationBundle>;
}
