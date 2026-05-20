// Domain Entity: OptimizedResume
// The AI-generated, job-tailored resume output

import { PersonalInfo } from '@/domain/entities/PersonalInfo';
import { WorkExperience } from '@/domain/entities/WorkExperience';
import { Education } from '@/domain/entities/Education';
import { SkillCategory } from '@/domain/entities/SkillCategory';
import { Certification } from '@/domain/entities/Certification';
import { Project } from '@/domain/entities/Project';
import { Languages } from '@/domain/entities/Languages';
import { isJsonObject, type JsonValue } from '@/domain/types/JsonValue';

export interface OptimizedResume {
  // Core sections
  personalInfo: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];

  // Optional sections
  languages?: Languages[];
  certifications?: Certification[];
  projects?: Project[];

  // Metadata for ATS scoring and tracking
  keywords: string[]; // Extracted from JD and incorporated
  matchScore: number; // 0-100 ATS compatibility score
  language: string; // ISO language code (e.g. "en", "es")
  generatedAt: Date;

  // For diff/comparison purposes
  changes?: {
    section: string;
    description: string;
  }[];
}

export function validateOptimizedResume(data: JsonValue): OptimizedResume {
  if (!isJsonObject(data)) {
    throw new Error('Generated resume payload is not a valid object');
  }
  const resume = JSON.parse(JSON.stringify(data)) as OptimizedResume;
  if (!resume.personalInfo?.name) {
    throw new Error('Generated resume missing candidate name');
  }
  if (!resume.summary || resume.summary.length < 10) {
    throw new Error('Generated resume missing professional summary');
  }
  if (!resume.experience || resume.experience.length === 0) {
    throw new Error('Generated resume missing work experience');
  }
  return {
    ...resume,
    generatedAt: new Date(),
    matchScore: resume.matchScore ?? 0,
    keywords: resume.keywords ?? [],
    language: resume.language ?? 'en',
  };
}
