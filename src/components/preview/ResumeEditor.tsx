"use client";

import { useState } from "react";
import { Save, Loader2, Trash2 } from "lucide-react";
import type { OptimizedResume } from "@/domain/entities/OptimizedResume";
import type { PersonalInfo } from "@/domain/entities/PersonalInfo";
import type { WorkExperience } from "@/domain/entities/WorkExperience";
import type { Education } from "@/domain/entities/Education";
import type { SkillCategory } from "@/domain/entities/SkillCategory";
import type { Certification } from "@/domain/entities/Certification";
import type { Project } from "@/domain/entities/Project";
import type { Languages } from "@/domain/entities/Languages";
import {
  OPTIONAL_SECTIONS,
  SECTION_DISPLAY_NAMES,
  type OptionalSectionKey,
} from "@/domain/entities/resumeSections";
import {
  createEmptyCertification,
  createEmptyEducation,
  createEmptyLanguage,
  createEmptyProject,
  createEmptySkillCategory,
  createEmptyWorkExperience,
} from "@/components/preview/editor/editorDefaults";
import {
  addArrayItem,
  moveArrayItem,
  removeArrayAt,
  updateArrayAt,
} from "@/components/preview/editor/arrayHelpers";
import {
  AddItemButton,
  EditorField,
  ItemToolbar,
  SectionHeader,
} from "@/components/preview/editor/EditorPrimitives";
import { ProficiencySelect } from "@/components/preview/editor/ProficiencySelect";
import { SkillsCommaInput } from "@/components/preview/editor/SkillsCommaInput";
import { apiPostJson } from "@/lib/apiClient";

interface ResumeEditorProps {
  resume: OptimizedResume;
  onSave: (updated: OptimizedResume, newPdfBase64: string) => void;
}

function normalizeDraft(resume: OptimizedResume): OptimizedResume {
  const cloned = structuredClone(resume);
  return {
    ...cloned,
    languages: cloned.languages ?? [],
  };
}

function isOptionalSectionActive(
  draft: OptimizedResume,
  section: OptionalSectionKey
): boolean {
  if (section === "certifications") {
    return draft.certifications !== undefined;
  }
  return draft.projects !== undefined;
}

