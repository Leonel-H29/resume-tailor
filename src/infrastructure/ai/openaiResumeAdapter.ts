// Infrastructure Adapter: OpenAI Resume Optimization
// Single API call produces all requested outputs.

import OpenAI from 'openai';
import type { IResumeOptimizationService, OptimizationOptions } from '@/domain/services/IResumeOptimizationService';
import type { Resume } from '@/domain/entities/Resume';
import type { JobDescription } from '@/domain/entities/JobDescription';
import type { GenerationBundle } from '@/domain/entities/GenerationBundle';
import { validateOptimizedResume } from '@/domain/entities/OptimizedResume';
import { validateCoverLetter } from '@/domain/entities/CoverLetter';
import { validateApplicationAnswers } from '@/domain/entities/ApplicationAnswers';
import { validateApplicationEmail } from '@/domain/entities/ApplicationEmail';

// ── Base system prompt (resume always present) ─────────────────────────────

const BASE_SYSTEM_PROMPT = `You are an elite resume writer and ATS optimization expert with 15+ years of experience in recruiting and talent acquisition.

## UNIVERSAL STRICT RULES:
1. NEVER invent or hallucinate skills, experiences, companies, dates, or achievements not present in the original resume.
2. Only extract keywords and buzzwords explicitly mentioned in both the job description and resume, or clearly implied by existing experience.
3. You MAY rephrase and strengthen existing bullet points to align with the job description language.
4. You MAY reorder sections from the most relevant to the least relevant experience.
5. You MAY enhance the professional summary using language from the job description while staying truthful.
6. Ensure ALL output is ATS-friendly: standard section names, no tables, no columns, no special characters beyond common punctuation.
7. Output language for ALL human-readable text is controlled by the targetLanguage instruction. Keep JSON keys in English.

## OUTPUT FORMAT:
Respond with ONLY a valid JSON object. No markdown, no preamble.

The JSON must always contain a "resume" key:
{
  "resume": {
    "personalInfo": {
      "name": "string",
      "email": "string",
      "phone": "string | null",
      "location": "string | null",
      "linkedin": "string | null",
      "github": "string | null",
      "website": "string | null"
    },
    "summary": "2-4 sentence professional summary tailored to the role",
    "experience": [
      {
        "company": "string",
        "title": "string",
        "location": "string | null",
        "startDate": "string (e.g. Jan 2021)",
        "endDate": "string (e.g. Dec 2023 or Present)",
        "skills": ["skill1", "skill2"],
        "achievements": ["3-6 quantified bullet points per role"]
      }
    ],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "field": "string | null",
        "location": "string | null",
        "startDate": "string",
        "graduationDate": "string",
        "gpa": "string | null",
        "honors": "string | null"
      }
    ],
    "skills": [
      { "name": "Category name", "skills": ["skill1", "skill2"] }
    ],
    "certifications": [
      { "name": "string", "issuer": "string | null", "date": "string | null" }
    ],
    "projects": [
      { "name": "string", "description": "string", "technologies": ["string"], "url": "string | null" }
    ],
    "languages": [
      { "language": "string", "level": "A1 | A2 | B1 | B2 | C1 | C2 | Native" }
    ],
    "keywords": ["10-20 ATS keywords extracted from JD and incorporated"],
    "matchScore": 85,
    "language": "en",
    "changes": [
      { "section": "Summary", "description": "Rewrote to emphasize leadership and cloud architecture alignment" }
    ]
  }
}`;

// ── Optional schema fragments — appended only when requested ───────────────

const COVER_LETTER_ADDENDUM = `
The JSON must also include a "coverLetter" key:
  "coverLetter": {
    "salutation": "e.g. Dear Hiring Manager,",
    "opening": "Opening paragraph: hook + role statement drawn from the candidate's strongest relevant achievement",
    "body": [
      "Body paragraph 1: connect 2-3 concrete experiences to the role's key requirements",
      "Body paragraph 2: cultural fit / enthusiasm if inferable from JD (optional)"
    ],
    "closing": "Closing paragraph: enthusiasm + call to action",
    "signOff": "e.g. Sincerely,",
    "candidateName": "Full name from resume personalInfo",
    "language": "ISO code matching targetLanguage"
  }

## COVER LETTER RULES:
- Write in a natural human voice — avoid clichés like "I am writing to express my interest".
- Every claim must be grounded in the candidate's resume. Never invent achievements.
- Maximum 3-4 short paragraphs total.
- Reference the company name if present in the JD.`;

