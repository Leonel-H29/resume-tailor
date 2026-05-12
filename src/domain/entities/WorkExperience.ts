export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string; // "Present" or a date string
  skills: string[];
  achievements: string[]; // Bullet points
}
