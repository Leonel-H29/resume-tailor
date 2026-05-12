// Domain Entity: GenerationBundle
// Aggregates all outputs from a single generation request.
// resume is always present; all other fields are optional and only
// populated when explicitly requested — keeping the port signature stable
// as new optional outputs are added in the future.

import type { OptimizedResume } from './OptimizedResume';
import type { CoverLetter } from './CoverLetter';
import type { ApplicationAnswers } from './ApplicationAnswers';
import type { ApplicationEmail } from './ApplicationEmail';

export interface GenerationBundle {
  resume: OptimizedResume;
  coverLetter?: CoverLetter;
  applicationAnswers?: ApplicationAnswers;
  applicationEmail?: ApplicationEmail;
}
