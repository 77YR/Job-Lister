/**
 * Profile service - database operations for user profiles (Milestone 1)
 */

import type { Database as SqlJsDatabase } from 'sql.js';
import type {
  UserProfile,
  Education,
  Experience,
  Project,
  Certification,
  Skill,
} from '../shared/types.js';
import { transactionAndSave } from '../db/index.js';

/**
 * Save a complete user profile to the database
 */
export function saveProfile(db: SqlJsDatabase, profile: UserProfile): void {
  const now = Date.now();

  // Use transaction
  transactionAndSave(db, () => {
    // Delete existing profile data if updating
    db.run('DELETE FROM profiles WHERE id = ?', [profile.id]);

    // Insert profile
    db.run(`
      INSERT INTO profiles (
        id, created_at, updated_at, resume_file_name, raw_resume_text,
        full_name, email, phone, location, candidate_level, graduation_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      profile.id,
      profile.createdAt.getTime(),
      now,
      profile.resumeFileName,
      profile.rawResumeText,
      profile.fullName,
      profile.email,
      profile.phone,
      profile.location,
      profile.candidateLevel,
      profile.graduationDate
    ]);

    // Insert skills
    for (const skill of profile.skills) {
      db.run(`
        INSERT INTO skills (id, profile_id, name, normalized_name, category, proficiency, years_of_experience)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        skill.id,
        profile.id,
        skill.name,
        skill.normalizedName,
        skill.category,
        skill.proficiency,
        skill.yearsOfExperience
      ]);
    }

    // Insert education
    for (const edu of profile.education) {
      db.run(`
        INSERT INTO education (id, profile_id, institution, degree, field, start_date, end_date, graduated, gpa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        edu.id,
        profile.id,
        edu.institution,
        edu.degree,
        edu.field,
        edu.startDate,
        edu.endDate,
        edu.graduated ? 1 : 0,
        edu.gpa
      ]);

      for (const achievement of edu.achievements || []) {
        db.run('INSERT INTO education_achievements (education_id, achievement) VALUES (?, ?)',
          [edu.id, achievement]);
      }
    }

    // Insert experience
    for (const exp of profile.experience) {
      db.run(`
        INSERT INTO experience (id, profile_id, company, title, location, start_date, end_date, is_current, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        exp.id,
        profile.id,
        exp.company,
        exp.title,
        exp.location,
        exp.startDate,
        exp.endDate,
        exp.isCurrent ? 1 : 0,
        exp.description
      ]);

      for (const achievement of exp.achievements) {
        db.run('INSERT INTO experience_achievements (experience_id, achievement) VALUES (?, ?)',
          [exp.id, achievement]);
      }

      for (const skill of exp.skills) {
        db.run('INSERT INTO experience_skills (experience_id, skill) VALUES (?, ?)',
          [exp.id, skill]);
      }
    }

    // Insert projects
    for (const project of profile.projects) {
      db.run(`
        INSERT INTO projects (id, profile_id, name, description, url, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        project.id,
        profile.id,
        project.name,
        project.description,
        project.url,
        project.startDate,
        project.endDate
      ]);

      for (const tech of project.technologies) {
        db.run('INSERT INTO project_technologies (project_id, technology) VALUES (?, ?)',
          [project.id, tech]);
      }
    }

    // Insert certifications
    for (const cert of profile.certifications) {
      db.run(`
        INSERT INTO certifications (id, profile_id, name, issuer, date_obtained, expiration_date, credential_id, url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cert.id,
        profile.id,
        cert.name,
        cert.issuer,
        cert.dateObtained,
        cert.expirationDate,
        cert.credentialId,
        cert.url
      ]);
    }
  });
}

/**
 * Get the most recent profile (or by ID if specified)
 */
