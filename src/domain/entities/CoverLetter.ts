// Domain Entity: CoverLetter
// Pure data — zero framework dependencies.

export interface CoverLetter {
  /** e.g. "Dear Hiring Manager," */
  salutation: string;
  /** Hook paragraph — role statement and strongest relevant achievement */
  opening: string;
  /** 1-2 body paragraphs connecting candidate background to role requirements */
  body: string[];
  /** Call to action + thank-you */
  closing: string;
  /** e.g. "Sincerely," */
  signOff: string;
  candidateName: string;
  /** ISO language code matching requested output language */
  language: string;
}

import type { JsonValue } from '@/domain/types/JsonValue';
import { isJsonObject } from '@/domain/types/JsonValue';

export function validateCoverLetter(data: JsonValue): CoverLetter {
  if (!isJsonObject(data)) {
    throw new Error('Generated cover letter payload is not a valid object');
  }
  const letter = JSON.parse(JSON.stringify(data)) as CoverLetter;
  if (!letter.opening?.trim())
    throw new Error('Generated cover letter is missing the opening paragraph');
  if (!letter.body || letter.body.length === 0)
    throw new Error('Generated cover letter is missing body paragraphs');
  if (!letter.candidateName?.trim())
    throw new Error('Generated cover letter is missing candidate name');
  return letter;
}
