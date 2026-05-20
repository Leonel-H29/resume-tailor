// Domain Service Interface (Port)
import type { Resume } from '../entities/Resume';
import type { JobDescription } from '../entities/JobDescription';
import type { GenerationBundle } from '../entities/GenerationBundle';
import type { EmailTone } from '../entities/ApplicationEmail';

/**
 * Per-output language overrides.
 * Each key is an ISO-639-1 code, "auto", or "en" (default).
 * Falls back to "en" for any key that is absent.
 */
export interface LanguageOptions {
  resume?: string;
  coverLetter?: string;
  answers?: string;
  email?: string;
  dm?: string;
}

export interface OptimizationOptions {
  /** Per-output language overrides — replaces the old single targetLanguage */
  languages?: LanguageOptions;

  preserveStructure?: boolean;
  emphasizeKeywords?: boolean;

  // ── Optional output flags ───────────────────────────────────────────────
  generateCoverLetter?: boolean;
  applicationQuestions?: string;

  generateApplicationEmail?: boolean;
  recipientName?: string;
  /** Extra context/clarifications the user wants injected into the email */
  emailAdditionalInfo?: string;
  /** Writing tone for the application email */
  emailTone?: EmailTone;

  generateDirectMessage?: boolean;
  /** Extra context for the DM */
  dmAdditionalInfo?: string;
}

export interface IResumeOptimizationService {
  /**
   * Returns a GenerationBundle from a single API call.
   * All optional outputs are produced in the same request as the resume.
   */
  optimize(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions
  ): Promise<GenerationBundle>;
}
