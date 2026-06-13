import type { WorkExperience } from '@/domain/entities/WorkExperience';
import type { Education } from '@/domain/entities/Education';
import type { SkillCategory } from '@/domain/entities/SkillCategory';
import type { Certification } from '@/domain/entities/Certification';
import type { Project } from '@/domain/entities/Project';
import type { Languages } from '@/domain/entities/Languages';

export function createEmptyWorkExperience(): WorkExperience {
  return {
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    skills: [],
    achievements: [''],
  };
}

export function createEmptyEducation(): Education {
  return {
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    graduationDate: '',
    gpa: '',
    honors: '',
  };
}

export function createEmptySkillCategory(): SkillCategory {
  return {
    name: '',
    skills: [],
  };
}

export function createEmptyCertification(): Certification {
  return {
    name: '',
    issuer: '',
    date: '',
  };
}

export function createEmptyProject(): Project {
  return {
    name: '',
    description: '',
    technologies: [],
    url: '',
  };
}

export function createEmptyLanguage(): Languages {
  return {
    language: '',
    level: 'B2',
  };
}
