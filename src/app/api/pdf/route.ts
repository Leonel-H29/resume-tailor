// Interface Layer: API Route — POST /api/pdf
// Accepts an OptimizedResume JSON body and returns a fresh PDF.
// Used by the client-side resume editor after manual edits.

import { type NextRequest, NextResponse } from 'next/server';
import { generateResumePDF, pdfToBase64 } from '@/infrastructure/pdf/pdfGenerator';
import { validateOptimizedResume } from '@/domain/entities/OptimizedResume';
import { validateApiSecret } from '@/lib/validateApiSecret';

export async function POST(req: NextRequest) {
  const authError = validateApiSecret(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const resume = validateOptimizedResume(body);
    const pdfBytes = await generateResumePDF(resume);
    const pdfBase64 = pdfToBase64(pdfBytes);
    return NextResponse.json({ success: true, pdfBase64 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'PDF generation failed' },
      { status: 400 }
    );
  }
}
