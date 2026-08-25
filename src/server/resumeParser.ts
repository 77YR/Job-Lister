/**
 * Deterministic resume parser (Milestone 1)
 * NO AI - rule-based extraction only
 */

import { randomUUID } from 'crypto';
import type {
  UserProfile,
  CandidateLevel,
  Education,
  Experience,
  Project,
  Certification,
  Skill,
} from '../shared/types.js';
import { normalizeSkill, getSkillCategory } from '../shared/skillNormalization.js';

/**
 * Parse resume text into structured profile
 */
export function parseResume(text: string, fileName: string): UserProfile {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  const profile: UserProfile = {
    id: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    resumeFileName: fileName,
    rawResumeText: text,
    candidateLevel: 'unknown',
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
  };

  // Extract sections
  const sections = extractSections(lines);

  // Parse contact info (usually at the top)
  parseContactInfo(sections.header || [], profile);

  // Parse education
  if (sections.education) {
    profile.education = parseEducation(sections.education);
    profile.candidateLevel = inferCandidateLevel(profile.education);
    profile.graduationDate = inferGraduationDate(profile.education);
  }

  // Parse experience
  if (sections.experience) {
    profile.experience = parseExperience(sections.experience);
  }

  // Parse skills
  if (sections.skills) {
    profile.skills = parseSkills(sections.skills);
  }

  // Parse projects
  if (sections.projects) {
    profile.projects = parseProjects(sections.projects);
  }

  // Parse certifications
  if (sections.certifications) {
    profile.certifications = parseCertifications(sections.certifications);
  }

  // Extract skills from experience if not explicitly listed
  if (profile.skills.length === 0 && profile.experience.length > 0) {
    profile.skills = extractSkillsFromExperience(profile.experience);
  }

  return profile;
}

/**
 * Section headers to look for (case-insensitive)
 */
const SECTION_KEYWORDS = {
  education: ['education', 'academic background', 'academic', 'university'],
  experience: ['experience', 'work experience', 'employment', 'work history', 'professional experience'],
  skills: ['skills', 'technical skills', 'technologies', 'expertise', 'competencies'],
  projects: ['projects', 'personal projects', 'side projects', 'portfolio'],
  certifications: ['certifications', 'certificates', 'credentials', 'licenses'],
};

interface Sections {
  header?: string[];
  education?: string[];
  experience?: string[];
  skills?: string[];
  projects?: string[];
  certifications?: string[];
}

/**
 * Extract sections from resume lines
 */
function extractSections(lines: string[]): Sections {
  const sections: Sections = {
    header: [],
  };

  let currentSection: keyof Sections = 'header';

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if this line is a section header
    let foundSection = false;
    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
      if (keywords.some(kw => lowerLine === kw || lowerLine.startsWith(kw))) {
        currentSection = section as keyof Sections;
        foundSection = true;
        sections[currentSection] = [];
        break;
      }
    }

    if (!foundSection && currentSection) {
      sections[currentSection]!.push(line);
    }
  }

  return sections;
}

/**
 * Parse contact information from header
 */
function parseContactInfo(lines: string[], profile: UserProfile): void {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  for (const line of lines.slice(0, 10)) { // Check first 10 lines
    // First non-contact line is likely the name
    if (!profile.fullName && !emailRegex.test(line) && !phoneRegex.test(line) && line.length < 50) {
      profile.fullName = line;
    }

    // Email
    const emailMatch = line.match(emailRegex);
    if (emailMatch) {
      profile.email = emailMatch[0];
    }

    // Phone
    const phoneMatch = line.match(phoneRegex);
    if (phoneMatch) {
      profile.phone = phoneMatch[0];
    }

    // Location (heuristic: city, state or city, country)
    if (line.includes(',') && line.split(',').length === 2 && line.length < 50) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.every(p => /^[A-Za-z\s]+$/.test(p))) {
        profile.location = line;
      }
    }
  }
}

/**
 * Parse education section
 */
