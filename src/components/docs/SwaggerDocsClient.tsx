'use client';

import dynamic from 'next/dynamic';
import type { OpenAPIV3 } from 'openapi-types';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

interface SwaggerDocsClientProps {
  spec: OpenAPIV3.Document;
}

export function SwaggerDocsClient({ spec }: SwaggerDocsClientProps) {
  return (
    <div className="swagger-docs-root min-h-screen bg-[#fafafa]">
      <SwaggerUI spec={spec} docExpansion="list" defaultModelsExpandDepth={1} />
    </div>
  );
}
