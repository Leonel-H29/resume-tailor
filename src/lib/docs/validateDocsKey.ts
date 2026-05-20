// Server-only: validates ?key= for protected OpenAPI / Swagger routes

export function isDocsKeyValid(key: string | null | undefined): boolean {
  const secret = process.env.DOCS_SECRET_KEY;
  if (!secret || secret.length === 0) return false;
  if (!key || key.length === 0) return false;
  return key === secret;
}
