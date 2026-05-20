"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { OptimizedResume } from "@/domain/entities/OptimizedResume";
import type { WorkExperience } from "@/domain/entities/WorkExperience";
import { apiPostJson } from "@/lib/apiClient";

interface ResumeEditorProps {
  resume: OptimizedResume;
  onSave: (updated: OptimizedResume, newPdfBase64: string) => void;
}

// ── Tiny reusable field components ───────────────────────────────────────────

function Field({ label, value, onChange, multiline = false, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; rows?: number;
}) {
  const base = "w-full bg-muted/40 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 px-3 py-2 transition-colors";
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className={`${base} resize-y min-h-[2.5rem]`} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={base} />
      }
    </div>
  );
}

/**
 * Comma-separated skills input: keeps a local raw string so partial tokens (e.g. trailing ", Java")
 * are not stripped by re-joining on every keystroke — the root cause of "can't type after PDF save".
 */
function SkillsCommaInput({
  skills,
  onSkillsChange,
}: {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}) {
  const skillsKey = skills.join("\u0001");
  const [text, setText] = useState(() => skills.join(", "));
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setText(skills.join(", "));
  }, [skillsKey, skills]);

  const handleChange = (raw: string) => {
    isInternalChange.current = true;
    setText(raw);
    onSkillsChange(
      raw.split(",").map(s => s.trim()).filter(Boolean)
    );
  };

  return (
    <Field
      label="Skills (comma-separated)"
      value={text}
      onChange={handleChange}
    />
  );
}

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between py-2 text-xs font-semibold text-accent uppercase tracking-widest border-b border-accent/30 mb-3">
      {title}
      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResumeEditor({ resume, onSave }: ResumeEditorProps) {
  const [draft, setDraft] = useState<OptimizedResume>(() => structuredClone(resume));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({
    personal: true, summary: true, experience: true,
    education: false, skills: false, certs: false,
  });

  const toggle = (key: string) => setOpen(p => ({ ...p, [key]: !p[key] }));

  const setPersonal = (key: string) => (val: string) =>
    setDraft(p => ({ ...p, personalInfo: { ...p.personalInfo, [key]: val } }));

  const setExp = (i: number, key: keyof WorkExperience) => (val: string | string[]) =>
    setDraft(p => {
      const exp = [...p.experience];
      exp[i] = { ...exp[i], [key]: val };
      return { ...p, experience: exp };
    });

  const setExpAchievement = (expIdx: number, achIdx: number, val: string) =>
    setDraft(p => {
      const exp = [...p.experience];
      const achievements = [...exp[expIdx].achievements];
      achievements[achIdx] = val;
      exp[expIdx] = { ...exp[expIdx], achievements };
      return { ...p, experience: exp };
    });

  const addAchievement = (expIdx: number) =>
    setDraft(p => {
      const exp = [...p.experience];
      exp[expIdx] = { ...exp[expIdx], achievements: [...exp[expIdx].achievements, ""] };
      return { ...p, experience: exp };
    });

  const removeAchievement = (expIdx: number, achIdx: number) =>
    setDraft(p => {
      const exp = [...p.experience];
      const achievements = exp[expIdx].achievements.filter((_, i) => i !== achIdx);
      exp[expIdx] = { ...exp[expIdx], achievements };
      return { ...p, experience: exp };
    });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await apiPostJson<{ success: boolean; pdfBase64: string }>("/api/pdf", draft);
      onSave(draft, data.pdfBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate PDF");
    } finally {
      setSaving(false);
    }
  };

  const pi = draft.personalInfo;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Edit any field, then save to regenerate the PDF.</p>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-all glow-accent">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Apply & Regenerate</>}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="glass-card p-5 overflow-y-auto max-h-[65vh] space-y-5">

        <div>
          <SectionHeader title="Personal Info" open={!!open.personal} onToggle={() => toggle("personal")} />
          {open.personal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name"  value={pi.name     ?? ""} onChange={setPersonal("name")} />
              <Field label="Email"      value={pi.email    ?? ""} onChange={setPersonal("email")} />
              <Field label="Phone"      value={pi.phone    ?? ""} onChange={setPersonal("phone")} />
              <Field label="Location"   value={pi.location ?? ""} onChange={setPersonal("location")} />
              <Field label="LinkedIn"   value={pi.linkedin ?? ""} onChange={setPersonal("linkedin")} />
              <Field label="GitHub"     value={pi.github   ?? ""} onChange={setPersonal("github")} />
              <Field label="Website"    value={pi.website  ?? ""} onChange={setPersonal("website")} />
            </div>
          )}
        </div>

        <div>
          <SectionHeader title="Professional Summary" open={!!open.summary} onToggle={() => toggle("summary")} />
          {open.summary && (
            <Field label="Summary" value={draft.summary} multiline rows={4}
              onChange={v => setDraft(p => ({ ...p, summary: v }))} />
          )}
        </div>

        <div>
          <SectionHeader title="Experience" open={!!open.experience} onToggle={() => toggle("experience")} />
          {open.experience && (
            <div className="space-y-5">
              {draft.experience.map((job, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Job Title"  value={job.title}      onChange={v => setExp(i, "title")(v)} />
                    <Field label="Company"    value={job.company}    onChange={v => setExp(i, "company")(v)} />
                    <Field label="Location"   value={job.location ?? ""} onChange={v => setExp(i, "location")(v)} />
                    <Field label="Start Date" value={job.startDate}  onChange={v => setExp(i, "startDate")(v)} />
                    <Field label="End Date"   value={job.endDate}    onChange={v => setExp(i, "endDate")(v)} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Achievements</label>
                    <div className="space-y-2">
                      {job.achievements.map((ach, j) => (
                        <div key={j} className="flex gap-2 items-start">
                          <span className="text-accent mt-2 text-xs flex-shrink-0">•</span>
                          <textarea value={ach} onChange={e => setExpAchievement(i, j, e.target.value)} rows={2}
                            className="flex-1 bg-muted/40 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 px-3 py-2 resize-y min-h-[2.5rem] transition-colors" />
                          <button type="button" onClick={() => removeAchievement(i, j)}
                            className="mt-2 p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addAchievement(i)}
                        className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors mt-1">
                        <Plus size={12} /> Add achievement
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader title="Education" open={!!open.education} onToggle={() => toggle("education")} />
          {open.education && (
            <div className="space-y-4">
              {draft.education.map((edu, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Institution"  value={edu.institution}       onChange={v => setDraft(p => { const e = [...p.education]; e[i] = { ...e[i], institution: v }; return { ...p, education: e }; })} />
                    <Field label="Degree"       value={edu.degree}            onChange={v => setDraft(p => { const e = [...p.education]; e[i] = { ...e[i], degree: v };      return { ...p, education: e }; })} />
                    <Field label="Field"        value={edu.field        ?? ""} onChange={v => setDraft(p => { const e = [...p.education]; e[i] = { ...e[i], field: v };       return { ...p, education: e }; })} />
                    <Field label="Grad. Date"   value={edu.graduationDate}    onChange={v => setDraft(p => { const e = [...p.education]; e[i] = { ...e[i], graduationDate: v }; return { ...p, education: e }; })} />
                    <Field label="GPA"          value={edu.gpa          ?? ""} onChange={v => setDraft(p => { const e = [...p.education]; e[i] = { ...e[i], gpa: v };         return { ...p, education: e }; })} />
                    <Field label="Honors"       value={edu.honors       ?? ""} onChange={v => setDraft(p => { const e = [...p.education]; e[i] = { ...e[i], honors: v };      return { ...p, education: e }; })} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader title="Skills" open={!!open.skills} onToggle={() => toggle("skills")} />
          {open.skills && (
            <div className="space-y-3">
              {draft.skills.map((cat, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2">
                  <Field label="Category" value={cat.name}
                    onChange={v => setDraft(p => { const s = [...p.skills]; s[i] = { ...s[i], name: v }; return { ...p, skills: s }; })} />
                  <SkillsCommaInput
                    skills={cat.skills}
                    onSkillsChange={skills => setDraft(p => {
                      const s = [...p.skills];
                      s[i] = { ...s[i], skills };
                      return { ...p, skills: s };
                    })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {draft.certifications && draft.certifications.length > 0 && (
          <div>
            <SectionHeader title="Certifications" open={!!open.certs} onToggle={() => toggle("certs")} />
            {open.certs && (
              <div className="space-y-3">
                {draft.certifications.map((cert, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/40">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Name"   value={cert.name}         onChange={v => setDraft(p => { const c = [...(p.certifications ?? [])]; c[i] = { ...c[i], name: v };   return { ...p, certifications: c }; })} />
                      <Field label="Issuer" value={cert.issuer ?? ""} onChange={v => setDraft(p => { const c = [...(p.certifications ?? [])]; c[i] = { ...c[i], issuer: v }; return { ...p, certifications: c }; })} />
                      <Field label="Date"   value={cert.date   ?? ""} onChange={v => setDraft(p => { const c = [...(p.certifications ?? [])]; c[i] = { ...c[i], date: v };   return { ...p, certifications: c }; })} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
