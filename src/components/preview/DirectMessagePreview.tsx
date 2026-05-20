"use client";

import { useState } from "react";
import { Copy, Check, MessageSquare } from "lucide-react";
import type { DirectMessage } from "@/domain/entities/DirectMessage";

export function DirectMessagePreview({ dm }: { dm: DirectMessage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(dm.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remaining = 250 - dm.message.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-accent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recruiter / Hiring Manager DM
            </span>
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:border-border text-muted-foreground hover:text-foreground transition-all">
            {copied ? <><Check size={13} className="text-accent" /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>

        {/* Message bubble */}
        <div className="bg-accent/8 border border-accent/20 rounded-xl p-4">
          <p className="text-sm leading-relaxed text-foreground">{dm.message}</p>
        </div>

        {/* Character count */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            Ready to send on LinkedIn, email, or any messaging platform
          </p>
          <span className={`text-xs font-mono font-medium ${remaining < 0 ? "text-destructive" : remaining < 20 ? "text-amber-400" : "text-muted-foreground"}`}>
            {dm.message.length}/250
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Paste directly into LinkedIn InMail, connection request, or an introductory email.
      </p>
    </div>
  );
}