const APP_ANSWERS_ADDENDUM = `
The JSON must also include an "applicationAnswers" key:
  "applicationAnswers": {
    "answers": [
      {
        "question": "Exact question as provided by the user",
        "answer": "Natural, specific, professional answer (2-5 sentences) grounded strictly in the candidate's background. Never fabricate details."
      }
    ],
    "language": "ISO code matching targetLanguage"
  }

## APPLICATION ANSWER RULES:
- Answer each question specifically and tie it to concrete resume evidence.
- If a question asks for something not present in the resume, give the most honest constructive answer without fabricating.
- Keep each answer to 2-5 sentences.`;

const APP_EMAIL_ADDENDUM = `
The JSON must also include an "applicationEmail" key:
  "applicationEmail": {
    "subject": "Concise specific subject line e.g. Application for [Role] – [Candidate Name]",
    "salutation": "e.g. Dear Hiring Manager, (or Dear [recipientName], if provided)",
    "paragraphs": [
      "Opening: state the specific role and lead with a compelling hook from the candidate's strongest relevant achievement.",
      "Body: connect 2-3 concrete experiences or measurable results from the resume to the role's key requirements. Be specific — cite real numbers.",
      "Closing: express genuine enthusiasm, mention the attached resume, clear call to action."
    ],
    "signOff": "e.g. Best regards,",
    "senderName": "Candidate full name from personalInfo",
    "senderEmail": "Candidate email from personalInfo",
    "language": "ISO code matching targetLanguage"
  }

## EMAIL RULES:
- Natural human voice — no generic AI filler phrases.
- Every claim grounded in the candidate's resume. Never invent achievements.
- Exactly 3 paragraphs. Concise.
- Mirror the register of the JD (formal vs conversational).`;

export class OpenAIResumeAdapter implements IResumeOptimizationService {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set');
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS ?? '4096', 10);
  }

  async optimize(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions
  ): Promise<GenerationBundle> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: 0.3,
      messages: [
        { role: 'system', content: this.buildSystemPrompt(options) },
        { role: 'user',   content: this.buildUserPrompt(resume, jobDescription, options) },
      ],
      response_format: { type: 'json_object' },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error('OpenAI returned an empty response');

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${rawContent.slice(0, 200)}`);
    }

    return this.assembleBundle(parsed, options);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private buildSystemPrompt(options?: OptimizationOptions): string {
    let prompt = BASE_SYSTEM_PROMPT;
    if (options?.generateCoverLetter)                prompt += COVER_LETTER_ADDENDUM;
    if (options?.applicationQuestions?.trim())       prompt += APP_ANSWERS_ADDENDUM;
    if (options?.generateApplicationEmail)           prompt += APP_EMAIL_ADDENDUM;
    return prompt;
  }

  private buildUserPrompt(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions,
  ): string {
    const lang = options?.targetLanguage;
    const languageNote = lang && lang !== 'en'
      ? `\n\n⚠️ LANGUAGE: Write ALL human-readable text values in language "${lang}". Keep JSON keys in English.`
      : '';

    const questionsBlock = options?.applicationQuestions?.trim()
      ? `\n\n## APPLICATION QUESTIONS TO ANSWER:\n\`\`\`\n${options.applicationQuestions.trim()}\n\`\`\``
      : '';

    const recipientNote = options?.generateApplicationEmail && options.recipientName
      ? `\n\nEMAIL RECIPIENT: Address the email to "${options.recipientName}".`
      : '';

    return `## ORIGINAL RESUME:
\`\`\`
${resume.rawText}
\`\`\`

## TARGET JOB DESCRIPTION:
\`\`\`
${jobDescription.rawText}
\`\`\`
${questionsBlock}${languageNote}${recipientNote}

Produce the complete JSON output now.`;
  }

  private assembleBundle(
    parsed: Record<string, unknown>,
    options?: OptimizationOptions,
  ): GenerationBundle {
    const bundle: GenerationBundle = {
      resume: validateOptimizedResume(parsed.resume),
    };
    if (options?.generateCoverLetter && parsed.coverLetter)
      bundle.coverLetter = validateCoverLetter(parsed.coverLetter);
    if (options?.applicationQuestions?.trim() && parsed.applicationAnswers)
      bundle.applicationAnswers = validateApplicationAnswers(parsed.applicationAnswers);
    if (options?.generateApplicationEmail && parsed.applicationEmail)
      bundle.applicationEmail = validateApplicationEmail(parsed.applicationEmail);
    return bundle;
  }
}
