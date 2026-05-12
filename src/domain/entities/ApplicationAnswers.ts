// Domain Entity: ApplicationAnswers
// Represents AI-generated answers to company application questions

export interface ApplicationAnswer {
  /** The original question as provided by the user */
  question: string;

  /** A natural, professional, context-aware answer grounded in the candidate's background */
  answer: string;
}

export interface ApplicationAnswers {
  answers: ApplicationAnswer[];

  /** ISO language code matching the requested output language */
  language: string;
}

export function validateApplicationAnswers(data: unknown): ApplicationAnswers {
  const result = data as ApplicationAnswers;
  if (!result.answers || result.answers.length === 0) {
    throw new Error('Generated application answers are empty');
  }
  for (const item of result.answers) {
    if (!item.question || !item.answer) {
      throw new Error('A generated application answer is missing a question or answer field');
    }
  }
  return result;
}