function parseEducation(lines: string[]): Education[] {
  const education: Education[] = [];
  const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'bs', 'ba', 'ms', 'ma', 'mba', 'bsc', 'msc'];

  let current: Partial<Education> | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if this is a degree line
    const hasDegree = degreeKeywords.some(kw => lowerLine.includes(kw));

    if (hasDegree || (current === null && line.length > 0)) {
      // Save previous entry
      if (current && current.institution && current.degree) {
        education.push(current as Education);
      }

      // Start new entry
      current = {
        id: randomUUID(),
        institution: '',
        degree: '',
        graduated: false,
        achievements: [],
      };

      if (hasDegree) {
        current.degree = line;
      } else {
        current.institution = line;
      }
    } else if (current) {
      // Extract dates
      const dateMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
      if (dateMatch) {
        current.startDate = dateMatch[1];
        current.endDate = dateMatch[2].toLowerCase() === 'present' || dateMatch[2].toLowerCase() === 'current'
          ? undefined
          : dateMatch[2];
        current.graduated = dateMatch[2].toLowerCase() !== 'present' && dateMatch[2].toLowerCase() !== 'current';
      }

      // Extract GPA
      const gpaMatch = line.match(/gpa[:\s]+(\d+\.\d+)/i);
      if (gpaMatch) {
        current.gpa = parseFloat(gpaMatch[1]);
      }

      // Institution or degree (if not set yet)
      if (!current.institution) {
        current.institution = line;
      } else if (!current.degree) {
        current.degree = line;
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        current.achievements!.push(line.replace(/^[•\-*]\s*/, ''));
      }
    }
  }

  // Save last entry
  if (current && current.institution && current.degree) {
    education.push(current as Education);
  }

  return education;
}

/**
 * Parse experience section
 */
function parseExperience(lines: string[]): Experience[] {
  const experience: Experience[] = [];
  let current: Partial<Experience> | null = null;

  for (const line of lines) {
    // Date patterns suggest new experience entry
    const dateMatch = line.match(/(\d{4}|[a-z]+\s+\d{4})\s*[-–]\s*(\d{4}|present|current|[a-z]+\s+\d{4})/i);

    if (dateMatch && current === null) {
      // Start new entry
      current = {
        id: randomUUID(),
        company: '',
        title: '',
        isCurrent: false,
        achievements: [],
        skills: [],
      };
      current.startDate = dateMatch[1];
      const endStr = dateMatch[2].toLowerCase();
      current.isCurrent = endStr === 'present' || endStr === 'current';
      current.endDate = current.isCurrent ? undefined : dateMatch[2];
    } else if (dateMatch && current) {
      // Save previous and start new
      if (current.company && current.title) {
        experience.push(current as Experience);
      }
      current = {
        id: randomUUID(),
        company: '',
        title: '',
        isCurrent: false,
        achievements: [],
        skills: [],
      };
      current.startDate = dateMatch[1];
      const endStr = dateMatch[2].toLowerCase();
      current.isCurrent = endStr === 'present' || endStr === 'current';
      current.endDate = current.isCurrent ? undefined : dateMatch[2];
    } else if (current) {
      if (!current.title && line.length < 100) {
        current.title = line;
      } else if (!current.company && line.length < 100) {
        current.company = line;
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        current.achievements!.push(line.replace(/^[•\-*]\s*/, ''));
      } else if (line.toLowerCase().includes('location:')) {
        current.location = line.replace(/location:\s*/i, '');
      }
    } else if (!current && line.length < 100 && line.length > 0) {
      // First line might be a title without date
      current = {
        id: randomUUID(),
        company: '',
        title: line,
        isCurrent: false,
        achievements: [],
        skills: [],
      };
    }
  }

  // Save last entry
  if (current && current.company && current.title) {
    experience.push(current as Experience);
  }

  return experience;
}

/**
 * Parse skills section
 */
function parseSkills(lines: string[]): Skill[] {
  const skills: Skill[] = [];
  const skillSet = new Set<string>();

  for (const line of lines) {
    // Skills might be comma-separated, pipe-separated, or bullet-pointed
    const separators = /[,|•\-*]/;
    const rawSkills = line.split(separators).map(s => s.trim()).filter(s => s.length > 0);

    for (const rawSkill of rawSkills) {
      // Remove common prefixes like "Proficient in", "Experienced with"
      let cleanSkill = rawSkill
        .replace(/^(proficient in|experienced with|knowledge of|familiar with|skilled in):\s*/i, '')
        .trim();

      // Skip if too long (probably not a skill)
      if (cleanSkill.length > 50) continue;

      const normalized = normalizeSkill(cleanSkill);

      // Deduplicate
      if (!skillSet.has(normalized)) {
        skillSet.add(normalized);
        skills.push({
          id: randomUUID(),
          name: cleanSkill,
          normalizedName: normalized,
          category: getSkillCategory(normalized),
        });
      }
    }
  }

  return skills;
}

/**
 * Parse projects section
 */
