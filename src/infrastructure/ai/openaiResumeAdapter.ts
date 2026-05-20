// Infrastructure Adapter: OpenAI Resume Optimization
// Single API call — all requested outputs in one JSON response.

import OpenAI from 'openai';
import type { IResumeOptimizationService, OptimizationOptions, LanguageOptions } from '@/domain/services/IResumeOptimizationService';
import type { Resume } from '@/domain/entities/Resume';
import type { JobDescription } from '@/domain/entities/JobDescription';
import type { GenerationBundle } from '@/domain/entities/GenerationBundle';
import { validateOptimizedResume } from '@/domain/entities/OptimizedResume';
import { validateCoverLetter } from '@/domain/entities/CoverLetter';
import { validateApplicationAnswers } from '@/domain/entities/ApplicationAnswers';
import { validateApplicationEmail } from '@/domain/entities/ApplicationEmail';
import { validateDirectMessage } from '@/domain/entities/DirectMessage';
import { parseJsonObject, type JsonObject, type JsonValue } from '@/domain/types/JsonValue';

// ── Base system prompt ────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are an elite resume writer, ATS optimization expert, and career coach with 15+ years of experience in talent acquisition.

## UNIVERSAL RULES (apply to every output):
1. NEVER invent or hallucinate skills, experiences, companies, dates, or achievements not present in the original resume.
2. Only use keywords explicitly mentioned in both the job description and resume, or clearly implied by existing experience.
3. You MAY rephrase and strengthen existing content to align with the job description language.
4. You MAY reorder resume sections to surface the most relevant experience.
5. All output is ATS-friendly: standard headings, no tables, no columns.
6. Per-output language instructions are specified below each section. Keep all JSON keys in English.

## OUTPUT FORMAT:
Respond with ONLY a valid JSON object. No markdown fences, no preamble.

The root JSON must always contain a "resume" key:
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
        "startDate": "string",
        "endDate": "string",
        "skills": ["skill1"],
        "achievements": ["3-6 quantified bullet points"]
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
    "skills": [{ "name": "Category", "skills": ["skill1"] }],
    "certifications": [{ "name": "string", "issuer": "string | null", "date": "string | null" }],
    "projects": [{ "name": "string", "description": "string", "technologies": ["string"], "url": "string | null" }],
    "languages": [{ "language": "string", "level": "A1|A2|B1|B2|C1|C2|Native" }],
    "keywords": ["10-20 ATS keywords"],
    "matchScore": 85,
    "language": "en",
    "changes": [{ "section": "Summary", "description": "..." }]
  }
}`;

// ── Optional schema addenda ───────────────────────────────────────────────────

const COVER_LETTER_ADDENDUM = (lang: string) => `
Also include a "coverLetter" key. Write its human-readable text in language "${lang}":
  "coverLetter": {
    "salutation": "e.g. Dear Hiring Manager,",
    "opening": "Hook + role statement from candidate's strongest relevant achievement",
    "body": ["Body para 1: 2-3 concrete experiences → role requirements", "Body para 2: cultural fit (optional)"],
    "closing": "Enthusiasm + call to action",
    "signOff": "e.g. Sincerely,",
    "candidateName": "Full name from personalInfo",
    "language": "${lang}"
  }
COVER LETTER RULES: Natural voice, no clichés ("I am writing to…"), grounded in resume, max 4 paragraphs, reference company name if in JD.`;

const APP_ANSWERS_ADDENDUM = (lang: string) => `
Also include an "applicationAnswers" key. Write answers in language "${lang}":
  "applicationAnswers": {
    "answers": [{ "question": "Exact question text", "answer": "2-5 sentence answer grounded in resume — never fabricate." }],
    "language": "${lang}"
  }
ANSWER RULES: Specific, tied to concrete resume evidence. Honest if topic not in resume. 2-5 sentences max.`;

const APP_EMAIL_ADDENDUM = (lang: string, tone: string, recipientName?: string, additionalInfo?: string) => {
  const toneGuide = {
    professional: 'Formal, structured, achievement-focused. Mirror executive communication style.',
    friendly: 'Warm and conversational but professional. Show genuine personality and enthusiasm.',
    concise: 'Extremely brief. Every word earns its place. No filler sentences.',
  }[tone] ?? 'Professional and clear.';

  const recipientLine = recipientName ? `Address the email to "${recipientName}".` : 'Use "Dear Hiring Manager,"';
  const extraInfo = additionalInfo ? `\nEXTRA CONTEXT TO WEAVE IN: "${additionalInfo}"` : '';

  return `
