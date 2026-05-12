'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  ChevronDown,
  Loader2,
  Sparkles,
  AlertCircle,
  Mail,
  HelpCircle,
} from 'lucide-react';

export interface FormData {
  resumeFile: File | null;
  resumeText: string;
  jobDescription: string;
  language: string;
  generateCoverLetter: boolean;
  applicationQuestions: string;
}

interface ResumeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (default)' },
  { value: 'auto', label: 'Match job description language' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese (Simplified)' },
];

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false);
  const [applicationQuestions, setApplicationQuestions] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (file: File) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
    if (
      !allowed.includes(file.type) &&
      !file.name.endsWith('.txt') &&
      !file.name.endsWith('.md')
    ) {
      setErrors((p) => ({
        ...p,
        resume: 'Only PDF or text files are supported',
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((p) => ({ ...p, resume: 'File must be under 10MB' }));
      return;
    }
    setErrors((p) => ({ ...p, resume: '' }));
    setResumeFile(file);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (inputMode === 'file' && !resumeFile) {
      newErrors.resume = 'Please upload your resume';
    }
    if (inputMode === 'text' && resumeText.trim().length < 50) {
      newErrors.resume = 'Resume text must be at least 50 characters';
    }
    if (jobDescription.trim().length < 30) {
      newErrors.jobDescription =
        'Please provide a more complete job description';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      resumeFile,
      resumeText,
      jobDescription,
      language,
      generateCoverLetter,
      applicationQuestions,
    });
  };

  const selectedLang = LANGUAGE_OPTIONS.find((l) => l.value === language);

  // Count how many optional extras are enabled for button label
  const extraCount =
    (generateCoverLetter ? 1 : 0) + (applicationQuestions.trim() ? 1 : 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Resume Input Toggle ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1 mb-3 p-1 bg-muted/50 rounded-lg w-fit">
          {(['file', 'text'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                inputMode === mode
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'file' ? 'Upload File' : 'Paste Text'}
            </button>
          ))}
        </div>

        {inputMode === 'file' ? (
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-8 text-center group ${
              isDragOver
                ? 'border-accent bg-accent/5 scale-[1.01]'
                : resumeFile
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-border hover:border-accent/40 hover:bg-muted/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,text/plain,application/pdf"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
            />
            {resumeFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/15 text-accent">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(resumeFile.size / 1024).toFixed(1)} KB · Ready to
                      process
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResumeFile(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Upload
                    size={20}
                    className="text-muted-foreground group-hover:text-accent transition-colors"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drop your resume here
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PDF or TXT · Max 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            rows={8}
            className="w-full rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 resize-none p-4 font-mono transition-colors"
          />
        )}

        {errors.resume && (
          <p className="mt-2 text-xs text-destructive flex items-center gap-1">
            <AlertCircle size={12} /> {errors.resume}
          </p>
        )}
      </div>

      {/* ── Job Description ─────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Job Description <span className="text-accent">*</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here — the more detail, the better the optimization..."
          rows={8}
          className="w-full rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 resize-none p-4 transition-colors"
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.jobDescription ? (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle size={12} /> {errors.jobDescription}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ${
              jobDescription.length > 9000
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {jobDescription.length.toLocaleString()}/10,000
          </span>
        </div>
      </div>

      {/* ── Language Selector ───────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Output Language
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Applies to resume, cover letter, and application answers
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground hover:border-accent/40 transition-colors focus:outline-none focus:ring-1 focus:ring-accent/50"
          >
            <span>{selectedLang?.label}</span>
            <ChevronDown
              size={16}
              className={`text-muted-foreground transition-transform duration-200 ${
                showLangDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showLangDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 glass-card overflow-hidden">
              <div className="max-h-52 overflow-y-auto py-1">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setLanguage(opt.value);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      language === opt.value
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Optional Extras ─────────────────────────────────────────────── */}
      <div className="space-y-4 pt-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Optional Extras
        </p>

        {/* Cover Letter Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg transition-colors ${
                generateCoverLetter
                  ? 'bg-accent/15 text-accent'
                  : 'bg-muted/60 text-muted-foreground'
              }`}
            >
              <Mail size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Generate Cover Letter
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI-written, tailored to the role and your background
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={generateCoverLetter}
            onClick={() => setGenerateCoverLetter((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background ${
              generateCoverLetter ? 'bg-accent' : 'bg-muted'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                generateCoverLetter ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Application Questions Textarea */}
        <div
          className={`rounded-xl border transition-all duration-200 overflow-hidden ${
            applicationQuestions.trim()
              ? 'border-accent/30 bg-accent/3'
              : 'border-border/50 bg-muted/30'
          }`}
        >
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <div
              className={`p-2 rounded-lg transition-colors ${
                applicationQuestions.trim()
                  ? 'bg-accent/15 text-accent'
                  : 'bg-muted/60 text-muted-foreground'
              }`}
            >
              <HelpCircle size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Application Questions
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paste company-specific questions — AI will answer them using
                your background
              </p>
            </div>
          </div>
          <textarea
            value={applicationQuestions}
            onChange={(e) => setApplicationQuestions(e.target.value)}
            placeholder={
              'e.g.:\nWhy do you want to work here?\nDescribe a challenging project you led.\nWhat are your salary expectations?'
            }
            rows={4}
            className="w-full bg-transparent border-0 border-t border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none px-4 py-3 transition-colors"
          />
        </div>
      </div>

      {/* ── Submit Button ───────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 glow-accent active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing & Optimizing...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate
            {extraCount > 0
              ? ` Resume + ${extraCount} Extra${extraCount > 1 ? 's' : ''}`
              : ' Tailored Resume'}
          </>
        )}
      </button>
    </form>
  );
}
