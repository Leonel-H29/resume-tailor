// Domain Entity: GenerationBundle
// Aggregates all outputs from a single generation request.
// Keeping cover letter and answers as separate entities preserves
// single-responsibility and makes each independently testable / replaceable.

import type { OptimizedResume } from './OptimizedResume';
import type { CoverLetter } from './CoverLetter';
import type { ApplicationAnswers } from './ApplicationAnswers';

export interface GenerationBundle {
  /** Always present — the core optimized resume */
  resume: OptimizedResume;

  /** Present only when the user requested cover letter generation */
  coverLetter?: CoverLetter;

  /** Present only when the user provided application questions */
  applicationAnswers?: ApplicationAnswers;
}
