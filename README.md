# ResumeTailor AI

An AI-powered resume optimization application built with **Next.js 15**, **TypeScript**, and **OpenAI GPT-4o**. Upload your resume and a job description — the AI tailors your resume to match the role, injects ATS keywords, and generates a downloadable PDF.

---

## ✨ Features

- **AI-Powered Optimization** — GPT-4o analyzes both documents and rewrites your resume to align with the job
- **ATS-Friendly Output** — Clean PDF with standard section headings, no tables or columns
- **Keyword Injection** — Extracts and incorporates relevant keywords from the job description
- **No Hallucinations** — Strict AI prompting ensures only real experience is used
- **Multi-Language Support** — Optionally translate the resume to the job description's language
- **PDF Preview + Download** — Inline browser PDF viewer and one-click download
- **ATS Score** — Visual match score showing resume-to-job compatibility
- **Change Summary** — See exactly what the AI changed and which keywords were added

---

## 🏗️ Architecture — Hexagonal (Ports & Adapters)

```
src/
├── domain/                         # Pure business logic, zero framework imports
│   ├── entities/
│   │   ├── Resume.ts               # Input resume entity + factory/validation
│   │   ├── JobDescription.ts       # Job description entity
│   │   └── OptimizedResume.ts      # Output entity with all resume sections
│   └── services/
│       └── IResumeOptimizationService.ts   # Port (interface) for AI adapter
│
├── application/                    # Use-case orchestration
│   └── use-cases/
│       └── generateResume.ts       # Coordinates domain + infrastructure
│
├── infrastructure/                 # Adapters (implement domain ports)
│   ├── ai/
│   │   └── openaiResumeAdapter.ts  # OpenAI GPT-4o implementation
│   ├── pdf/
│   │   └── pdfGenerator.ts         # pdf-lib based PDF renderer
│   └── parsers/
│       └── resumeParser.ts         # PDF + text file extractor
│
├── app/
│   ├── page.tsx                    # Main two-panel app shell
│   ├── layout.tsx                  # Root layout + metadata
│   ├── globals.css                 # Design tokens + Tailwind base
│   └── api/
│       └── generate/
│           └── route.ts            # POST /api/generate — API controller
│
└── components/
    ├── forms/
    │   └── ResumeForm.tsx          # File upload + textarea + language selector
    └── preview/
        ├── ResumePreview.tsx       # PDF viewer + download + tabs
        ├── LoadingState.tsx        # Animated step-by-step progress
        ├── MatchScoreRing.tsx      # Circular ATS score visualization
        ├── ChangeSummary.tsx       # Keywords + change descriptions
        └── ErrorState.tsx          # Error display with hints
```

### Why Hexagonal Architecture?

| Layer | Depends On | Never Imports |
|-------|-----------|---------------|
| Domain | Nothing | Next.js, OpenAI, pdf-lib |
| Application | Domain interfaces | OpenAI, pdf-lib |
| Infrastructure | Domain interfaces | Application layer |
| Interface (API/UI) | Application + Infrastructure | — |

Swapping OpenAI for Anthropic, or pdf-lib for Puppeteer, only requires changing one file.

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd resume-tailor
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o           # Optional, defaults to gpt-4o
OPENAI_MAX_TOKENS=4096        # Optional
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Reference

### `POST /api/generate`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resumeFile` | File | No* | PDF or TXT resume file (max 10MB) |
| `resumeText` | string | No* | Plain text resume (if no file) |
| `jobDescription` | string | Yes | Full job posting text |
| `language` | string | No | `en` (default), `auto`, or ISO code |

*Either `resumeFile` or `resumeText` is required.

**Response:**

```json
{
  "success": true,
  "optimizedResume": {
    "personalInfo": { "name": "...", "email": "...", ... },
    "summary": "...",
    "experience": [{ "company": "...", "title": "...", "achievements": [...] }],
    "education": [...],
    "skills": [...],
    "keywords": ["React", "TypeScript", ...],
    "matchScore": 87,
    "language": "en",
    "changes": [{ "section": "Summary", "description": "..." }]
  },
  "pdfBase64": "JVBERi0xLjQ..."
}
```

---

## 🔧 Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| AI | OpenAI GPT-4o (`response_format: json_object`) |
| PDF Generation | pdf-lib |
| PDF Parsing | pdf-parse |
| Styling | Tailwind CSS |
| Fonts | Playfair Display + DM Sans (Google Fonts) |

---

## 🔄 Extending the App

### Add a new AI provider (e.g., Anthropic Claude)

1. Create `src/infrastructure/ai/anthropicResumeAdapter.ts`
2. Implement `IResumeOptimizationService`
3. Swap the adapter in `src/app/api/generate/route.ts`

No other files change.

### Add resume versioning

1. Create `src/domain/entities/ResumeVersion.ts`
2. Add a `IResumeRepository` port in `src/domain/services/`
3. Implement with a database adapter (Prisma, Supabase, etc.)
4. Update the use-case to call `repository.save()`

---

## 📄 License

MIT
