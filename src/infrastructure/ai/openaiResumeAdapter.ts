// Infrastructure Adapter: OpenAI Resume Optimization
// Implements the domain port using the OpenAI API.
//
// COST STRATEGY: A single API call returns ALL requested outputs
// (resume + optional cover letter + optional application answers)
// in one JSON object. No redundant calls ever made.

import OpenAI from 'openai';
import type {
  IResumeOptimizationService,
  OptimizationOptions,
} from '@/domain/services/IResumeOptimizationService';
import type { Resume } from '@/domain/entities/Resume';
import type { JobDescription } from '@/domain/entities/JobDescription';
import type { GenerationBundle } from '@/domain/entities/GenerationBundle';
import {
  validateOptimizedResume,
} from '@/domain/entities/OptimizedResume';
import { validateCoverLetter } from '@/domain/entities/CoverLetter';
import { validateApplicationAnswers } from '@/domain/entities/ApplicationAnswers';

// ── System prompt ─────────────────────────────────────────────────────────────
// Defines the base role and strict rules that apply to ALL outputs.

const BASE_SYSTEM_PROMPT = `You are an elite career coach, resume writer, and ATS optimization expert with 15+ years of experience in talent acquisition. You produce professional job-application materials based strictly on a candidate's provided background.

## UNIVERSAL STRICT RULES (apply to EVERY output):
1. NEVER invent or hallucinate skills, experiences, companies, dates, achievements, or personal details not present in the original resume.
2. Only use keywords and buzzwords explicitly present in the job description AND consistent with the candidate's existing experience.
3. You MAY rephrase and strengthen existing content to better align with the job description language.
4. You MAY reorder resume sections to surface the most relevant experience first.
5. The output language for ALL text values is controlled by the "targetLanguage" field in the request — translate ALL human-readable content accordingly, but always keep JSON keys in English.

## OUTPUT FORMAT:
Respond with ONLY a single valid JSON object. No markdown fences, no preamble, no explanation.

The JSON must always include the "resume" key. The "coverLetter" and "applicationAnswers" keys are only present when explicitly requested.

\`\`\`
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
        "startDate": "string (e.g. Sep 2017)",
        "graduationDate": "string (e.g. Jun 2021 or Present)",
        "gpa": "string | null",
        "honors": "string | null"
      }
    ],
    "skills": [
      {
        "name": "Category name (e.g. Programming Languages, Tools, Frameworks)",
        "skills": ["skill1", "skill2"]
      }
    ],
    "certifications": [
      { "name": "string", "issuer": "string | null", "date": "string | null" }
    ],
    "projects": [
      {
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "url": "string | null"
      }
    ],
    "languages": [
      { "language": "string", "level": "A1 | A2 | B1 | B2 | C1 | C2 | Native" }
    ],
    "keywords": ["10-20 ATS keywords extracted from the JD and incorporated"],
    "matchScore": 85,
    "language": "en",
    "changes": [
      { "section": "Summary", "description": "Rewrote to emphasize leadership and cloud alignment" }
    ]
  }
}
\`\`\``;

const COVER_LETTER_SCHEMA = `
  "coverLetter": {
    "salutation": "e.g. Dear Hiring Manager,",
    "opening": "Opening paragraph — hook + role statement",
    "body": [
      "Body paragraph 1 — connects top experiences to the role's key requirements",
      "Body paragraph 2 — highlights a specific achievement + cultural fit (if inferable)"
    ],
    "closing": "Closing paragraph — enthusiasm + call to action",
    "signOff": "e.g. Sincerely,",
    "candidateName": "Full name from the resume",
    "language": "ISO code matching targetLanguage"
  }`;

const APP_ANSWERS_SCHEMA = `
  "applicationAnswers": {
    "answers": [
      {
        "question": "Exact question as provided",
        "answer": "Natural, specific, professional answer grounded strictly in the candidate's background. 2-5 sentences."
      }
    ],
    "language": "ISO code matching targetLanguage"
  }`;

export class OpenAIResumeAdapter implements IResumeOptimizationService {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS ?? '4096', 10);
  }

  async optimize(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions
  ): Promise<GenerationBundle> {
    const systemPrompt = this.buildSystemPrompt(options);
    const userPrompt = this.buildUserPrompt(resume, jobDescription, options);

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error('OpenAI returned an empty response');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error(
        `Failed to parse AI response as JSON: ${rawContent.slice(0, 200)}`
      );
    }

    return this.buildBundle(parsed, options);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private buildSystemPrompt(options?: OptimizationOptions): string {
    const needsCoverLetter = options?.generateCoverLetter === true;
    const needsAnswers = Boolean(options?.applicationQuestions?.trim());

    if (!needsCoverLetter && !needsAnswers) {
      return BASE_SYSTEM_PROMPT;
    }

    // Extend the base schema with the requested optional sections
    const extraSchemas: string[] = [];
    if (needsCoverLetter) extraSchemas.push(COVER_LETTER_SCHEMA);
    if (needsAnswers) extraSchemas.push(APP_ANSWERS_SCHEMA);

    const extraNote = `
The JSON must also include the following additional keys alongside "resume":
{${extraSchemas.join(',\n')}}

## COVER LETTER RULES (when requested):
- Write in a natural, human voice — avoid AI-sounding filler phrases.
- Ground every claim in the candidate's real experience.
- Reference the specific role and company if their name appears in the JD.
- Keep the total length to 3–4 short paragraphs.

## APPLICATION ANSWER RULES (when requested):
- Answer each question specifically and professionally.
- Tie answers to concrete experience from the candidate's resume.
- NEVER invent details. If a question asks for something not in the resume, give the most honest and constructive answer possible without fabricating.
- Keep each answer to 2–5 sentences unless the question clearly requires more.`;

    return BASE_SYSTEM_PROMPT + extraNote;
  }

  private buildUserPrompt(
    resume: Resume,
    jobDescription: JobDescription,
    options?: OptimizationOptions
  ): string {
    const lang = options?.targetLanguage;
    const languageInstruction =
      lang && lang !== 'en'
        ? `\n\n⚠️ LANGUAGE REQUIREMENT: Write ALL human-readable text values in language code "${lang}". This applies to the resume, cover letter, and application answers equally. Keep all JSON keys in English.`
        : '';

    const questionsBlock =
      options?.applicationQuestions?.trim()
        ? `\n\n## APPLICATION QUESTIONS TO ANSWER:\n\`\`\`\n${options.applicationQuestions.trim()}\n\`\`\``
        : '';

    return `## CANDIDATE'S CURRENT RESUME:
\`\`\`
${resume.rawText}
\`\`\`

## TARGET JOB DESCRIPTION:
\`\`\`
${jobDescription.rawText}
\`\`\`
${questionsBlock}${languageInstruction}

Produce the complete JSON output now.`;
  }

  private buildBundle(
    parsed: Record<string, unknown>,
    options?: OptimizationOptions
  ): GenerationBundle {
    const bundle: GenerationBundle = {
      resume: validateOptimizedResume(parsed.resume),
    };

    if (options?.generateCoverLetter && parsed.coverLetter) {
      bundle.coverLetter = validateCoverLetter(parsed.coverLetter);
    }

    if (options?.applicationQuestions?.trim() && parsed.applicationAnswers) {
      bundle.applicationAnswers = validateApplicationAnswers(
        parsed.applicationAnswers
      );
    }

    return bundle;
  }
}
