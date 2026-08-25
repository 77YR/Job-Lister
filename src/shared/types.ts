/**
 * Domain types for V1
 */

// ============================================================================
// User Profile (Milestone 1)
// ============================================================================

export interface UserProfile {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  resumeFileName?: string;
  rawResumeText?: string;

  // Extracted information
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;

  candidateLevel: CandidateLevel;
  graduationDate?: string; // ISO date string

  skills: Skill[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
}

export type CandidateLevel =
  | 'student'
  | 'recent-graduate'
  | 'entry-level'
  | 'mid-level'
  | 'senior'
  | 'lead'
  | 'unknown';

export interface Skill {
  id: string;
  name: string;
  normalizedName: string;
  category?: string; // e.g., 'language', 'framework', 'tool', 'soft-skill'
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: string; // ISO date or partial like "2020"
  endDate?: string;
  graduated: boolean;
  gpa?: number;
  achievements?: string[];
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string; // null or "Present" indicates current
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  skills: string[]; // Skill names used in this role
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained?: string;
  expirationDate?: string;
  credentialId?: string;
  url?: string;
}

// ============================================================================
// Search Preferences (Milestone 2)
// ============================================================================

export interface SearchPreferences {
  employmentType: 'internship' | 'full-time' | 'part-time';
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  remotePreference: 'remote' | 'hybrid' | 'on-site' | 'any';
  maxPostingAgeDays: number;
  keywords?: string[];
}

// ============================================================================
// Job Posting (Milestone 2)
// ============================================================================

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

// ============================================================================
// Match Result (Milestone 3-4)
// ============================================================================

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

// ============================================================================
// API Types
// ============================================================================

export interface ParseResumeRequest {
  fileName: string;
  text: string;
}

export interface ParseResumeResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
  warnings?: string[];
}

export interface SaveProfileRequest {
  profile: UserProfile;
}

export interface SaveProfileResponse {
  success: boolean;
  profileId?: string;
  error?: string;
}

export interface GetProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}
