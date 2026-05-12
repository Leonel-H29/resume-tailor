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

export function validateCoverLetter(data: unknown): CoverLetter {
  const letter = data as CoverLetter;
  if (!letter.opening?.trim())
    throw new Error('Generated cover letter is missing the opening paragraph');
  if (!letter.body || letter.body.length === 0)
    throw new Error('Generated cover letter is missing body paragraphs');
  if (!letter.candidateName?.trim())
    throw new Error('Generated cover letter is missing candidate name');
  return letter;
}
