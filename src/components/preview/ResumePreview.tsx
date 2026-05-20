"use client";

import { useState, useEffect } from "react";
import {
  Download, RefreshCw, Eye, List, FileText,
  Mail, HelpCircle, Send, MessageSquare, Edit3,
  ZoomIn, ZoomOut, RotateCcw,
} from "lucide-react";
import type { OptimizedResume } from "@/domain/entities/OptimizedResume";
import type { CoverLetter } from "@/domain/entities/CoverLetter";
import type { ApplicationAnswers } from "@/domain/entities/ApplicationAnswers";
import type { ApplicationEmail } from "@/domain/entities/ApplicationEmail";
import type { DirectMessage } from "@/domain/entities/DirectMessage";
import { MatchScoreRing } from "./MatchScoreRing";
import { ChangeSummary } from "./ChangeSummary";
import { CoverLetterPreview } from "./CoverLetterPreview";
import { ApplicationAnswersPreview } from "./ApplicationAnswersPreview";
import { ApplicationEmailPreview } from "./ApplicationEmailPreview";
import { DirectMessagePreview } from "./DirectMessagePreview";
import { ResumeEditor } from "./ResumeEditor";

interface ResumePreviewProps {
  optimizedResume: OptimizedResume;
  pdfBase64?: string;
  coverLetter?: CoverLetter | null;
  applicationAnswers?: ApplicationAnswers | null;
  applicationEmail?: ApplicationEmail | null;
  directMessage?: DirectMessage | null;
  onRegenerate: () => void;
  onResumeUpdate: (updated: OptimizedResume, newPdf: string) => void;
}

type TabId = "preview" | "edit" | "details" | "cover-letter" | "app-answers" | "email" | "dm";
interface Tab { id: TabId; label: string; icon: React.ElementType; badge?: number }

const ZOOM_STEP = 0.15;
const ZOOM_MIN  = 0.5;
const ZOOM_MAX  = 2.0;
/** US Letter at ~96 CSS px/in — native iframe dimensions (no CSS transform scale). */
const PDF_BASE_WIDTH  = 816;
const PDF_BASE_HEIGHT = 1056;

