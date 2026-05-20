"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload, FileText, X, Loader2, Sparkles,
  AlertCircle, Mail, HelpCircle, Send, User, MessageSquare,
  Info, Mic,
} from "lucide-react";
import type { EmailTone } from "@/domain/entities/ApplicationEmail";
import type { LanguageOptions } from "@/domain/services/IResumeOptimizationService";
import { LangSelect } from "@/components/forms/LangSelect";

export interface FormData {
  resumeFile: File | null;
  resumeText: string;
  jobDescription: string;
  languages: LanguageOptions;
  generateCoverLetter: boolean;
  applicationQuestions: string;
  generateApplicationEmail: boolean;
  recipientName: string;
  emailAdditionalInfo: string;
  emailTone: EmailTone;
  generateDirectMessage: boolean;
  dmAdditionalInfo: string;
}

interface ResumeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const EMAIL_TONES: { value: EmailTone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional & Detailed", desc: "Formal, structured, achievement-focused" },
  { value: "friendly",     label: "Friendly & Polite",       desc: "Warm, conversational, genuine personality" },
  { value: "concise",      label: "Concise & Job-Focused",   desc: "Ultra-brief — every word earns its place" },
];

// ── Reusable sub-components ───────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background ${checked ? "bg-accent" : "bg-muted"}`}>
      <span aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const [resumeFile,             setResumeFile]      = useState<File | null>(null);
  const [resumeText,             setResumeText]      = useState("");
  const [jobDescription,         setJobDesc]         = useState("");
  const [languages,              setLanguages]       = useState<LanguageOptions>({ resume: "en", coverLetter: "en", answers: "en", email: "en", dm: "en" });
  const [generateCoverLetter,    setGenCL]           = useState(false);
  const [applicationQuestions,   setAppQ]            = useState("");
  const [generateApplicationEmail, setGenEmail]      = useState(false);
  const [recipientName,          setRecipient]       = useState("");
  const [emailAdditionalInfo,    setEmailExtra]      = useState("");
  const [emailTone,              setEmailTone]       = useState<EmailTone>("professional");
  const [generateDirectMessage,  setGenDM]           = useState(false);
  const [dmAdditionalInfo,       setDmExtra]         = useState("");
  const [isDragOver,             setIsDragOver]      = useState(false);
  const [inputMode,              setInputMode]       = useState<"file" | "text">("file");
  const [errors,                 setErrors]          = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setLang = (key: keyof LanguageOptions) => (val: string) =>
    setLanguages(prev => ({ ...prev, [key]: val }));

  const handleFileSelect = (file: File) => {
    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      setErrors(p => ({ ...p, resume: "Only PDF or text files are supported" })); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(p => ({ ...p, resume: "File must be under 10MB" })); return;
    }
    setErrors(p => ({ ...p, resume: "" }));
    setResumeFile(file);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []); // eslint-disable-line

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (inputMode === "file" && !resumeFile) next.resume = "Please upload your resume";
    if (inputMode === "text" && resumeText.trim().length < 50) next.resume = "Resume text must be at least 50 characters";
    if (jobDescription.trim().length < 30) next.jd = "Please provide a more complete job description";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ resumeFile, resumeText, jobDescription, languages, generateCoverLetter, applicationQuestions, generateApplicationEmail, recipientName, emailAdditionalInfo, emailTone, generateDirectMessage, dmAdditionalInfo });
  };

  const extrasCount = [generateCoverLetter, applicationQuestions.trim(), generateApplicationEmail, generateDirectMessage].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* ── Resume input ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1 mb-3 p-1 bg-muted/50 rounded-lg w-fit">
          {(["file", "text"] as const).map(mode => (
            <button key={mode} type="button" onClick={() => setInputMode(mode)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${inputMode === mode ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {mode === "file" ? "Upload File" : "Paste Text"}
            </button>
          ))}
        </div>

        {inputMode === "file" ? (
          <div onDrop={handleFileDrop}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-8 text-center group ${isDragOver ? "border-accent bg-accent/5 scale-[1.01]" : resumeFile ? "border-accent/40 bg-accent/5" : "border-border hover:border-accent/40 hover:bg-muted/30"}`}>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,text/plain,application/pdf" className="hidden"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            {resumeFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/15 text-accent"><FileText size={20} /></div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{resumeFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB · Ready</p>
                  </div>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setResumeFile(null); }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Upload size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <p className="text-sm font-medium text-foreground">Drop your resume here</p>
                <p className="text-xs text-muted-foreground">PDF or TXT · Max 10MB</p>
              </div>
            )}
          </div>
        ) : (
          <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..." rows={8}
            className="w-full rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 resize-none p-4 font-mono transition-colors" />
        )}
        {errors.resume && <p className="mt-2 text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {errors.resume}</p>}
      </div>

      {/* ── Resume language ───────────────────────────────────────────── */}
      <LangSelect value={languages.resume ?? "en"} onChange={setLang("resume")} label="Resume Language" />

      {/* ── Job description ───────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Job Description <span className="text-accent">*</span>
        </label>
        <textarea value={jobDescription} onChange={e => setJobDesc(e.target.value)}
          placeholder="Paste the full job description here…" rows={8}
          className="w-full rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 resize-none p-4 transition-colors" />
        <div className="flex items-center justify-between mt-1.5">
          {errors.jd ? <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {errors.jd}</p> : <span />}
          <span className={`text-xs ${jobDescription.length > 9000 ? "text-destructive" : "text-muted-foreground"}`}>
            {jobDescription.length.toLocaleString()}/10,000
          </span>
        </div>
      </div>

      {/* ── Optional extras — scrollable on mobile ────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Optional Extras</p>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto overflow-x-visible pr-1 pb-2 scrollbar-thin">

          {/* 1. Cover Letter */}
          <div className={`rounded-xl border transition-colors duration-200 ${generateCoverLetter ? "border-accent/30 bg-accent/5" : "border-border/50 bg-muted/20 hover:border-border/70"}`}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${generateCoverLetter ? "bg-accent/15 text-accent" : "bg-muted/60 text-muted-foreground"}`}>
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Generate Cover Letter</p>
                  <p className="text-xs text-muted-foreground mt-0.5">AI-written, tailored to the role</p>
                </div>
              </div>
              <ToggleSwitch checked={generateCoverLetter} onChange={() => setGenCL(v => !v)} />
            </div>
            {generateCoverLetter && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3">
                <LangSelect value={languages.coverLetter ?? "en"} onChange={setLang("coverLetter")} label="Cover Letter Language" />
              </div>
            )}
          </div>

          {/* 2. Application Questions */}
          <div className={`rounded-xl border transition-all duration-200 overflow-visible ${applicationQuestions.trim() ? "border-accent/30 bg-accent/5" : "border-border/50 bg-muted/20 hover:border-border/70"}`}>
            <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
              <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${applicationQuestions.trim() ? "bg-accent/15 text-accent" : "bg-muted/60 text-muted-foreground"}`}>
                <HelpCircle size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Application Questions</p>
                <p className="text-xs text-muted-foreground mt-0.5">Paste questions — AI answers from your background</p>
              </div>
            </div>
            <textarea
              value={applicationQuestions}
              onChange={e => setAppQ(e.target.value)}
              placeholder={"e.g.:\nWhy do you want to work here?\nDescribe a challenging project you led."}
              rows={4}
              className="w-full min-h-[6rem] bg-transparent border-0 border-t border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 resize-y overflow-auto px-4 py-3"
            />
            {applicationQuestions.trim() && (
              <div className="px-4 pb-4 pt-1 relative z-10">
                <LangSelect value={languages.answers ?? "en"} onChange={setLang("answers")} label="Answers Language" />
              </div>
            )}
          </div>

          {/* 3. Application Email */}
          <div className={`rounded-xl border transition-colors duration-200 ${generateApplicationEmail ? "border-accent/30 bg-accent/5" : "border-border/50 bg-muted/20 hover:border-border/70"}`}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${generateApplicationEmail ? "bg-accent/15 text-accent" : "bg-muted/60 text-muted-foreground"}`}>
                  <Send size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Generate Application Email</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Professional email to send with your resume</p>
                </div>
              </div>
              <ToggleSwitch checked={generateApplicationEmail} onChange={() => setGenEmail(v => !v)} />
            </div>

            {generateApplicationEmail && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                {/* Recipient */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Recipient name <span className="font-normal opacity-60">(optional)</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input type="text" value={recipientName} onChange={e => setRecipient(e.target.value)}
                      placeholder='e.g. "Sarah Chen" — uses "Hiring Manager" if blank'
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors" />
                  </div>
                </div>

                {/* Tone selector */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Mic size={11} /> Language Tone
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {EMAIL_TONES.map(t => (
                      <button key={t.value} type="button" onClick={() => setEmailTone(t.value)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${emailTone === t.value ? "border-accent/40 bg-accent/10 text-accent" : "border-border/50 text-muted-foreground hover:border-border/80 hover:text-foreground"}`}>
                        <p className="font-medium mb-0.5">{t.label}</p>
                        <p className="opacity-70 leading-snug">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional info */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Info size={11} /> Additional Information <span className="font-normal opacity-60">(optional)</span>
                  </label>
                  <textarea value={emailAdditionalInfo} onChange={e => setEmailExtra(e.target.value)}
                    placeholder="Extra context to weave into the email, e.g. referral name, specific project, availability…"
                    rows={2}
                    className="w-full rounded-lg bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none px-3 py-2.5 transition-colors" />
                </div>

                <LangSelect value={languages.email ?? "en"} onChange={setLang("email")} label="Email Language" />
              </div>
            )}
          </div>

          {/* 4. Direct Message */}
          <div className={`rounded-xl border transition-colors duration-200 ${generateDirectMessage ? "border-accent/30 bg-accent/5" : "border-border/50 bg-muted/20 hover:border-border/70"}`}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${generateDirectMessage ? "bg-accent/15 text-accent" : "bg-muted/60 text-muted-foreground"}`}>
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Generate DM for Recruiter</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Short LinkedIn-style message · ≤250 chars</p>
                </div>
              </div>
              <ToggleSwitch checked={generateDirectMessage} onChange={() => setGenDM(v => !v)} />
            </div>

            {generateDirectMessage && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Info size={11} /> Additional Information <span className="font-normal opacity-60">(optional)</span>
                  </label>
                  <textarea value={dmAdditionalInfo} onChange={e => setDmExtra(e.target.value)}
                    placeholder="E.g. mutual connection, referral, company event you attended…"
                    rows={2}
                    className="w-full rounded-lg bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none px-3 py-2.5 transition-colors" />
                </div>
                <LangSelect value={languages.dm ?? "en"} onChange={setLang("dm")} label="DM Language" />
              </div>
            )}
          </div>

        </div>{/* end scrollable extras */}
      </div>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <button type="submit" disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 glow-accent active:scale-[0.99]">
        {isLoading
          ? <><Loader2 size={18} className="animate-spin" /> Analyzing & Optimizing…</>
          : <><Sparkles size={18} />{extrasCount > 0 ? `Generate Resume + ${extrasCount} Extra${extrasCount > 1 ? "s" : ""}` : "Generate Tailored Resume"}</>
        }
      </button>
    </form>
  );
}
