// Application Use-Case: generateResume
// Orchestrates the resume optimization workflow.
// Depends only on domain interfaces — never on infrastructure.

import type {
  IResumeOptimizationService,
  OptimizationOptions,
} from '@/domain/services/IResumeOptimizationService';
import type { Resume } from '@/domain/entities/Resume';
import type { JobDescription } from '@/domain/entities/JobDescription';
import type { OptimizedResume } from '@/domain/entities/OptimizedResume';
import type { CoverLetter } from '@/domain/entities/CoverLetter';
import type { ApplicationAnswers } from '@/domain/entities/ApplicationAnswers';
import { createResume } from '@/domain/entities/Resume';
import { createJobDescription } from '@/domain/entities/JobDescription';

export interface GenerateResumeInput {
  resumeText: string;
  resumeFileName?: string;
  resumeFileType?: 'pdf' | 'text';
  jobDescriptionText: string;
  jobTitle?: string;
  company?: string;

  /** ISO language code or "auto". Controls ALL outputs. Default: "en" */
  languagePreference?: string;

  /** When true, a cover letter is included in the output */
  generateCoverLetter?: boolean;

  /**
   * Newline-separated application questions from the company's form.
   * When provided, AI-generated answers are included in the output.
   */
  applicationQuestions?: string;
}

export interface GenerateResumeOutput {
  success: boolean;
  optimizedResume?: OptimizedResume;
  coverLetter?: CoverLetter;
  applicationAnswers?: ApplicationAnswers;
  error?: string;
}

export class GenerateResumeUseCase {
  constructor(
    private readonly optimizationService: IResumeOptimizationService
  ) {}

  async execute(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
    try {
      // 1. Construct and validate domain entities
      const resume: Resume = createResume(
        input.resumeText,
        input.resumeFileName,
        input.resumeFileType
      );

      const jobDescription: JobDescription = createJobDescription(
        input.jobDescriptionText,
        input.jobTitle,
        input.company
      );

      // 2. Build optimization options — language applies to ALL outputs
      const options: OptimizationOptions = {
        targetLanguage: input.languagePreference ?? 'en',
        preserveStructure: true,
        emphasizeKeywords: true,
        generateCoverLetter: input.generateCoverLetter ?? false,
        applicationQuestions: input.applicationQuestions?.trim() || undefined,
      };

      // 3. Delegate to the AI service — single call, all outputs in one bundle
      const bundle = await this.optimizationService.optimize(
        resume,
        jobDescription,
        options
      );

      return {
        success: true,
        optimizedResume: bundle.resume,
        coverLetter: bundle.coverLetter,
        applicationAnswers: bundle.applicationAnswers,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: message };
    }
  }
}
