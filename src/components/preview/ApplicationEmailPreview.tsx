"use client";

import { useState } from "react";
import { Copy, Check, Mail } from "lucide-react";
import type { ApplicationEmail } from "@/domain/entities/ApplicationEmail";

export function ApplicationEmailPreview({ email }: { email: ApplicationEmail }) {
  const [copiedField, setCopiedField] = useState<"subject" | "body" | null>(null);

  const fullBody = [
    email.salutation, "",
    ...email.paragraphs,
    "", email.signOff, email.senderName, email.senderEmail,
  ].join("\n");

  const copy = async (text: string, field: "subject" | "body") => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
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
          <div className="pt-1">
            <p className="text-muted-foreground">{email.signOff}</p>
            <p className="font-semibold text-foreground mt-1">{email.senderName}</p>
            {email.senderEmail && <p className="text-muted-foreground text-xs mt-0.5">{email.senderEmail}</p>}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Copy the subject and body separately into your email client. Attach the downloaded PDF before sending.
      </p>
    </div>
  );
}
