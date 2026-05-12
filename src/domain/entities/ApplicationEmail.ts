// Domain Entity: ApplicationEmail
// Pure data — zero framework dependencies.

export interface ApplicationEmail {
  /** Ready-to-use subject line, e.g. "Application for Senior Engineer – Jane Doe" */
  subject: string;
  /** e.g. "Dear Hiring Manager," or "Dear Ms. Smith," */
  salutation: string;
  /**
   * Email body as discrete paragraphs:
   *   [0] Opening — role + hook
   *   [1] Body    — 2-3 relevant achievements
   *   [2] Closing — enthusiasm + CTA
   */
  paragraphs: string[];
  /** e.g. "Best regards," */
  signOff: string;
  senderName: string;
  senderEmail: string;
  /** ISO language code matching requested output language */
  language: string;
}

export function validateApplicationEmail(data: unknown): ApplicationEmail {
  const email = data as ApplicationEmail;
  if (!email.subject?.trim())
    throw new Error('Generated application email is missing a subject line');
  if (!email.paragraphs || email.paragraphs.length < 2)
    throw new Error('Generated application email must contain at least 2 paragraphs');
  if (!email.senderName?.trim())
    throw new Error('Generated application email is missing the sender name');
  return {
    ...email,
    paragraphs: email.paragraphs.filter(p => p?.trim().length > 0),
  };
}
