// Application Use-Case: generateResume
// Depends only on domain interfaces — never imports infrastructure.

import type { IResumeOptimizationService, OptimizationOptions } from '@/domain/services/IResumeOptimizationService';
import type { OptimizedResume } from '@/domain/entities/OptimizedResume';
import type { CoverLetter } from '@/domain/entities/CoverLetter';
import type { ApplicationAnswers } from '@/domain/entities/ApplicationAnswers';
import type { ApplicationEmail } from '@/domain/entities/ApplicationEmail';
import { createResume } from '@/domain/entities/Resume';
import { createJobDescription } from '@/domain/entities/JobDescription';

export interface GenerateResumeInput {
  resumeText: string;
  resumeFileName?: string;
  resumeFileType?: 'pdf' | 'text';
  jobDescriptionText: string;
  jobTitle?: string;
  company?: string;
  /** ISO-639-1 | "auto" | "en" (default) — applied to ALL outputs */
  languagePreference?: string;
  generateCoverLetter?: boolean;
  /** Newline-separated questions from the company application form */
  applicationQuestions?: string;
  generateApplicationEmail?: boolean;
  recipientName?: string;
}

export interface GenerateResumeOutput {
  success: boolean;
  optimizedResume?: OptimizedResume;
  coverLetter?: CoverLetter;
  applicationAnswers?: ApplicationAnswers;
  applicationEmail?: ApplicationEmail;
  error?: string;
}

export class GenerateResumeUseCase {
  constructor(private readonly optimizationService: IResumeOptimizationService) {}

  async execute(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
    try {
      const resume = createResume(input.resumeText, input.resumeFileName, input.resumeFileType);
      const jobDescription = createJobDescription(input.jobDescriptionText, input.jobTitle, input.company);

      const options: OptimizationOptions = {
        targetLanguage: input.languagePreference ?? 'en',
        preserveStructure: true,
        emphasizeKeywords: true,
        generateCoverLetter: input.generateCoverLetter ?? false,
        applicationQuestions: input.applicationQuestions?.trim() || undefined,
        generateApplicationEmail: input.generateApplicationEmail ?? false,
        recipientName: input.recipientName?.trim() || undefined,
      };

      const bundle = await this.optimizationService.optimize(resume, jobDescription, options);

      return {
        success: true,
        optimizedResume: bundle.resume,
        coverLetter: bundle.coverLetter,
        applicationAnswers: bundle.applicationAnswers,
        applicationEmail: bundle.applicationEmail,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
