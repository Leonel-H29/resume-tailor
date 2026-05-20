// Interface Layer: API Route — POST /api/generate

import { type NextRequest, NextResponse } from 'next/server';
import { GenerateResumeUseCase } from '@/application/use-cases/generateResume';
import { OpenAIResumeAdapter } from '@/infrastructure/ai/openaiResumeAdapter';
import { generateResumePDF, pdfToBase64 } from '@/infrastructure/pdf/pdfGenerator';
import { parseResumeFile, validateFileSize, validateMimeType } from '@/infrastructure/parsers/resumeParser';
import { validateApiSecret } from '@/lib/validateApiSecret';
import type { LanguageOptions } from '@/domain/services/IResumeOptimizationService';
import type { EmailTone } from '@/domain/entities/ApplicationEmail';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const authError = validateApiSecret(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();

    const jobDescriptionText        = formData.get('jobDescription') as string;
    const resumeFile                = formData.get('resumeFile') as File | null;
    const resumeText                = formData.get('resumeText') as string | null;
    const generateCoverLetter       = formData.get('generateCoverLetter') === 'true';
    const applicationQuestions      = (formData.get('applicationQuestions') as string) ?? '';
    const generateApplicationEmail  = formData.get('generateApplicationEmail') === 'true';
    const recipientName             = (formData.get('recipientName') as string) ?? '';
    const emailAdditionalInfo       = (formData.get('emailAdditionalInfo') as string) ?? '';
    const emailTone                 = ((formData.get('emailTone') as string) ?? 'professional') as EmailTone;
    const generateDirectMessage     = formData.get('generateDirectMessage') === 'true';
    const dmAdditionalInfo          = (formData.get('dmAdditionalInfo') as string) ?? '';

    // Per-output languages — sent as a JSON string
    let languages: LanguageOptions = { resume: 'en' };
    try {
      const raw = formData.get('languages') as string | null;
      if (raw) languages = JSON.parse(raw);
    } catch { /* keep default */ }

    if (!jobDescriptionText?.trim())
      return NextResponse.json({ success: false, error: 'Job description is required' }, { status: 400 });
    if (jobDescriptionText.trim().length > 10_000)
      return NextResponse.json({ success: false, error: 'Job description exceeds 10,000 character limit' }, { status: 400 });

    let parsedResumeText = '';
    let resumeFileName: string | undefined;
    let resumeFileType: 'pdf' | 'text' = 'text';

    if (resumeFile && resumeFile.size > 0) {
      const mimeType = resumeFile.type || 'application/octet-stream';
      try {
        validateMimeType(mimeType);
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        validateFileSize(buffer);
        const parsed = await parseResumeFile(buffer, resumeFile.name, mimeType);
        parsedResumeText = parsed.text;
        resumeFileName   = parsed.fileName;
        resumeFileType   = parsed.fileType;
      } catch (parseError) {
        return NextResponse.json(
          { success: false, error: `Failed to parse resume file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    } else if (resumeText?.trim()) {
      parsedResumeText = resumeText.trim();
    } else {
      return NextResponse.json({ success: false, error: 'Please upload a resume file or paste resume text' }, { status: 400 });
    }

    if (parsedResumeText.length > 15_000) parsedResumeText = parsedResumeText.slice(0, 15_000);

    const useCase = new GenerateResumeUseCase(new OpenAIResumeAdapter());
    const result  = await useCase.execute({
      resumeText: parsedResumeText,
      resumeFileName,
      resumeFileType,
      jobDescriptionText,
      languages,
      generateCoverLetter,
      applicationQuestions: applicationQuestions || undefined,
      generateApplicationEmail,
      recipientName: recipientName || undefined,
      emailAdditionalInfo: emailAdditionalInfo || undefined,
      emailTone,
      generateDirectMessage,
      dmAdditionalInfo: dmAdditionalInfo || undefined,
    });

    if (!result.success || !result.optimizedResume)
      return NextResponse.json({ success: false, error: result.error ?? 'Resume generation failed' }, { status: 500 });

    let pdfBase64: string | undefined;
    try {
      pdfBase64 = pdfToBase64(await generateResumePDF(result.optimizedResume));
    } catch (err) {
      console.error('PDF generation error:', err);
    }

    return NextResponse.json({
      success: true,
      optimizedResume:    result.optimizedResume,
      pdfBase64,
      coverLetter:        result.coverLetter        ?? null,
      applicationAnswers: result.applicationAnswers ?? null,
      applicationEmail:   result.applicationEmail   ?? null,
      directMessage:      result.directMessage      ?? null,
    });

  } catch (error) {
    console.error('API route error:', error);
    const isOpenAIError = error instanceof Error &&
      (error.message.includes('OpenAI') || error.message.includes('API key') || error.message.includes('quota'));
    return NextResponse.json(
      { success: false, error: isOpenAIError ? error.message : 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
