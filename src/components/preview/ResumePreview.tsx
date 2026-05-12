"use client";

import { useState } from "react";
import { Download, RefreshCw, Eye, List, FileText, Mail, HelpCircle } from "lucide-react";
import type { OptimizedResume } from "@/domain/entities/OptimizedResume";
import type { CoverLetter } from "@/domain/entities/CoverLetter";
import type { ApplicationAnswers } from "@/domain/entities/ApplicationAnswers";
import { MatchScoreRing } from "./MatchScoreRing";
import { ChangeSummary } from "./ChangeSummary";
import { CoverLetterPreview } from "./CoverLetterPreview";
import { ApplicationAnswersPreview } from "./ApplicationAnswersPreview";

interface ResumePreviewProps {
  optimizedResume: OptimizedResume;
  pdfBase64?: string;
  coverLetter?: CoverLetter | null;
  applicationAnswers?: ApplicationAnswers | null;
  onRegenerate: () => void;
}

type TabId = "preview" | "details" | "cover-letter" | "app-answers";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export function ResumePreview({
  optimizedResume,
  pdfBase64,
  coverLetter,
  applicationAnswers,
  onRegenerate,
}: ResumePreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("preview");

  // Build tab list dynamically based on available data
  const tabs: Tab[] = [
    { id: "preview", label: "PDF Preview", icon: Eye },
    { id: "details", label: "AI Changes", icon: List },
    ...(coverLetter
      ? [{ id: "cover-letter" as TabId, label: "Cover Letter", icon: Mail }]
      : []),
    ...(applicationAnswers
      ? [
          {
            id: "app-answers" as TabId,
            label: "App Answers",
            icon: HelpCircle,
            badge: applicationAnswers.answers.length,
          },
        ]
      : []),
  ];

  const handleDownload = () => {
    if (!pdfBase64) return;
    const byteChars = atob(pdfBase64);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArr[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArr], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${optimizedResume.personalInfo.name.replace(/\s+/g, "_")}_Resume_Tailored.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* ── Header: score + actions ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <MatchScoreRing score={optimizedResume.matchScore} />
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {optimizedResume.personalInfo.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Generated{" "}
              {optimizedResume.generatedAt
                ? new Date(optimizedResume.generatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "just now"}
              {" · "}
              {optimizedResume.language !== "en"
                ? `Translated to ${optimizedResume.language.toUpperCase()}`
                : "English"}
              {coverLetter ? " · Cover letter included" : ""}
              {applicationAnswers
                ? ` · ${applicationAnswers.answers.length} answers`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border/60 hover:border-border transition-colors"
          >
            <RefreshCw size={14} />
            Regenerate
          </button>
          <button
            onClick={handleDownload}
            disabled={!pdfBase64}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-accent"
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 p-1 bg-muted/40 rounded-lg w-fit flex-wrap">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
              activeTab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            {label}
            {badge != null && (
              <span
                className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  activeTab === id
                    ? "bg-accent/15 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        {activeTab === "preview" && (
          <>
            {pdfBase64 ? (
              <div className="pdf-viewer-wrapper h-full min-h-[600px]">
                <iframe
                  src={`data:application/pdf;base64,${pdfBase64}#toolbar=0`}
                  className="w-full h-full min-h-[600px] rounded-xl"
                  title="Resume Preview"
                />
              </div>
            ) : (
              <ResumeTextFallback resume={optimizedResume} />
            )}
          </>
        )}

        {activeTab === "details" && (
          <div className="glass-card p-5 h-full overflow-y-auto">
            <ChangeSummary resume={optimizedResume} />
            <div className="mt-5 pt-5 border-t border-border/40">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText size={11} className="text-accent" />
                Resume Structure
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Experience", count: optimizedResume.experience.length },
                  { label: "Education", count: optimizedResume.education.length },
                  { label: "Skill Categories", count: optimizedResume.skills.length },
                  { label: "Keywords", count: optimizedResume.keywords.length },
                  { label: "Certifications", count: optimizedResume.certifications?.length ?? 0 },
                  { label: "Projects", count: optimizedResume.projects?.length ?? 0 },
                ].map(({ label, count }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-1 px-2 rounded bg-muted/40"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cover-letter" && coverLetter && (
          <CoverLetterPreview coverLetter={coverLetter} />
        )}

        {activeTab === "app-answers" && applicationAnswers && (
          <div className="glass-card p-5 h-full overflow-y-auto">
            <ApplicationAnswersPreview applicationAnswers={applicationAnswers} />
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeTextFallback({ resume }: { resume: OptimizedResume }) {
  return (
    <div className="glass-card p-6 overflow-y-auto max-h-[700px] font-mono text-xs text-foreground/80 leading-relaxed space-y-4">
      <div>
        <p className="text-base font-serif font-bold text-foreground">
          {resume.personalInfo.name}
        </p>
        <p className="text-muted-foreground">
          {[resume.personalInfo.email, resume.personalInfo.phone, resume.personalInfo.location]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div>
        <p className="text-accent font-semibold uppercase text-xs tracking-widest mb-1">
          Summary
        </p>
        <p>{resume.summary}</p>
      </div>
      <div>
        <p className="text-accent font-semibold uppercase text-xs tracking-widest mb-1">
          Experience
        </p>
        {resume.experience.map((job, i) => (
          <div key={i} className="mb-3">
            <p className="font-semibold text-foreground">
              {job.title} @ {job.company}
            </p>
            <p className="text-muted-foreground">
              {job.startDate} – {job.endDate}
            </p>
            {job.achievements.map((a, j) => (
              <p key={j} className="ml-2">
                • {a}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
