"use client";

import { useState, useCallback } from "react";
import { BrainCircuit, Github, Zap } from "lucide-react";
import { ResumeForm, type FormData } from "@/components/forms/ResumeForm";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { LoadingState } from "@/components/preview/LoadingState";
import { ErrorState } from "@/components/preview/ErrorState";
import type { OptimizedResume } from "@/domain/entities/OptimizedResume";
import type { CoverLetter } from "@/domain/entities/CoverLetter";
import type { ApplicationAnswers } from "@/domain/entities/ApplicationAnswers";
import type { ApplicationEmail } from "@/domain/entities/ApplicationEmail";

type AppState = "idle" | "loading" | "success" | "error";

interface GenerationResult {
  optimizedResume: OptimizedResume;
  pdfBase64?: string;
  coverLetter?: CoverLetter | null;
  applicationAnswers?: ApplicationAnswers | null;
  applicationEmail?: ApplicationEmail | null;
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
      body.append("jobDescription",           formData.jobDescription);
      body.append("language",                 formData.language);
      body.append("generateCoverLetter",      String(formData.generateCoverLetter));
      body.append("applicationQuestions",     formData.applicationQuestions);
      body.append("generateApplicationEmail", String(formData.generateApplicationEmail));
      body.append("recipientName",            formData.recipientName);

      const res  = await fetch("/api/generate", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `Server error: ${res.status}`);

      setResult({
        optimizedResume:    data.optimizedResume,
        pdfBase64:          data.pdfBase64,
        coverLetter:        data.coverLetter        ?? null,
        applicationAnswers: data.applicationAnswers ?? null,
        applicationEmail:   data.applicationEmail   ?? null,
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

  const handleReset = useCallback(() => { setState("idle"); setResult(null); setError(""); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <section className="pt-12 pb-8 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium mb-5">
          <Zap size={11} /> Resume · Cover Letter · App Answers · Email — One Request
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          Tailor Your Resume to <span className="gold-text italic">Any Job</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Paste your resume and a job description. AI optimizes, keyword-matches, and optionally
          drafts a cover letter, answers application questions, and writes a send-ready email — all in one request.
        </p>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="glass-card p-6">
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

          <div className="glass-card p-6 min-h-[600px] flex flex-col">
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
                onRegenerate={handleRegenerate}
              />
            )}
          </div>
        </div>

        {state === "idle" && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "ATS-Optimized",    desc: "Clean formatting that passes filters"    },
              { label: "Cover Letter",     desc: "Auto-written, tailored to the role"      },
              { label: "App Q&A",          desc: "Answers company questions from your background" },
              { label: "Application Email",desc: "Send-ready email in one request"         },
            ].map(({ label, desc }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-sm font-semibold text-accent mb-0.5">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/30 py-5 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          ResumeTailor AI · Next.js · GPT-4o · pdf-lib · <span className="text-accent">Hexagonal Architecture</span>
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
          "Enable cover letter, Q&A answers and/or email",
          "Choose language · Download PDF",
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
