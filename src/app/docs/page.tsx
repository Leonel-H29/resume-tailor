// Protected Swagger UI — /docs?key=DOCS_SECRET_KEY

import { openApiDocument } from '@/lib/openapi/document';
import { isDocsKeyValid } from '@/lib/docs/validateDocsKey';
import { SwaggerDocsClient } from '@/components/docs/SwaggerDocsClient';

interface DocsPageProps {
  searchParams: Promise<{ key?: string }>;
}

export default async function DocsPage({ searchParams }: DocsPageProps) {
  const { key } = await searchParams;

  if (!isDocsKeyValid(key)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <p className="text-6xl font-serif text-muted-foreground/40 mb-4">
            401
          </p>
          <h1 className="font-serif text-xl font-semibold text-foreground mb-2">
            Unauthorized
          </h1>
        </div>
      </main>
    );
  }

  return <SwaggerDocsClient spec={openApiDocument} />;
}
