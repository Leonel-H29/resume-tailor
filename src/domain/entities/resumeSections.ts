// Domain: resume section metadata for editor and validation rules

export const MANDATORY_SECTIONS = [
  'summary',
  'experience',
  'skills',
  'education',
  'languages',
] as const;

export type MandatorySectionKey = (typeof MANDATORY_SECTIONS)[number];

export const OPTIONAL_SECTIONS = [
  'certifications',
  'projects',
] as const;

export type OptionalSectionKey = (typeof OPTIONAL_SECTIONS)[number];

export const LANGUAGE_PROFICIENCY_LEVELS = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'Native',
] as const;

export type LanguageProficiencyLevel = (typeof LANGUAGE_PROFICIENCY_LEVELS)[number];

export const SECTION_DISPLAY_NAMES: Record<MandatorySectionKey | OptionalSectionKey, string> = {
  summary: 'Professional Summary',
  experience: 'Professional Experience',
  skills: 'Skills',
  education: 'Education',
  languages: 'Languages',
  certifications: 'Certifications',
  projects: 'Projects',
};

export function isMandatorySection(
  section: MandatorySectionKey | OptionalSectionKey
): section is MandatorySectionKey {
  return (MANDATORY_SECTIONS as readonly string[]).includes(section);
}

export function isOptionalSection(
  section: MandatorySectionKey | OptionalSectionKey
): section is OptionalSectionKey {
  return (OPTIONAL_SECTIONS as readonly string[]).includes(section);
}
