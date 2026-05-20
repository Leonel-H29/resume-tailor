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

import type { JsonValue } from '@/domain/types/JsonValue';
import { isJsonObject } from '@/domain/types/JsonValue';

export function validateApplicationAnswers(data: JsonValue): ApplicationAnswers {
  if (!isJsonObject(data)) {
    throw new Error('Generated application answers payload is not a valid object');
  }
  const result = JSON.parse(JSON.stringify(data)) as ApplicationAnswers;
  if (!result.answers || result.answers.length === 0)
    throw new Error('Generated application answers are empty');
  for (const item of result.answers) {
    if (!item.question || !item.answer)
      throw new Error('A generated answer is missing its question or answer field');
  }
  return result;
}
