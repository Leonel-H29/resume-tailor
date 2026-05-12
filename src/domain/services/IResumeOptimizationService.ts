// Domain Service Interface (Port)
// Defines the contract that any AI adapter must implement.
// This keeps the domain layer free from infrastructure concerns.

import type { Resume } from '../entities/Resume';
import type { JobDescription } from '../entities/JobDescription';
import type { GenerationBundle } from '../entities/GenerationBundle';

export interface OptimizationOptions {
  /** Target output language — "auto" detects from JD, "en" is the default */
  targetLanguage?: string;

  /** Preserve the original resume section order when already ATS-friendly */
  preserveStructure?: boolean;

  /** Weight keyword injection when rewriting experience bullets */
  emphasizeKeywords?: boolean;

  // ── New optional generation flags ─────────────────────────────────────────

  /** When true, include a tailored cover letter in the bundle */
  generateCoverLetter?: boolean;

  /**
   * Raw text containing one or more application questions (newline-separated).
   * When provided, the AI will generate answers grounded in the candidate's background.
   */
  applicationQuestions?: string;
}

export interface IResumeOptimizationService {
  /**
   * Produces a GenerationBundle from a resume and job description.
   * The bundle always contains an optimized resume; cover letter and
   * application answers are included only when requested via options.
   *
   * Cost note: all requested outputs are generated in a single API call.
   */
  optimize(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions
  ): Promise<GenerationBundle>;
}
