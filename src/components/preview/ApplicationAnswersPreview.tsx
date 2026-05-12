"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ApplicationAnswers } from "@/domain/entities/ApplicationAnswers";

export function ApplicationAnswersPreview({ answers }: { answers: ApplicationAnswers }) {
  const [openIndex,   setOpenIndex]   = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyAll = async () => {
    const text = answers.answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyOne = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{answers.answers.length} question{answers.answers.length !== 1 ? "s" : ""} answered</p>
        <button onClick={copyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:border-border text-muted-foreground hover:text-foreground transition-all">
          {copiedIndex === -1 ? <><Check size={13} className="text-accent" /> Copied all</> : <><Copy size={13} /> Copy all</>}
        </button>
      </div>

      <div className="space-y-2">
        {answers.answers.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`rounded-xl border overflow-hidden transition-all duration-200 ${isOpen ? "border-accent/30 bg-accent/5" : "border-border/50 bg-muted/20 hover:border-border/70"}`}>
              <button type="button" onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isOpen ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium leading-snug text-foreground/90">{item.question}</p>
                </div>
                {isOpen ? <ChevronUp size={15} className="flex-shrink-0 mt-0.5 text-accent" /> : <ChevronDown size={15} className="flex-shrink-0 mt-0.5 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-border/30 pt-3">
                  <p className="text-sm text-foreground/85 leading-relaxed">{item.answer}</p>
                  <button onClick={() => copyOne(item.answer, i)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {copiedIndex === i ? <><Check size={12} className="text-accent" /> Copied</> : <><Copy size={12} /> Copy answer</>}
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