function parseProjects(lines: string[]): Project[] {
  const projects: Project[] = [];
  let current: Partial<Project> | null = null;

  for (const line of lines) {
    // Check for URL
    const urlMatch = line.match(/https?:\/\/[^\s]+/);

    // New project likely starts with a short line (project name)
    if (line.length < 80 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && !urlMatch) {
      // Save previous
      if (current && current.name && current.description) {
        projects.push(current as Project);
      }

      // Start new
      current = {
        id: randomUUID(),
        name: line,
        description: '',
        technologies: [],
      };
    } else if (current) {
      if (urlMatch) {
        current.url = urlMatch[0];
      } else if (!current.description) {
        current.description = line.replace(/^[•\-*]\s*/, '');
      } else {
        // Additional description or technologies
        if (line.toLowerCase().includes('technologies:') || line.toLowerCase().includes('tech stack:')) {
          const techLine = line.replace(/technologies:|tech stack:/i, '').trim();
          current.technologies = techLine.split(/[,|]/).map(t => t.trim()).filter(t => t);
        } else {
          current.description += ' ' + line.replace(/^[•\-*]\s*/, '');
        }
      }
    }
  }

  // Save last entry
  if (current && current.name && current.description) {
    projects.push(current as Project);
  }

  return projects;
}

/**
 * Parse certifications section
 */
function parseCertifications(lines: string[]): Certification[] {
  const certifications: Certification[] = [];

  for (const line of lines) {
    if (line.length === 0) continue;

    const cert: Certification = {
      id: randomUUID(),
      name: line.split(',')[0].replace(/^[•\-*]\s*/, '').trim(),
      issuer: '',
    };

    // Try to extract issuer (often after comma or dash)
    const parts = line.split(/[,\-–]/);
    if (parts.length > 1) {
      cert.issuer = parts[1].trim();
    }

    // Extract date
    const dateMatch = line.match(/(\d{4})/);
    if (dateMatch) {
      cert.dateObtained = dateMatch[1];
    }

    // Extract URL
    const urlMatch = line.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      cert.url = urlMatch[0];
    }

    if (cert.name) {
      certifications.push(cert);
    }
  }

  return certifications;
}

/**
 * Extract skills mentioned in experience descriptions
 */
function extractSkillsFromExperience(experience: Experience[]): Skill[] {
  const skills: Skill[] = [];
  const skillSet = new Set<string>();

  // Common technical terms to look for
  const techTerms = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node', 'sql', 'aws',
    'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'mongodb', 'postgresql',
    'express', 'django', 'flask', 'spring', 'angular', 'vue', 'html', 'css',
  ];

  for (const exp of experience) {
    const text = [exp.description, ...exp.achievements].join(' ').toLowerCase();

    for (const term of techTerms) {
      if (text.includes(term)) {
        const normalized = normalizeSkill(term);
        if (!skillSet.has(normalized)) {
          skillSet.add(normalized);
          skills.push({
            id: randomUUID(),
            name: term,
            normalizedName: normalized,
            category: getSkillCategory(normalized),
          });
        }
      }
    }
  }

  return skills;
}

/**
 * Infer candidate level from education
 */
function inferCandidateLevel(education: Education[]): CandidateLevel {
  if (education.length === 0) return 'unknown';

  const mostRecent = education[0];
  const lowerDegree = mostRecent.degree.toLowerCase();

  // Check graduation status
  const hasGraduated = mostRecent.graduated;
  const endYear = mostRecent.endDate ? parseInt(mostRecent.endDate) : null;
  const currentYear = new Date().getFullYear();

  // Student if currently enrolled
  if (!hasGraduated && endYear && endYear >= currentYear) {
    return 'student';
  }

  // Recent graduate if graduated within last 2 years
  if (hasGraduated && endYear && currentYear - endYear <= 2) {
    return 'recent-graduate';
  }

  // Otherwise entry-level for bachelor's, mid-level for master's
  if (lowerDegree.includes('bachelor') || lowerDegree.includes('bs') || lowerDegree.includes('ba')) {
    return 'entry-level';
  }

  if (lowerDegree.includes('master') || lowerDegree.includes('ms') || lowerDegree.includes('ma') || lowerDegree.includes('mba')) {
    return 'mid-level';
  }

  if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) {
    return 'senior';
  }

  return 'entry-level';
}

/**
 * Infer graduation date from education
 */
function inferGraduationDate(education: Education[]): string | undefined {
  for (const edu of education) {
    if (edu.graduated && edu.endDate) {
      return edu.endDate;
    }
  }
  return undefined;
}
