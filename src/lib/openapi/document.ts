// OpenAPI 3.0 specification — single source of truth for API documentation.
// Extend this file when adding new routes; keep schemas aligned with domain entities.

import type { OpenAPIV3 } from 'openapi-types';

const optimizedResumeSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: [
    'personalInfo',
    'summary',
    'experience',
    'education',
    'skills',
    'keywords',
    'matchScore',
    'language',
  ],
  properties: {
    personalInfo: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', nullable: true },
        location: { type: 'string', nullable: true },
        linkedin: { type: 'string', nullable: true },
        github: { type: 'string', nullable: true },
        website: { type: 'string', nullable: true },
      },
    },
    summary: { type: 'string' },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        required: ['company', 'title', 'startDate', 'endDate', 'achievements'],
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          location: { type: 'string', nullable: true },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
          achievements: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        required: ['institution', 'degree', 'graduationDate'],
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          field: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          startDate: { type: 'string', nullable: true },
          graduationDate: { type: 'string' },
          gpa: { type: 'string', nullable: true },
          honors: { type: 'string', nullable: true },
        },
      },
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'skills'],
        properties: {
          name: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          issuer: { type: 'string', nullable: true },
          date: { type: 'string', nullable: true },
        },
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' } },
          url: { type: 'string', nullable: true },
        },
      },
    },
    languages: {
      type: 'array',
      items: {
        type: 'object',
        required: ['language', 'level'],
        properties: {
          language: { type: 'string' },
          level: {
            type: 'string',
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'],
          },
        },
      },
    },
    keywords: { type: 'array', items: { type: 'string' } },
    matchScore: { type: 'integer', minimum: 0, maximum: 100 },
    language: { type: 'string', example: 'en' },
    generatedAt: { type: 'string', format: 'date-time' },
    changes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          section: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  },
};

const apiErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string' },
  },
};

const apiSecretHeader: OpenAPIV3.ParameterObject = {
  name: 'x-api-secret',
  in: 'header',
  required: false,
  description:
    'Shared secret (must match API_SECRET_KEY). Required when API_SECRET_KEY is set in the environment.',
  schema: { type: 'string' },
};

export const openApiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'ResumeTailor AI API',
    version: '1.0.0',
    description:
      'Internal API for resume optimization, PDF regeneration, and optional application assets. ' +
      'All routes may require the `x-api-secret` header when `API_SECRET_KEY` is configured.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  tags: [
    { name: 'Generation', description: 'AI resume optimization' },
    { name: 'PDF', description: 'PDF rendering from structured resume data' },
  ],
  paths: {
    '/api/generate': {
      post: {
        tags: ['Generation'],
        summary: 'Generate tailored resume and optional extras',
        description:
          'Accepts multipart form data with resume input and job description. Returns optimized resume JSON, base64 PDF, and optional cover letter, answers, email, and DM.',
        operationId: 'generateResume',
        parameters: [apiSecretHeader],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['jobDescription'],
                properties: {
                  resumeFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF or TXT (max 10MB)',
                  },
                  resumeText: {
                    type: 'string',
                    description: 'Plain-text resume (min 50 chars if no file)',
                  },
                  jobDescription: {
                    type: 'string',
                    description:
                      'Full job posting (required, max 10,000 chars)',
                  },
                  languages: {
                    type: 'string',
                    description: 'JSON-encoded LanguageOptions',
                    example:
                      '{"resume":"en","coverLetter":"en","answers":"en","email":"en","dm":"en"}',
                  },
                  generateCoverLetter: {
                    type: 'string',
                    enum: ['true', 'false'],
                  },
                  applicationQuestions: {
                    type: 'string',
                    description: 'Newline-separated questions',
                  },
                  generateApplicationEmail: {
                    type: 'string',
                    enum: ['true', 'false'],
                  },
                  recipientName: { type: 'string' },
                  emailAdditionalInfo: { type: 'string' },
                  emailTone: {
                    type: 'string',
                    enum: ['professional', 'friendly', 'concise'],
                  },
                  generateDirectMessage: {
                    type: 'string',
                    enum: ['true', 'false'],
                  },
                  dmAdditionalInfo: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Generation succeeded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'optimizedResume'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    optimizedResume: optimizedResumeSchema,
                    pdfBase64: {
                      type: 'string',
                      description: 'Base64-encoded PDF bytes',
                    },
                    coverLetter: { type: 'object', nullable: true },
                    applicationAnswers: { type: 'object', nullable: true },
                    applicationEmail: { type: 'object', nullable: true },
                    directMessage: { type: 'object', nullable: true },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: { 'application/json': { schema: apiErrorSchema } },
          },
          '401': {
            description: 'Missing or invalid API secret',
            content: { 'application/json': { schema: apiErrorSchema } },
          },
          '500': {
            description: 'Server or AI error',
            content: { 'application/json': { schema: apiErrorSchema } },
          },
        },
      },
    },
    '/api/pdf': {
      post: {
        tags: ['PDF'],
        summary: 'Regenerate PDF from OptimizedResume JSON',
        description: 'Used by the resume editor after manual edits.',
        operationId: 'regeneratePdf',
        parameters: [apiSecretHeader],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: optimizedResumeSchema,
            },
          },
        },
        responses: {
          '200': {
            description: 'PDF generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'pdfBase64'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    pdfBase64: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid resume payload',
            content: { 'application/json': { schema: apiErrorSchema } },
          },
          '401': {
            description: 'Unauthorised',
            content: { 'application/json': { schema: apiErrorSchema } },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiSecretHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-secret',
        description: 'Matches API_SECRET_KEY when configured',
      },
    },
  },
};
