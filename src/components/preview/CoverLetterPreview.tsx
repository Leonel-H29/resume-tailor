"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { CoverLetter } from "@/domain/entities/CoverLetter";

export function CoverLetterPreview({ coverLetter }: { coverLetter: CoverLetter }) {
  const [copied, setCopied] = useState(false);

  const fullText = [
    coverLetter.salutation, "",
    coverLetter.opening, "",
    ...coverLetter.body,
    "", coverLetter.closing, "",
    coverLetter.signOff, coverLetter.candidateName,
  ].join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Ready to paste into your application portal</p>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:border-border text-muted-foreground hover:text-foreground transition-all">
          {copied ? <><Check size={13} className="text-accent" /> Copied!</> : <><Copy size={13} /> Copy text</>}
        </button>
      </div>

      <div className="glass-card p-6 flex-1 overflow-y-auto space-y-4 text-sm leading-relaxed text-foreground/90">
        <p className="font-medium text-foreground">{coverLetter.salutation}</p>
        <p>{coverLetter.opening}</p>
        {coverLetter.body.map((p, i) => <p key={i}>{p}</p>)}
        <p>{coverLetter.closing}</p>
        <div className="pt-2">
          <p className="text-muted-foreground">{coverLetter.signOff}</p>
          <p className="font-semibold text-foreground mt-1">{coverLetter.candidateName}</p>
        </div>
      </div>
    </div>
  );
}
