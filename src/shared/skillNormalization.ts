/**
 * Deterministic skill normalization and hierarchy
 * Milestone 1 requirement (spec section 13)
 */

export interface SkillMapping {
  canonical: string;
  aliases: string[];
  parent?: string;
  category?: string;
}

/**
 * Skill normalization mappings
 * Format: alias → canonical name
 */
const SKILL_NORMALIZATIONS: Record<string, string> = {
  // JavaScript ecosystem
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'react.js': 'React',
  'reactjs': 'React',
  'react': 'React',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'express': 'Express',
  'expressjs': 'Express',
  'express.js': 'Express',
  'nextjs': 'Next.js',
  'next': 'Next.js',
  'next.js': 'Next.js',

  // Python ecosystem
  'python': 'Python',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'pytorch': 'PyTorch',
  'tensorflow': 'TensorFlow',
  'pandas': 'Pandas',
  'numpy': 'NumPy',

  // Java ecosystem
  'java': 'Java',
  'spring': 'Spring',
  'springboot': 'Spring Boot',
  'spring boot': 'Spring Boot',
  'hibernate': 'Hibernate',

  // Databases
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'sqlite': 'SQLite',

  // Cloud & DevOps
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Azure',
  'gcp': 'Google Cloud',
  'google cloud platform': 'Google Cloud',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'ci/cd': 'CI/CD',
  'terraform': 'Terraform',

  // Other languages
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'ruby': 'Ruby',
  'php': 'PHP',
  'swift': 'Swift',
  'kotlin': 'Kotlin',

  // Web technologies
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'sass': 'Sass',
  'scss': 'Sass',
  'rest': 'REST',
  'restful': 'REST',
  'rest api': 'REST',
  'graphql': 'GraphQL',
  'grpc': 'gRPC',

  // Mobile
  'react native': 'React Native',
  'reactnative': 'React Native',
  'ios': 'iOS',
  'android': 'Android',
  'flutter': 'Flutter',

  // Testing
  'jest': 'Jest',
  'mocha': 'Mocha',
  'pytest': 'Pytest',
  'junit': 'JUnit',
  'selenium': 'Selenium',

  // Soft skills (common variations)
  'communication': 'Communication',
  'leadership': 'Leadership',
  'teamwork': 'Teamwork',
  'problem solving': 'Problem Solving',
  'problem-solving': 'Problem Solving',
  'agile': 'Agile',
  'scrum': 'Scrum',
};

/**
 * Skill hierarchy: child → parent
 * E.g., React requires JavaScript, Spring Boot requires Java
 */
const SKILL_HIERARCHY: Record<string, string> = {
  'React': 'JavaScript',
  'Vue.js': 'JavaScript',
  'Angular': 'JavaScript',
  'Node.js': 'JavaScript',
  'Express': 'Node.js',
  'Next.js': 'React',
  'TypeScript': 'JavaScript',

  'Django': 'Python',
  'Flask': 'Python',
  'FastAPI': 'Python',
  'PyTorch': 'Python',
  'TensorFlow': 'Python',
  'Pandas': 'Python',
  'NumPy': 'Python',

  'Spring': 'Java',
  'Spring Boot': 'Spring',
  'Hibernate': 'Java',

  'MySQL': 'SQL',
  'PostgreSQL': 'SQL',
  'SQLite': 'SQL',

  'React Native': 'React',

  'Kubernetes': 'Docker',

  'Sass': 'CSS',
};

/**
 * Skill categories for organization
 */
