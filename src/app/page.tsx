"use client";

import { useState, useCallback } from "react";
import { BrainCircuit, Github, Zap } from "lucide-react";
import { ResumeForm, type FormData } from "@/components/forms/ResumeForm";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { LoadingState } from "@/components/preview/LoadingState";
import { ErrorState } from "@/components/preview/ErrorState";
import { apiPost } from "@/lib/apiClient";
import type { OptimizedResume } from "@/domain/entities/OptimizedResume";
import type { CoverLetter } from "@/domain/entities/CoverLetter";
import type { ApplicationAnswers } from "@/domain/entities/ApplicationAnswers";
import type { ApplicationEmail } from "@/domain/entities/ApplicationEmail";
import type { DirectMessage } from "@/domain/entities/DirectMessage";

type AppState = "idle" | "loading" | "success" | "error";

interface GenerationResult {
  optimizedResume: OptimizedResume;
  pdfBase64?: string;
  coverLetter?: CoverLetter | null;
  applicationAnswers?: ApplicationAnswers | null;
  applicationEmail?: ApplicationEmail | null;
  directMessage?: DirectMessage | null;
}

export default function HomePage() {
  const [state,        setState]    = useState<AppState>("idle");
  const [result,       setResult]   = useState<GenerationResult | null>(null);
  const [error,        setError]    = useState("");
  const [lastFormData, setLastForm] = useState<FormData | null>(null);

  const handleGenerate = useCallback(async (formData: FormData) => {
    setState("loading");
    setError("");
    setLastForm(formData);

    try {
      const body = new globalThis.FormData();
      if (formData.resumeFile) body.append("resumeFile", formData.resumeFile);
      else body.append("resumeText", formData.resumeText);

      body.append("jobDescription",            formData.jobDescription);
      body.append("languages",                 JSON.stringify(formData.languages));
      body.append("generateCoverLetter",       String(formData.generateCoverLetter));
      body.append("applicationQuestions",      formData.applicationQuestions);
      body.append("generateApplicationEmail",  String(formData.generateApplicationEmail));
      body.append("recipientName",             formData.recipientName);
      body.append("emailAdditionalInfo",       formData.emailAdditionalInfo);
      body.append("emailTone",                 formData.emailTone);
      body.append("generateDirectMessage",     String(formData.generateDirectMessage));
      body.append("dmAdditionalInfo",          formData.dmAdditionalInfo);

      // All requests go through the centralised apiClient (injects x-api-secret)
      const res  = await apiPost("/api/generate", body);
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || `Server error: ${res.status}`);

      setResult({
        optimizedResume:    data.optimizedResume,
        pdfBase64:          data.pdfBase64,
        coverLetter:        data.coverLetter        ?? null,
        applicationAnswers: data.applicationAnswers ?? null,
        applicationEmail:   data.applicationEmail   ?? null,
        directMessage:      data.directMessage      ?? null,
      });
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setState("error");
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (lastFormData) handleGenerate(lastFormData); else setState("idle");
  }, [lastFormData, handleGenerate]);

  const handleReset = useCallback(() => {
    setState("idle"); setResult(null); setError("");
  }, []);

  /** Called by ResumeEditor after a successful manual-edit + PDF re-generation */
  const handleResumeUpdate = useCallback((updated: OptimizedResume, newPdf: string) => {
    setResult(prev => prev ? { ...prev, optimizedResume: updated, pdfBase64: newPdf } : prev);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
              <BrainCircuit size={16} className="text-accent" />
            </div>
            <span className="font-serif font-semibold text-base text-foreground">
              ResumeTailor<span className="text-accent">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap size={12} className="text-accent" /><span>Powered by GPT-4o</span>
            </div>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Github size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="pt-10 pb-8 px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium mb-5">
          <Zap size={11} /> Resume · Cover Letter · Answers · Email · DM — One Request
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          Tailor Your Resume to <span className="gold-text italic">Any Job</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Upload your resume and a job description. AI optimises, keyword-matches, and optionally
          generates a cover letter, Q&A answers, an application email, and a recruiter DM — all in one request.
        </p>
      </section>

      {/* ── Main two-panel layout ───────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left: form */}
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg font-semibold text-foreground">Your Resume & Job Details</h2>
              {state === "success" && (
                <button onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                  Start over
                </button>
              )}
            </div>
            <ResumeForm onSubmit={handleGenerate} isLoading={state === "loading"} />
          </div>

          {/* Right: result */}
          <div className="glass-card p-4 sm:p-6 min-h-[600px] flex flex-col">
            {state === "idle"    && <IdlePlaceholder />}
            {state === "loading" && <LoadingState />}
            {state === "error"   && <ErrorState error={error} onRetry={handleReset} />}
            {state === "success" && result && (
              <ResumePreview
                optimizedResume={result.optimizedResume}
                pdfBase64={result.pdfBase64}
                coverLetter={result.coverLetter}
                applicationAnswers={result.applicationAnswers}
                applicationEmail={result.applicationEmail}
                directMessage={result.directMessage}
                onRegenerate={handleRegenerate}
                onResumeUpdate={handleResumeUpdate}
              />
            )}
          </div>
        </div>

        {/* Feature strip */}
        {state === "idle" && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "ATS-Optimised",     desc: "Clean formatting that passes filters"         },
              { label: "Per-Output Language",desc: "Each output in its own language"             },
              { label: "PDF Editor",        desc: "Edit generated resume before downloading"     },
              { label: "Recruiter DM",      desc: "≤250-char LinkedIn message in one request"   },
            ].map(({ label, desc }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-sm font-semibold text-accent mb-0.5">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 py-5 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          ResumeTailor AI · Next.js · GPT-4o · pdf-lib ·{" "}
          <span className="text-accent">Hexagonal Architecture</span>
        </p>
      </footer>
    </div>
  );
}

function IdlePlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <div className="w-20 h-20 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center mb-5">
        <BrainCircuit size={36} className="text-accent/40" />
      </div>
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
        Your application package will appear here
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Fill in the form and click <span className="text-foreground font-medium">Generate</span>.
        Enable optional extras for a complete application package.
      </p>
      <div className="mt-8 space-y-2.5 w-full max-w-xs text-left">
        {[
          "Upload or paste your resume",
          "Paste the job description",
          "Choose per-output language",
          "Enable extras: cover letter, Q&A, email, DM",
          "Edit the PDF · Download",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-accent font-semibold">{i + 1}</span>
            </div>
            <span className="text-xs text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