export function ResumePreview({
  optimizedResume, pdfBase64, coverLetter, applicationAnswers,
  applicationEmail, directMessage, onRegenerate, onResumeUpdate,
}: ResumePreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("preview");
  const [zoom, setZoom]           = useState(1.0);
  const [currentPdf, setCurrentPdf] = useState(pdfBase64);
  const [currentResume, setCurrentResume] = useState(optimizedResume);
  const [editorRevision, setEditorRevision] = useState(0);

  useEffect(() => {
    setCurrentResume(optimizedResume);
    setCurrentPdf(pdfBase64);
  }, [optimizedResume, pdfBase64]);

  const tabs: Tab[] = [
    { id: "preview",      label: "PDF Preview",  icon: Eye },
    { id: "edit",         label: "Edit",          icon: Edit3 },
    { id: "details",      label: "AI Changes",    icon: List },
    ...(coverLetter        ? [{ id: "cover-letter" as TabId, label: "Cover Letter", icon: Mail }] : []),
    ...(applicationAnswers ? [{ id: "app-answers"  as TabId, label: "Answers",      icon: HelpCircle, badge: applicationAnswers.answers.length }] : []),
    ...(applicationEmail   ? [{ id: "email"        as TabId, label: "Email",         icon: Send }] : []),
    ...(directMessage      ? [{ id: "dm"           as TabId, label: "DM",            icon: MessageSquare }] : []),
  ];

  const handleDownload = () => {
    if (!currentPdf) return;
    const bytes = Uint8Array.from(atob(currentPdf), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: `${currentResume.personalInfo.name.replace(/\s+/g, "_")}_Resume_Tailored.pdf`,
    }).click();
    URL.revokeObjectURL(url);
  };

  const handleEditorSave = (updated: OptimizedResume, newPdf: string) => {
    setCurrentResume(updated);
    setCurrentPdf(newPdf);
    setEditorRevision(r => r + 1);
    onResumeUpdate(updated, newPdf);
    setActiveTab("preview");
  };

  const metaParts = [
    coverLetter        ? "Cover letter"                              : null,
    applicationAnswers ? `${applicationAnswers.answers.length} answers` : null,
    applicationEmail   ? "Email ready"                              : null,
    directMessage      ? "DM ready"                                 : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full gap-4">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <MatchScoreRing score={currentResume.matchScore} />
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">{currentResume.personalInfo.name}</h3>
            <p className="text-xs text-muted-foreground">
              {currentResume.language !== "en" ? `Translated to ${currentResume.language.toUpperCase()} · ` : ""}
              {metaParts.length > 0 ? metaParts.join(" · ") : "Resume ready"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border/60 hover:border-border transition-colors">
            <RefreshCw size={14} /> Regenerate
          </button>
          <button onClick={handleDownload} disabled={!currentPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-accent">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 p-1 bg-muted/40 rounded-lg flex-wrap">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm transition-all duration-200 ${activeTab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
            {badge != null && (
              <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === id ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">

        {activeTab === "preview" && (
          <div className="flex flex-col gap-2 h-full">
            {/* Zoom controls */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
                disabled={zoom <= ZOOM_MIN}
                className="p-1.5 rounded-lg border border-border/60 hover:border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-muted-foreground w-12 text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
                disabled={zoom >= ZOOM_MAX}
                className="p-1.5 rounded-lg border border-border/60 hover:border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                <ZoomIn size={14} />
              </button>
              <button onClick={() => setZoom(1.0)}
                className="p-1.5 rounded-lg border border-border/60 hover:border-border text-muted-foreground hover:text-foreground transition-colors" title="Reset zoom">
                <RotateCcw size={14} />
              </button>
            </div>

            {currentPdf ? (
              <div className="pdf-viewer-wrapper flex-1 min-h-[400px] overflow-auto">
                <iframe
                  src={`data:application/pdf;base64,${currentPdf}#toolbar=0&view=FitH`}
                  title="Resume Preview"
                  className="block rounded-xl border-0"
                  style={{
                    width: `${PDF_BASE_WIDTH * zoom}px`,
                    height: `${PDF_BASE_HEIGHT * zoom}px`,
                    maxWidth: "none",
                  }}
                />
              </div>
            ) : <ResumeTextFallback resume={currentResume} />}
          </div>
        )}

        {activeTab === "edit" && (
          <ResumeEditor
            key={editorRevision}
            resume={currentResume}
            onSave={handleEditorSave}
          />
        )}

        {activeTab === "details" && (
          <div className="glass-card p-5 h-full overflow-y-auto">
            <ChangeSummary resume={currentResume} />
            <div className="mt-5 pt-5 border-t border-border/40">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText size={11} className="text-accent" /> Resume Structure
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Experience",       count: currentResume.experience.length },
                  { label: "Education",        count: currentResume.education.length },
                  { label: "Skill Categories", count: currentResume.skills.length },
                  { label: "Keywords",         count: currentResume.keywords.length },
                  { label: "Certifications",   count: currentResume.certifications?.length ?? 0 },
                  { label: "Projects",         count: currentResume.projects?.length ?? 0 },
                ].map(({ label, count }) => (
                  <div key={label} className="flex justify-between items-center py-1 px-2 rounded bg-muted/40">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cover-letter" && coverLetter && (
          <div className="h-full overflow-y-auto"><CoverLetterPreview coverLetter={coverLetter} /></div>
        )}

        {activeTab === "app-answers" && applicationAnswers && (
          <div className="glass-card p-5 h-full overflow-y-auto">
            <ApplicationAnswersPreview answers={applicationAnswers} />
          </div>
        )}

        {activeTab === "email" && applicationEmail && (
          <div className="h-full overflow-y-auto"><ApplicationEmailPreview email={applicationEmail} /></div>
        )}

        {activeTab === "dm" && directMessage && (
          <DirectMessagePreview dm={directMessage} />
        )}

      </div>
    </div>
  );
}

function ResumeTextFallback({ resume }: { resume: OptimizedResume }) {
  return (
    <div className="glass-card p-6 overflow-y-auto max-h-[700px] font-mono text-xs text-foreground/80 leading-relaxed space-y-4">
      <div>
        <p className="text-base font-serif font-bold text-foreground">{resume.personalInfo.name}</p>
        <p className="text-muted-foreground">
          {[resume.personalInfo.email, resume.personalInfo.phone, resume.personalInfo.location].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div>
        <p className="text-accent font-semibold uppercase text-xs tracking-widest mb-1">Summary</p>
        <p>{resume.summary}</p>
      </div>
      <div>
        <p className="text-accent font-semibold uppercase text-xs tracking-widest mb-1">Experience</p>
        {resume.experience.map((job, i) => (
          <div key={i} className="mb-3">
            <p className="font-semibold text-foreground">{job.title} @ {job.company}</p>
            <p className="text-muted-foreground">{job.startDate} – {job.endDate}</p>
            {job.achievements.map((a, j) => <p key={j} className="ml-2">• {a}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}