Also include an "applicationEmail" key. Write in language "${lang}".
${recipientLine}${extraInfo}
TONE: ${toneGuide}
  "applicationEmail": {
    "subject": "Specific subject line, e.g. Application for [Role] – [Candidate Name]",
    "salutation": "Personalised greeting",
    "paragraphs": [
      "Opening: state role, lead with strongest relevant achievement hook",
      "Body: 2-3 concrete results from resume matching role requirements (cite real numbers)",
      "Closing: genuine enthusiasm, mention attached resume, clear CTA"
    ],
    "signOff": "e.g. Best regards,",
    "senderName": "Candidate full name",
    "senderEmail": "Candidate email",
    "footerLinks": ["Extract ALL URLs/profile links from the resume (linkedin, github, portfolio, etc.) as an array of strings"],
    "tone": "${tone}",
    "language": "${lang}"
  }
EMAIL RULES: Natural human voice — no generic filler. Every claim grounded in resume. Exactly 3 paragraphs. Adapt register to JD.`;
};

const DM_ADDENDUM = (lang: string, additionalInfo?: string) => {
  const extraInfo = additionalInfo ? `\nEXTRA CONTEXT: "${additionalInfo}"` : '';
  return `
Also include a "directMessage" key. Write in language "${lang}".${extraInfo}
  "directMessage": {
    "message": "A LinkedIn-style DM to a recruiter or hiring manager. STRICTLY ≤250 characters. Mention the role, one compelling hook from the candidate's background, and a CTA. No fluff.",
    "language": "${lang}"
  }
DM RULES: Ultra-concise. Count characters carefully — must be ≤250. Natural, not salesy.`;
};

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

    let parsed: JsonObject;
    try {
      parsed = parseJsonObject(rawContent);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${rawContent.slice(0, 200)}`);
    }

    return this.assembleBundle(parsed, options);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private lang(options: OptimizationOptions | undefined, key: keyof LanguageOptions): string {
    return options?.languages?.[key] ?? 'en';
  }

  private buildSystemPrompt(options?: OptimizationOptions): string {
    let prompt = BASE_SYSTEM_PROMPT;

    // Inject per-output language note into base resume prompt
    const resumeLang = this.lang(options, 'resume');
    if (resumeLang !== 'en') {
      prompt += `\n\nRESUME LANGUAGE: Write all resume human-readable text values in "${resumeLang}". Keep JSON keys in English. Set resume.language = "${resumeLang}".`;
    }

    if (options?.generateCoverLetter)
      prompt += COVER_LETTER_ADDENDUM(this.lang(options, 'coverLetter'));

    if (options?.applicationQuestions?.trim())
      prompt += APP_ANSWERS_ADDENDUM(this.lang(options, 'answers'));

    if (options?.generateApplicationEmail)
      prompt += APP_EMAIL_ADDENDUM(
        this.lang(options, 'email'),
        options.emailTone ?? 'professional',
        options.recipientName,
        options.emailAdditionalInfo,
      );

    if (options?.generateDirectMessage)
      prompt += DM_ADDENDUM(this.lang(options, 'dm'), options.dmAdditionalInfo);

    return prompt;
  }

  private buildUserPrompt(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions,
  ): string {
    const questionsBlock = options?.applicationQuestions?.trim()
      ? `\n\n## APPLICATION QUESTIONS TO ANSWER:\n\`\`\`\n${options.applicationQuestions.trim()}\n\`\`\``
      : '';

    return `## ORIGINAL RESUME:
\`\`\`
${resume.rawText}
\`\`\`

## TARGET JOB DESCRIPTION:
\`\`\`
${jobDescription.rawText}
\`\`\`
${questionsBlock}

Produce the complete JSON output now.`;
  }

  private assembleBundle(
    parsed: JsonObject,
    options?: OptimizationOptions,
  ): GenerationBundle {
    const bundle: GenerationBundle = {
      resume: validateOptimizedResume(parsed['resume'] as JsonValue),
    };
    if (options?.generateCoverLetter && parsed['coverLetter'])
      bundle.coverLetter = validateCoverLetter(parsed['coverLetter'] as JsonValue);
    if (options?.applicationQuestions?.trim() && parsed['applicationAnswers'])
      bundle.applicationAnswers = validateApplicationAnswers(parsed['applicationAnswers'] as JsonValue);
    if (options?.generateApplicationEmail && parsed['applicationEmail'])
      bundle.applicationEmail = validateApplicationEmail(parsed['applicationEmail'] as JsonValue);
    if (options?.generateDirectMessage && parsed['directMessage'])
      bundle.directMessage = validateDirectMessage(parsed['directMessage'] as JsonValue);
    return bundle;
  }
}
