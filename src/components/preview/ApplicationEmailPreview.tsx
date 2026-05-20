"use client";

import { useState } from "react";
import { Copy, Check, Mail, Link } from "lucide-react";
import type { ApplicationEmail } from "@/domain/entities/ApplicationEmail";

const TONE_LABELS: Record<string, string> = {
  professional: "Professional & Detailed",
  friendly:     "Friendly & Polite",
  concise:      "Concise & Job-Focused",
};

export function ApplicationEmailPreview({ email }: { email: ApplicationEmail }) {
  const [copiedField, setCopiedField] = useState<"subject" | "body" | null>(null);

  const footerBlock = email.footerLinks?.length
    ? "\n\n" + email.footerLinks.join("\n")
    : "";

  const fullBody = [
    email.salutation, "",
    ...email.paragraphs,
    "", email.signOff, email.senderName, email.senderEmail,
    footerBlock,
  ].filter(l => l !== undefined).join("\n").trim();

  const copy = async (text: string, field: "subject" | "body") => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Tone badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Tone:</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
          {TONE_LABELS[email.tone] ?? email.tone}
        </span>
      </div>

      {/* Subject */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject Line</span>
          <button onClick={() => copy(email.subject, "subject")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {copiedField === "subject" ? <><Check size={12} className="text-accent" /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <p className="text-sm font-medium text-foreground">{email.subject}</p>
      </div>

      {/* Body */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={13} className="text-accent" />
            <span>Ready to paste into your mail client</span>
          </div>
          <button onClick={() => copy(fullBody, "body")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:border-border text-muted-foreground hover:text-foreground transition-all">
            {copiedField === "body" ? <><Check size={13} className="text-accent" /> Copied!</> : <><Copy size={13} /> Copy all</>}
          </button>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-foreground/90 border-t border-border/30 pt-4">
          <p className="font-medium text-foreground">{email.salutation}</p>
          {email.paragraphs.map((p, i) => <p key={i}>{p}</p>)}

          {/* Signature + footer links */}
          <div className="pt-1 space-y-1">
            <p className="text-muted-foreground">{email.signOff}</p>
            <p className="font-semibold text-foreground">{email.senderName}</p>
            {email.senderEmail && <p className="text-muted-foreground text-xs">{email.senderEmail}</p>}

            {email.footerLinks?.length > 0 && (
              <div className="pt-2 space-y-0.5">
                {email.footerLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Link size={11} className="text-accent flex-shrink-0" />
                    <span className="text-xs text-accent/80">{link}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Copy subject and body separately into your email client. Attach the PDF before sending.
      </p>
    </div>
  );
}
