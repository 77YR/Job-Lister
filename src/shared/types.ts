/**
 * Domain types for V1
 * These are stubs - will be populated in subsequent milestones
 */

export interface UserProfile {
  id: string;
  skills: string[];
  education: string[];
  experience: string[];
  projects: string[];
  certifications: string[];
  candidateLevel: string;
  graduationInfo?: string;
}

export interface SearchPreferences {
  employmentType: 'internship' | 'full-time' | 'part-time';
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  remotePreference: 'remote' | 'hybrid' | 'on-site' | 'any';
  maxPostingAgeDays: number;
  keywords?: string[];
}

export interface JobPosting {
  id: string;
  provider: string;
  originalUrl: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  remote: boolean;
  employmentType: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  postedAt: Date;
  seniority?: string;
  skills: string[];
  rawData?: Record<string, unknown>;
}

export interface MatchResult {
  jobId: string;
  matchScore: number;
  opportunityScore: number;
  finalScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceFit: number;
  educationFit: number;
  requirementConflicts: string[];
  rankingFactors: Record<string, number>;
}