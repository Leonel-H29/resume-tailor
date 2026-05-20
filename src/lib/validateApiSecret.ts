// lib/validateApiSecret.ts — SERVER SIDE ONLY
// Validates the x-api-secret header on incoming API requests.
// Returns an error response when the secret is missing or wrong,
// or null when the request is authorised.

import { NextRequest, NextResponse } from 'next/server';

export function validateApiSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.API_SECRET_KEY;

  // If no secret is configured (e.g. local dev without .env.local),
  // skip validation so the app works out of the box.
  if (!secret) return null;

  const incoming = req.headers.get('x-api-secret');
  if (incoming !== secret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorised' },
      { status: 401 }
    );
  }
  return null;
}
