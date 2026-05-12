"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const isApiKeyError = error.toLowerCase().includes("api key") || error.toLowerCase().includes("openai");
  const isFileSizeError = error.toLowerCase().includes("size") || error.toLowerCase().includes("mb");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertTriangle size={28} className="text-destructive" />
      </div>

      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-1">
        {error}
      </p>

      {isApiKeyError && (
        <p className="text-xs text-muted-foreground/70 max-w-sm mt-2 p-3 rounded-lg bg-muted/40 border border-border/40">
          Make sure your <code className="text-accent font-mono text-xs">OPENAI_API_KEY</code> is set
          in your <code className="text-accent font-mono text-xs">.env.local</code> file.
        </p>
      )}

      {isFileSizeError && (
        <p className="text-xs text-muted-foreground/70 max-w-sm mt-2">
          Try pasting your resume text directly instead of uploading a file.
        </p>
      )}

      <button
        onClick={onRetry}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors border border-border/60"
      >
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}
