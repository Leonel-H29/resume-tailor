// Domain Entity: ApplicationAnswers
// Pure data — zero framework dependencies.

export interface ApplicationAnswer {
  /** The original question as provided by the user */
  question: string;
  /** Natural, professional answer grounded strictly in the candidate's background */
  answer: string;
}

export interface ApplicationAnswers {
  answers: ApplicationAnswer[];
  /** ISO language code matching requested output language */
  language: string;
}

export function validateApplicationAnswers(data: unknown): ApplicationAnswers {
  const result = data as ApplicationAnswers;
  if (!result.answers || result.answers.length === 0)
    throw new Error('Generated application answers are empty');
  for (const item of result.answers) {
    if (!item.question || !item.answer)
      throw new Error('A generated answer is missing its question or answer field');
  }
  return result;
}
