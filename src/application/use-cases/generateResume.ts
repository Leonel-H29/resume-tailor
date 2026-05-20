// Application Use-Case: generateResume
// Depends only on domain interfaces — never imports infrastructure.

import type { IResumeOptimizationService, OptimizationOptions, LanguageOptions } from '@/domain/services/IResumeOptimizationService';
import type { OptimizedResume } from '@/domain/entities/OptimizedResume';
import type { CoverLetter } from '@/domain/entities/CoverLetter';
import type { ApplicationAnswers } from '@/domain/entities/ApplicationAnswers';
import type { ApplicationEmail } from '@/domain/entities/ApplicationEmail';
import type { DirectMessage } from '@/domain/entities/DirectMessage';
import type { EmailTone } from '@/domain/entities/ApplicationEmail';
import { createResume } from '@/domain/entities/Resume';
import { createJobDescription } from '@/domain/entities/JobDescription';

export interface GenerateResumeInput {
  resumeText: string;
  resumeFileName?: string;
  resumeFileType?: 'pdf' | 'text';
  jobDescriptionText: string;
  jobTitle?: string;
  company?: string;

  /** Per-output language map — each value is ISO-639-1 | "auto" | "en" */
  languages?: LanguageOptions;

  generateCoverLetter?: boolean;
  applicationQuestions?: string;

  generateApplicationEmail?: boolean;
  recipientName?: string;
  emailAdditionalInfo?: string;
  emailTone?: EmailTone;

  generateDirectMessage?: boolean;
  dmAdditionalInfo?: string;
}

export interface GenerateResumeOutput {
  success: boolean;
  optimizedResume?: OptimizedResume;
  coverLetter?: CoverLetter;
  applicationAnswers?: ApplicationAnswers;
  applicationEmail?: ApplicationEmail;
  directMessage?: DirectMessage;
  error?: string;
}

export class GenerateResumeUseCase {
  constructor(private readonly optimizationService: IResumeOptimizationService) {}

  async execute(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
    try {
      const resume = createResume(input.resumeText, input.resumeFileName, input.resumeFileType);
      const jobDescription = createJobDescription(input.jobDescriptionText, input.jobTitle, input.company);

      const options: OptimizationOptions = {
        languages: input.languages ?? { resume: 'en' },
        preserveStructure: true,
        emphasizeKeywords: true,
        generateCoverLetter: input.generateCoverLetter ?? false,
        applicationQuestions: input.applicationQuestions?.trim() || undefined,
        generateApplicationEmail: input.generateApplicationEmail ?? false,
        recipientName: input.recipientName?.trim() || undefined,
        emailAdditionalInfo: input.emailAdditionalInfo?.trim() || undefined,
        emailTone: input.emailTone ?? 'professional',
        generateDirectMessage: input.generateDirectMessage ?? false,
        dmAdditionalInfo: input.dmAdditionalInfo?.trim() || undefined,
      };

      const bundle = await this.optimizationService.optimize(resume, jobDescription, options);

      return {
        success: true,
        optimizedResume: bundle.resume,
        coverLetter: bundle.coverLetter,
        applicationAnswers: bundle.applicationAnswers,
        applicationEmail: bundle.applicationEmail,
        directMessage: bundle.directMessage,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