const SKILL_CATEGORIES: Record<string, string> = {
  // Languages
  'JavaScript': 'language',
  'TypeScript': 'language',
  'Python': 'language',
  'Java': 'language',
  'C++': 'language',
  'C#': 'language',
  'Go': 'language',
  'Rust': 'language',
  'Ruby': 'language',
  'PHP': 'language',
  'Swift': 'language',
  'Kotlin': 'language',
  'SQL': 'language',

  // Frameworks
  'React': 'framework',
  'Vue.js': 'framework',
  'Angular': 'framework',
  'Django': 'framework',
  'Flask': 'framework',
  'FastAPI': 'framework',
  'Spring': 'framework',
  'Spring Boot': 'framework',
  'Express': 'framework',
  'Next.js': 'framework',
  'React Native': 'framework',
  'Flutter': 'framework',

  // Databases
  'PostgreSQL': 'database',
  'MySQL': 'database',
  'MongoDB': 'database',
  'Redis': 'database',
  'SQLite': 'database',

  // Cloud
  'AWS': 'cloud',
  'Azure': 'cloud',
  'Google Cloud': 'cloud',

  // Tools
  'Docker': 'tool',
  'Kubernetes': 'tool',
  'Git': 'tool',
  'GitHub': 'tool',
  'GitLab': 'tool',
  'Terraform': 'tool',

  // Web
  'HTML': 'web',
  'CSS': 'web',
  'Sass': 'web',
  'REST': 'web',
  'GraphQL': 'web',
  'gRPC': 'web',

  // Testing
  'Jest': 'testing',
  'Mocha': 'testing',
  'Pytest': 'testing',
  'JUnit': 'testing',
  'Selenium': 'testing',

  // Methodologies
  'Agile': 'methodology',
  'Scrum': 'methodology',
  'CI/CD': 'methodology',

  // Soft skills
  'Communication': 'soft-skill',
  'Leadership': 'soft-skill',
  'Teamwork': 'soft-skill',
  'Problem Solving': 'soft-skill',
};

/**
 * Normalize a skill name to its canonical form
 */
export function normalizeSkill(skill: string): string {
  const lowercased = skill.trim().toLowerCase();
  return SKILL_NORMALIZATIONS[lowercased] || skill.trim();
}

/**
 * Get the parent skill if one exists
 */
export function getParentSkill(skill: string): string | undefined {
  const normalized = normalizeSkill(skill);
  return SKILL_HIERARCHY[normalized];
}

/**
 * Get all ancestors of a skill (parent, grandparent, etc.)
 */
export function getSkillAncestors(skill: string): string[] {
  const ancestors: string[] = [];
  let current = normalizeSkill(skill);

  while (true) {
    const parent = SKILL_HIERARCHY[current];
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }

  return ancestors;
}

/**
 * Get skill category
 */
export function getSkillCategory(skill: string): string | undefined {
  const normalized = normalizeSkill(skill);
  return SKILL_CATEGORIES[normalized];
}

/**
 * Check if a candidate has a skill (directly or via hierarchy)
 * E.g., if candidate has React, they implicitly have JavaScript
 */
export function hasSkillOrDescendant(
  candidateSkills: string[],
  requiredSkill: string
): boolean {
  const normalizedRequired = normalizeSkill(requiredSkill);
  const normalizedCandidate = candidateSkills.map(normalizeSkill);

  // Direct match
  if (normalizedCandidate.includes(normalizedRequired)) {
    return true;
  }

  // Check if candidate has a child skill
  // E.g., required: JavaScript, candidate has: React
  for (const candidateSkill of normalizedCandidate) {
    const ancestors = getSkillAncestors(candidateSkill);
    if (ancestors.includes(normalizedRequired)) {
      return true;
    }
  }

  return false;
}

/**
 * Normalize and deduplicate a list of skills
 */
export function normalizeSkillList(skills: string[]): string[] {
  const normalized = skills.map(normalizeSkill);
  return Array.from(new Set(normalized));
}

/**
 * Get all skills with their metadata
 */
export function getSkillMetadata(skill: string): {
  normalized: string;
  parent?: string;
  category?: string;
  ancestors: string[];
} {
  const normalized = normalizeSkill(skill);
  return {
    normalized,
    parent: SKILL_HIERARCHY[normalized],
    category: SKILL_CATEGORIES[normalized],
    ancestors: getSkillAncestors(skill),
  };
}