export function ResumeEditor({ resume, onSave }: ResumeEditorProps) {
  const [draft, setDraft] = useState<OptimizedResume>(() => normalizeDraft(resume));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    skills: false,
    languages: false,
    certs: false,
    projects: false,
  });

  const toggle = (key: string) => setOpen((previous) => ({ ...previous, [key]: !previous[key] }));

  const setPersonal = (key: keyof PersonalInfo) => (value: string) =>
    setDraft((previous) => ({
      ...previous,
      personalInfo: { ...previous.personalInfo, [key]: value },
    }));

  const updateExperience = (index: number, updater: (job: WorkExperience) => WorkExperience) =>
    setDraft((previous) => ({
      ...previous,
      experience: updateArrayAt(previous.experience, index, updater),
    }));

  const setExperienceField =
    (index: number, key: keyof WorkExperience) => (value: string | string[]) =>
      updateExperience(index, (job) => ({ ...job, [key]: value }));

  const setExperienceAchievement = (expIndex: number, achIndex: number, value: string) =>
    updateExperience(expIndex, (job) => ({
      ...job,
      achievements: updateArrayAt(job.achievements, achIndex, () => value),
    }));

  const addExperience = () =>
    setDraft((previous) => ({
      ...previous,
      experience: addArrayItem(previous.experience, createEmptyWorkExperience()),
    }));

  const removeExperience = (index: number) =>
    setDraft((previous) => ({
      ...previous,
      experience: removeArrayAt(previous.experience, index),
    }));

  const moveExperience = (from: number, to: number) =>
    setDraft((previous) => ({
      ...previous,
      experience: moveArrayItem(previous.experience, from, to),
    }));

  const addAchievement = (expIndex: number) =>
    updateExperience(expIndex, (job) => ({
      ...job,
      achievements: addArrayItem(job.achievements, ""),
    }));

  const removeAchievement = (expIndex: number, achIndex: number) =>
    updateExperience(expIndex, (job) => ({
      ...job,
      achievements: removeArrayAt(job.achievements, achIndex),
    }));

  const updateEducation = (index: number, updater: (entry: Education) => Education) =>
    setDraft((previous) => ({
      ...previous,
      education: updateArrayAt(previous.education, index, updater),
    }));

  const setEducationField = (index: number, key: keyof Education) => (value: string) =>
    updateEducation(index, (entry) => ({ ...entry, [key]: value }));

  const addEducation = () =>
    setDraft((previous) => ({
      ...previous,
      education: addArrayItem(previous.education, createEmptyEducation()),
    }));

  const removeEducation = (index: number) =>
    setDraft((previous) => ({
      ...previous,
      education: removeArrayAt(previous.education, index),
    }));

  const moveEducation = (from: number, to: number) =>
    setDraft((previous) => ({
      ...previous,
      education: moveArrayItem(previous.education, from, to),
    }));

  const updateSkillCategory = (index: number, updater: (category: SkillCategory) => SkillCategory) =>
    setDraft((previous) => ({
      ...previous,
      skills: updateArrayAt(previous.skills, index, updater),
    }));

  const addSkillCategory = () =>
    setDraft((previous) => ({
      ...previous,
      skills: addArrayItem(previous.skills, createEmptySkillCategory()),
    }));

  const removeSkillCategory = (index: number) =>
    setDraft((previous) => ({
      ...previous,
      skills: removeArrayAt(previous.skills, index),
    }));

  const moveSkillCategory = (from: number, to: number) =>
    setDraft((previous) => ({
      ...previous,
      skills: moveArrayItem(previous.skills, from, to),
    }));

  const updateLanguage = (index: number, updater: (entry: Languages) => Languages) =>
    setDraft((previous) => ({
      ...previous,
      languages: updateArrayAt(previous.languages ?? [], index, updater),
    }));

  const addLanguage = () =>
    setDraft((previous) => ({
      ...previous,
      languages: addArrayItem(previous.languages ?? [], createEmptyLanguage()),
    }));

  const removeLanguage = (index: number) =>
    setDraft((previous) => ({
      ...previous,
      languages: removeArrayAt(previous.languages ?? [], index),
    }));

  const moveLanguage = (from: number, to: number) =>
    setDraft((previous) => ({
      ...previous,
      languages: moveArrayItem(previous.languages ?? [], from, to),
    }));

  const updateCertification = (index: number, updater: (entry: Certification) => Certification) =>
    setDraft((previous) => ({
      ...previous,
      certifications: updateArrayAt(previous.certifications ?? [], index, updater),
    }));

  const addCertification = () =>
    setDraft((previous) => ({
      ...previous,
      certifications: addArrayItem(previous.certifications ?? [], createEmptyCertification()),
    }));

  const removeCertification = (index: number) =>
    setDraft((previous) => ({
      ...previous,
      certifications: removeArrayAt(previous.certifications ?? [], index),
    }));

  const moveCertification = (from: number, to: number) =>
    setDraft((previous) => ({
      ...previous,
      certifications: moveArrayItem(previous.certifications ?? [], from, to),
    }));

  const updateProject = (index: number, updater: (entry: Project) => Project) =>
    setDraft((previous) => ({
      ...previous,
      projects: updateArrayAt(previous.projects ?? [], index, updater),
    }));

  const addProject = () =>
    setDraft((previous) => ({
      ...previous,
      projects: addArrayItem(previous.projects ?? [], createEmptyProject()),
    }));

  const removeProject = (index: number) =>
    setDraft((previous) => ({
      ...previous,
      projects: removeArrayAt(previous.projects ?? [], index),
    }));

  const moveProject = (from: number, to: number) =>
    setDraft((previous) => ({
      ...previous,
      projects: moveArrayItem(previous.projects ?? [], from, to),
    }));

  const addOptionalSection = (section: OptionalSectionKey) => {
    setOpen((previous) => ({
      ...previous,
      [section === "certifications" ? "certs" : "projects"]: true,
    }));

    if (section === "certifications") {
      setDraft((previous) => ({
        ...previous,
        certifications: previous.certifications ?? [createEmptyCertification()],
      }));
      return;
    }

    setDraft((previous) => ({
      ...previous,
      projects: previous.projects ?? [createEmptyProject()],
    }));
  };

  const removeOptionalSection = (section: OptionalSectionKey) => {
    const accordionKey = section === "certifications" ? "certs" : "projects";
    setOpen((previous) => ({ ...previous, [accordionKey]: false }));

    if (section === "certifications") {
      setDraft((previous) => ({ ...previous, certifications: undefined }));
      return;
    }

    setDraft((previous) => ({ ...previous, projects: undefined }));
  };

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

  const inactiveOptionalSections = OPTIONAL_SECTIONS.filter(
    (section) => !isOptionalSectionActive(draft, section)
  );

  const personalInfo = draft.personalInfo;
  const languages = draft.languages ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Edit any field, then save to regenerate the PDF.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-all glow-accent"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={14} /> Apply & Regenerate
            </>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="glass-card p-5 overflow-y-auto max-h-[65vh] space-y-5">
        <div>
          <SectionHeader
            title="Personal Info"
            open={!!open.personal}
            onToggle={() => toggle("personal")}
          />
          {open.personal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EditorField
                label="Full Name"
                value={personalInfo.name ?? ""}
                onChange={setPersonal("name")}
              />
              <EditorField
                label="Email"
                value={personalInfo.email ?? ""}
                onChange={setPersonal("email")}
              />
              <EditorField
                label="Phone"
                value={personalInfo.phone ?? ""}
                onChange={setPersonal("phone")}
              />
              <EditorField
                label="Location"
                value={personalInfo.location ?? ""}
                onChange={setPersonal("location")}
              />
              <EditorField
                label="LinkedIn"
                value={personalInfo.linkedin ?? ""}
                onChange={setPersonal("linkedin")}
              />
              <EditorField
                label="GitHub"
                value={personalInfo.github ?? ""}
                onChange={setPersonal("github")}
              />
              <EditorField
                label="Website"
                value={personalInfo.website ?? ""}
                onChange={setPersonal("website")}
              />
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            title={SECTION_DISPLAY_NAMES.summary}
            open={!!open.summary}
            onToggle={() => toggle("summary")}
          />
          {open.summary && (
            <EditorField
              label="Summary"
              value={draft.summary}
              multiline
              rows={4}
              onChange={(value) => setDraft((previous) => ({ ...previous, summary: value }))}
            />
          )}
        </div>

        <div>
          <SectionHeader
            title={SECTION_DISPLAY_NAMES.experience}
            open={!!open.experience}
            onToggle={() => toggle("experience")}
          />
          {open.experience && (
            <div className="space-y-5">
              {draft.experience.map((job, index) => (
                <div
                  key={`experience-${index}`}
                  className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Position {index + 1}
                    </p>
                    <ItemToolbar
                      onRemove={() => removeExperience(index)}
                      onMoveUp={() => moveExperience(index, index - 1)}
                      onMoveDown={() => moveExperience(index, index + 1)}
                      canRemove={draft.experience.length > 1}
                      canMoveUp={index > 0}
                      canMoveDown={index < draft.experience.length - 1}
                      removeLabel="Remove job"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditorField
                      label="Job Title"
                      value={job.title}
                      onChange={setExperienceField(index, "title")}
                    />
                    <EditorField
                      label="Company"
                      value={job.company}
                      onChange={setExperienceField(index, "company")}
                    />
                    <EditorField
                      label="Location"
                      value={job.location ?? ""}
                      onChange={setExperienceField(index, "location")}
                    />
                    <EditorField
                      label="Start Date"
                      value={job.startDate}
                      onChange={setExperienceField(index, "startDate")}
                    />
                    <EditorField
                      label="End Date"
                      value={job.endDate}
                      onChange={setExperienceField(index, "endDate")}
                    />
                  </div>
                  <SkillsCommaInput
                    skills={job.skills}
                    onSkillsChange={(skills) => setExperienceField(index, "skills")(skills)}
                  />
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">
                      Achievements
                    </label>
                    <div className="space-y-2">
                      {job.achievements.map((achievement, achIndex) => (
                        <div key={`achievement-${index}-${achIndex}`} className="flex gap-2 items-start">
                          <span className="text-accent mt-2 text-xs flex-shrink-0">•</span>
                          <textarea
                            value={achievement}
                            onChange={(event) =>
                              setExperienceAchievement(index, achIndex, event.target.value)
                            }
                            rows={2}
                            className="flex-1 bg-muted/40 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 px-3 py-2 resize-y min-h-[2.5rem] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeAchievement(index, achIndex)}
                            className="mt-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <AddItemButton
                        label="Add achievement"
                        onClick={() => addAchievement(index)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <AddItemButton label="Add job" onClick={addExperience} />
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            title={SECTION_DISPLAY_NAMES.education}
            open={!!open.education}
            onToggle={() => toggle("education")}
          />
          {open.education && (
            <div className="space-y-4">
              {draft.education.map((education, index) => (
                <div
                  key={`education-${index}`}
                  className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Education {index + 1}
                    </p>
                    <ItemToolbar
                      onRemove={() => removeEducation(index)}
                      onMoveUp={() => moveEducation(index, index - 1)}
                      onMoveDown={() => moveEducation(index, index + 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < draft.education.length - 1}
                      removeLabel="Remove education"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditorField
                      label="Institution"
                      value={education.institution}
                      onChange={setEducationField(index, "institution")}
                    />
                    <EditorField
                      label="Degree"
                      value={education.degree}
                      onChange={setEducationField(index, "degree")}
                    />
                    <EditorField
                      label="Field"
                      value={education.field ?? ""}
                      onChange={setEducationField(index, "field")}
                    />
                    <EditorField
                      label="Location"
                      value={education.location ?? ""}
                      onChange={setEducationField(index, "location")}
                    />
                    <EditorField
                      label="Start Date"
                      value={education.startDate}
                      onChange={setEducationField(index, "startDate")}
                    />
                    <EditorField
                      label="Grad. Date"
                      value={education.graduationDate}
                      onChange={setEducationField(index, "graduationDate")}
                    />
                    <EditorField
                      label="GPA"
                      value={education.gpa ?? ""}
                      onChange={setEducationField(index, "gpa")}
                    />
                    <EditorField
                      label="Honors"
                      value={education.honors ?? ""}
                      onChange={setEducationField(index, "honors")}
                    />
                  </div>
                </div>
              ))}
              <AddItemButton label="Add education" onClick={addEducation} />
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            title={SECTION_DISPLAY_NAMES.skills}
            open={!!open.skills}
            onToggle={() => toggle("skills")}
          />
          {open.skills && (
            <div className="space-y-3">
              {draft.skills.map((category, index) => (
                <div
                  key={`skills-${index}`}
                  className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Category {index + 1}
                    </p>
                    <ItemToolbar
                      onRemove={() => removeSkillCategory(index)}
                      onMoveUp={() => moveSkillCategory(index, index - 1)}
                      onMoveDown={() => moveSkillCategory(index, index + 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < draft.skills.length - 1}
                      removeLabel="Remove category"
                    />
                  </div>
                  <EditorField
                    label="Category"
                    value={category.name}
                    onChange={(value) =>
                      updateSkillCategory(index, (entry) => ({ ...entry, name: value }))
                    }
                  />
                  <SkillsCommaInput
                    skills={category.skills}
                    onSkillsChange={(skills) =>
                      updateSkillCategory(index, (entry) => ({ ...entry, skills }))
                    }
                  />
                </div>
              ))}
              <AddItemButton label="Add skill category" onClick={addSkillCategory} />
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            title={SECTION_DISPLAY_NAMES.languages}
            open={!!open.languages}
            onToggle={() => toggle("languages")}
          />
          {open.languages && (
            <div className="space-y-3">
              {languages.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No languages yet. Add one below.
                </p>
              )}
              {languages.map((language, index) => (
                <div
                  key={`language-${index}`}
                  className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Language {index + 1}
                    </p>
                    <ItemToolbar
                      onRemove={() => removeLanguage(index)}
                      onMoveUp={() => moveLanguage(index, index - 1)}
                      onMoveDown={() => moveLanguage(index, index + 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < languages.length - 1}
                      removeLabel="Remove language"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <EditorField
                      label="Language"
                      value={language.language}
                      onChange={(value) =>
                        updateLanguage(index, (entry) => ({ ...entry, language: value }))
                      }
                    />
                    <ProficiencySelect
                      label="Proficiency Level"
                      value={language.level}
                      onChange={(value) =>
                        updateLanguage(index, (entry) => ({ ...entry, level: value }))
                      }
                    />
                  </div>
                </div>
              ))}
              <AddItemButton label="Add language" onClick={addLanguage} />
            </div>
          )}
        </div>

        {isOptionalSectionActive(draft, "certifications") && (
          <div>
            <SectionHeader
              title={SECTION_DISPLAY_NAMES.certifications}
              open={!!open.certs}
              onToggle={() => toggle("certs")}
              canRemoveSection
              onRemoveSection={() => removeOptionalSection("certifications")}
            />
            {open.certs && (
              <div className="space-y-3">
                {(draft.certifications ?? []).map((certification, index) => (
                  <div
                    key={`certification-${index}`}
                    className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Certification {index + 1}
                      </p>
                      <ItemToolbar
                        onRemove={() => removeCertification(index)}
                        onMoveUp={() => moveCertification(index, index - 1)}
                        onMoveDown={() => moveCertification(index, index + 1)}
                        canMoveUp={index > 0}
                        canMoveDown={index < (draft.certifications ?? []).length - 1}
                        removeLabel="Remove certification"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <EditorField
                        label="Name"
                        value={certification.name}
                        onChange={(value) =>
                          updateCertification(index, (entry) => ({ ...entry, name: value }))
                        }
                      />
                      <EditorField
                        label="Issuer"
                        value={certification.issuer ?? ""}
                        onChange={(value) =>
                          updateCertification(index, (entry) => ({ ...entry, issuer: value }))
                        }
                      />
                      <EditorField
                        label="Date"
                        value={certification.date ?? ""}
                        onChange={(value) =>
                          updateCertification(index, (entry) => ({ ...entry, date: value }))
                        }
                      />
                    </div>
                  </div>
                ))}
                <AddItemButton label="Add certification" onClick={addCertification} />
              </div>
            )}
          </div>
        )}

        {isOptionalSectionActive(draft, "projects") && (
          <div>
            <SectionHeader
              title={SECTION_DISPLAY_NAMES.projects}
              open={!!open.projects}
              onToggle={() => toggle("projects")}
              canRemoveSection
              onRemoveSection={() => removeOptionalSection("projects")}
            />
            {open.projects && (
              <div className="space-y-3">
                {(draft.projects ?? []).map((project, index) => (
                  <div
                    key={`project-${index}`}
                    className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Project {index + 1}
                      </p>
                      <ItemToolbar
                        onRemove={() => removeProject(index)}
                        onMoveUp={() => moveProject(index, index - 1)}
                        onMoveDown={() => moveProject(index, index + 1)}
                        canMoveUp={index > 0}
                        canMoveDown={index < (draft.projects ?? []).length - 1}
                        removeLabel="Remove project"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <EditorField
                        label="Name"
                        value={project.name}
                        onChange={(value) =>
                          updateProject(index, (entry) => ({ ...entry, name: value }))
                        }
                      />
                      <EditorField
                        label="URL"
                        value={project.url ?? ""}
                        onChange={(value) =>
                          updateProject(index, (entry) => ({ ...entry, url: value }))
                        }
                      />
                    </div>
                    <EditorField
                      label="Description"
                      value={project.description}
                      multiline
                      rows={3}
                      onChange={(value) =>
                        updateProject(index, (entry) => ({ ...entry, description: value }))
                      }
                    />
                    <SkillsCommaInput
                      skills={project.technologies ?? []}
                      onSkillsChange={(technologies) =>
                        updateProject(index, (entry) => ({ ...entry, technologies }))
                      }
                    />
                  </div>
                ))}
                <AddItemButton label="Add project" onClick={addProject} />
              </div>
            )}
          </div>
        )}

        {inactiveOptionalSections.length > 0 && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-2">Add optional section</p>
            <div className="flex flex-wrap gap-2">
              {inactiveOptionalSections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => addOptionalSection(section)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/40 border border-border/50 text-foreground hover:border-accent/50 hover:text-accent transition-colors"
                >
                  + {SECTION_DISPLAY_NAMES[section]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
