"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ApplicationAnswers } from "@/domain/entities/ApplicationAnswers";

interface ApplicationAnswersPreviewProps {
  applicationAnswers: ApplicationAnswers;
}

export function ApplicationAnswersPreview({
  applicationAnswers,
}: ApplicationAnswersPreviewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    const all = applicationAnswers.answers
      .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
      .join("\n\n");
    await navigator.clipboard.writeText(all);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {applicationAnswers.answers.length} question
          {applicationAnswers.answers.length !== 1 ? "s" : ""} answered
        </p>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:border-border text-muted-foreground hover:text-foreground transition-all"
        >
          {copiedIndex === -1 ? (
            <>
              <Check size={13} className="text-accent" /> Copied all
            </>
          ) : (
            <>
              <Copy size={13} /> Copy all
            </>
          )}
        </button>
      </div>

      {/* Accordion */}
      <div className="space-y-2">
        {applicationAnswers.answers.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-accent/30 bg-accent/3"
                  : "border-border/50 bg-muted/20 hover:border-border/70"
              }`}
            >
              {/* Question header (clickable) */}
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span
                    className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isOpen
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p
                    className={`text-sm font-medium leading-snug ${
                      isOpen ? "text-foreground" : "text-foreground/80"
                    }`}
                  >
                    {item.question}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp
                    size={15}
                    className="flex-shrink-0 mt-0.5 text-accent"
                  />
                ) : (
                  <ChevronDown
                    size={15}
                    className="flex-shrink-0 mt-0.5 text-muted-foreground"
                  />
                )}
              </button>

              {/* Answer (collapsible) */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-border/30 pt-3">
                  <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>
                  <button
                    onClick={() => handleCopy(item.answer, i)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check size={12} className="text-accent" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy answer
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
