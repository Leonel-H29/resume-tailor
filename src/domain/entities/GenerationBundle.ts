// Domain Entity: GenerationBundle
// Aggregates all outputs from a single generation request.
// resume is always present; all other fields are optional.

import type { OptimizedResume } from './OptimizedResume';
import type { CoverLetter } from './CoverLetter';
import type { ApplicationAnswers } from './ApplicationAnswers';
import type { ApplicationEmail } from './ApplicationEmail';
import type { DirectMessage } from './DirectMessage';

export interface GenerationBundle {
  resume: OptimizedResume;
  coverLetter?: CoverLetter;
  applicationAnswers?: ApplicationAnswers;
  applicationEmail?: ApplicationEmail;
  directMessage?: DirectMessage;
}
