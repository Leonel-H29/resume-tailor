// Domain Entity: DirectMessage
// A short recruiter/hiring-manager DM (≤250 chars).
// Pure data — zero framework dependencies.

export interface DirectMessage {
  /** The message body — enforced ≤250 characters */
  message: string;
  /** ISO language code matching the requested output language */
  language: string;
}

import type { JsonValue } from '@/domain/types/JsonValue';
import { isJsonObject } from '@/domain/types/JsonValue';

export function validateDirectMessage(data: JsonValue): DirectMessage {
  if (!isJsonObject(data)) {
    throw new Error('Generated direct message payload is not a valid object');
  }
  const dm = JSON.parse(JSON.stringify(data)) as DirectMessage;
  if (!dm.message?.trim())
    throw new Error('Generated direct message is empty');
  if (dm.message.trim().length > 300)
    throw new Error('Generated direct message exceeds the 300-character safety limit');
  return { ...dm, message: dm.message.trim() };
}
