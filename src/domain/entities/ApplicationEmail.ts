// Domain Entity: ApplicationEmail
// Pure data — zero framework dependencies.

export type EmailTone = 'professional' | 'friendly' | 'concise';

export interface ApplicationEmail {
  subject: string;
  salutation: string;
  /**
   * [0] Opening — role + hook
   * [1] Body    — 2-3 relevant achievements
   * [2] Closing — enthusiasm + CTA
   */
  paragraphs: string[];
  signOff: string;
  senderName: string;
  senderEmail: string;
  /** URLs extracted from the resume, appended in the email footer */
  footerLinks: string[];
  /** Tone used to generate this email */
  tone: EmailTone;
  /** ISO language code */
  language: string;
}

import type { JsonValue } from '@/domain/types/JsonValue';
import { isJsonObject } from '@/domain/types/JsonValue';

export function validateApplicationEmail(data: JsonValue): ApplicationEmail {
  if (!isJsonObject(data)) {
    throw new Error('Generated application email payload is not a valid object');
  }
  const email = JSON.parse(JSON.stringify(data)) as ApplicationEmail;
  if (!email.subject?.trim())
    throw new Error('Generated application email is missing a subject line');
  if (!email.paragraphs || email.paragraphs.length < 2)
    throw new Error('Generated application email must contain at least 2 paragraphs');
  if (!email.senderName?.trim())
    throw new Error('Generated application email is missing the sender name');
  return {
    ...email,
    paragraphs: email.paragraphs.filter(p => p?.trim().length > 0),
    footerLinks: Array.isArray(email.footerLinks) ? email.footerLinks.filter(Boolean) : [],
    tone: email.tone ?? 'professional',
  };
}
