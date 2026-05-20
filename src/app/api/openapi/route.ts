// GET /api/openapi?key=DOCS_SECRET_KEY — protected OpenAPI JSON spec

import { NextRequest, NextResponse } from 'next/server';
import { openApiDocument } from '@/lib/openapi/document';
import { isDocsKeyValid } from '@/lib/docs/validateDocsKey';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!isDocsKeyValid(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(openApiDocument);
}