export function getProfile(db: SqlJsDatabase, profileId?: string): UserProfile | null {
  // Get profile
  let result;
  if (profileId) {
    result = db.exec('SELECT * FROM profiles WHERE id = ?', [profileId]);
  } else {
    result = db.exec('SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 1');
  }

  if (!result.length || !result[0].values.length) return null;

  const columns = result[0].columns;
  const row = result[0].values[0];
  const profileRow: any = {};
  columns.forEach((col, idx) => {
    profileRow[col] = row[idx];
  });

  const profile: UserProfile = {
    id: profileRow.id,
    createdAt: new Date(profileRow.created_at),
    updatedAt: new Date(profileRow.updated_at),
    resumeFileName: profileRow.resume_file_name,
    rawResumeText: profileRow.raw_resume_text,
    fullName: profileRow.full_name,
    email: profileRow.email,
    phone: profileRow.phone,
    location: profileRow.location,
    candidateLevel: profileRow.candidate_level,
    graduationDate: profileRow.graduation_date,
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
  };

  // Get skills
  const skillsResult = db.exec('SELECT * FROM skills WHERE profile_id = ?', [profile.id]);
  if (skillsResult.length && skillsResult[0].values.length) {
    profile.skills = skillsResult[0].values.map((row): Skill => {
      const skillRow: any = {};
      skillsResult[0].columns.forEach((col, idx) => {
        skillRow[col] = row[idx];
      });
      return {
        id: skillRow.id,
        name: skillRow.name,
        normalizedName: skillRow.normalized_name,
        category: skillRow.category,
        proficiency: skillRow.proficiency,
        yearsOfExperience: skillRow.years_of_experience,
      };
    });
  }

  // Get education
  const educationResult = db.exec('SELECT * FROM education WHERE profile_id = ?', [profile.id]);
  if (educationResult.length && educationResult[0].values.length) {
    profile.education = educationResult[0].values.map((row): Education => {
      const eduRow: any = {};
      educationResult[0].columns.forEach((col, idx) => {
        eduRow[col] = row[idx];
      });

      const achievementsResult = db.exec('SELECT achievement FROM education_achievements WHERE education_id = ?', [eduRow.id]);
      const achievements = achievementsResult.length && achievementsResult[0].values.length
        ? achievementsResult[0].values.map(r => r[0] as string)
        : [];

      return {
        id: eduRow.id,
        institution: eduRow.institution,
        degree: eduRow.degree,
        field: eduRow.field,
        startDate: eduRow.start_date,
        endDate: eduRow.end_date,
        graduated: eduRow.graduated === 1,
        gpa: eduRow.gpa,
        achievements,
      };
    });
  }

  // Get experience
  const experienceResult = db.exec('SELECT * FROM experience WHERE profile_id = ?', [profile.id]);
  if (experienceResult.length && experienceResult[0].values.length) {
    profile.experience = experienceResult[0].values.map((row): Experience => {
      const expRow: any = {};
      experienceResult[0].columns.forEach((col, idx) => {
        expRow[col] = row[idx];
      });

      const achievementsResult = db.exec('SELECT achievement FROM experience_achievements WHERE experience_id = ?', [expRow.id]);
      const achievements = achievementsResult.length && achievementsResult[0].values.length
        ? achievementsResult[0].values.map(r => r[0] as string)
        : [];

      const skillsResult = db.exec('SELECT skill FROM experience_skills WHERE experience_id = ?', [expRow.id]);
      const skills = skillsResult.length && skillsResult[0].values.length
        ? skillsResult[0].values.map(r => r[0] as string)
        : [];

      return {
        id: expRow.id,
        company: expRow.company,
        title: expRow.title,
        location: expRow.location,
        startDate: expRow.start_date,
        endDate: expRow.end_date,
        isCurrent: expRow.is_current === 1,
        description: expRow.description,
        achievements,
        skills,
      };
    });
  }

  // Get projects
  const projectsResult = db.exec('SELECT * FROM projects WHERE profile_id = ?', [profile.id]);
  if (projectsResult.length && projectsResult[0].values.length) {
    profile.projects = projectsResult[0].values.map((row): Project => {
      const projectRow: any = {};
      projectsResult[0].columns.forEach((col, idx) => {
        projectRow[col] = row[idx];
      });

      const techResult = db.exec('SELECT technology FROM project_technologies WHERE project_id = ?', [projectRow.id]);
      const technologies = techResult.length && techResult[0].values.length
        ? techResult[0].values.map(r => r[0] as string)
        : [];

      return {
        id: projectRow.id,
        name: projectRow.name,
        description: projectRow.description,
        url: projectRow.url,
        startDate: projectRow.start_date,
        endDate: projectRow.end_date,
        technologies,
      };
    });
  }

  // Get certifications
  const certificationsResult = db.exec('SELECT * FROM certifications WHERE profile_id = ?', [profile.id]);
  if (certificationsResult.length && certificationsResult[0].values.length) {
    profile.certifications = certificationsResult[0].values.map((row): Certification => {
      const certRow: any = {};
      certificationsResult[0].columns.forEach((col, idx) => {
        certRow[col] = row[idx];
      });
      return {
        id: certRow.id,
        name: certRow.name,
        issuer: certRow.issuer,
        dateObtained: certRow.date_obtained,
        expirationDate: certRow.expiration_date,
        credentialId: certRow.credential_id,
        url: certRow.url,
      };
    });
  }

  return profile;
}

/**
 * Delete a profile and all associated data
 */
export function deleteProfile(db: SqlJsDatabase, profileId: string): void {
  db.run('DELETE FROM profiles WHERE id = ?', [profileId]);
}

/**
 * List all profiles (metadata only)
 */
export function listProfiles(db: SqlJsDatabase): Array<{
  id: string;
  fullName?: string;
  email?: string;
  candidateLevel: string;
  updatedAt: Date;
}> {
  const result = db.exec(`
    SELECT id, full_name, email, candidate_level, updated_at
    FROM profiles
    ORDER BY updated_at DESC
  `);

  if (!result.length || !result[0].values.length) return [];

  return result[0].values.map(row => {
    const profileRow: any = {};
    result[0].columns.forEach((col, idx) => {
      profileRow[col] = row[idx];
    });

    return {
      id: profileRow.id,
      fullName: profileRow.full_name,
      email: profileRow.email,
      candidateLevel: profileRow.candidate_level,
      updatedAt: new Date(profileRow.updated_at),
    };
  });
}
