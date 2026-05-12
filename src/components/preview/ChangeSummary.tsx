"use client";

import { Sparkles } from "lucide-react";
import type { OptimizedResume } from "@/domain/entities/OptimizedResume";

interface ChangeSummaryProps {
  resume: OptimizedResume;
}

export function ChangeSummary({ resume }: ChangeSummaryProps) {
  const { changes = [], keywords } = resume;

  return (
    <div className="space-y-4">
      {/* Keywords */}
      {keywords.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent" />
            Keywords Injected
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {keywords.slice(0, 20).map((kw) => (
              <span key={kw} className="keyword-badge">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Changes */}
      {changes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Changes Made
          </h4>
          <div className="space-y-1.5">
            {changes.map((change, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                <span className="text-muted-foreground">
                  <span className="text-foreground font-medium">{change.section}: </span>
                  {change.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
