// Domain Entity: CoverLetter
// Represents an AI-generated cover letter tailored to a specific job

export interface CoverLetter {
  /** Recipient greeting, e.g. "Dear Hiring Manager," */
  salutation: string;

  /** Opening paragraph: hooks the reader and states the role */
  opening: string;

  /** 1–2 body paragraphs: connects candidate background to role requirements */
  body: string[];

  /** Closing paragraph: call to action + thank-you */
  closing: string;

  /** Sign-off line, e.g. "Sincerely," */
  signOff: string;

  /** Full name of the candidate */
  candidateName: string;

  /** ISO language code matching the requested output language */
  language: string;
}

export function validateCoverLetter(data: unknown): CoverLetter {
  const letter = data as CoverLetter;
  if (!letter.opening || letter.opening.length < 10) {
    throw new Error('Generated cover letter is missing the opening paragraph');
  }
  if (!letter.body || letter.body.length === 0) {
    throw new Error('Generated cover letter is missing body paragraphs');
  }
  return letter;
}
