import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../../local-data');
const DB_PATH = path.join(DB_DIR, 'joblister.db');

let db: SqlJsDatabase | null = null;

/**
 * Initialize SQLite database with Milestone 1 schema
 */
export async function initDatabase(): Promise<SqlJsDatabase> {
  // Ensure local-data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Initialize sql.js
  const SQL = await initSqlJs();

  // Load existing database or create new one
  let database: SqlJsDatabase;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    database = new SQL.Database(fileBuffer);
  } else {
    database = new SQL.Database();
  }

  // Enable foreign keys
  database.run('PRAGMA foreign_keys = ON');

  // Create schema
  database.exec(`
    -- Metadata table (from M0)
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- User profile (M1)
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      resume_file_name TEXT,
      raw_resume_text TEXT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      candidate_level TEXT NOT NULL,
      graduation_date TEXT
    );

    -- Skills (M1)
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      category TEXT,
      proficiency TEXT,
      years_of_experience REAL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_skills_profile ON skills(profile_id);
    CREATE INDEX IF NOT EXISTS idx_skills_normalized ON skills(normalized_name);

    -- Education (M1)
    CREATE TABLE IF NOT EXISTS education (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      field TEXT,
      start_date TEXT,
      end_date TEXT,
      graduated INTEGER NOT NULL DEFAULT 0,
      gpa REAL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_education_profile ON education(profile_id);

    -- Education achievements
    CREATE TABLE IF NOT EXISTS education_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      education_id TEXT NOT NULL,
      achievement TEXT NOT NULL,
      FOREIGN KEY (education_id) REFERENCES education(id) ON DELETE CASCADE
    );

    -- Experience (M1)
    CREATE TABLE IF NOT EXISTS experience (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      is_current INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_experience_profile ON experience(profile_id);

    -- Experience achievements
    CREATE TABLE IF NOT EXISTS experience_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id TEXT NOT NULL,
      achievement TEXT NOT NULL,
      FOREIGN KEY (experience_id) REFERENCES experience(id) ON DELETE CASCADE
    );

    -- Experience skills
    CREATE TABLE IF NOT EXISTS experience_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      FOREIGN KEY (experience_id) REFERENCES experience(id) ON DELETE CASCADE
    );

    -- Projects (M1)
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT,
      start_date TEXT,
      end_date TEXT,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_profile ON projects(profile_id);

    -- Project technologies
    CREATE TABLE IF NOT EXISTS project_technologies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      technology TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Certifications (M1)
    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      issuer TEXT NOT NULL,
      date_obtained TEXT,
      expiration_date TEXT,
      credential_id TEXT,
      url TEXT,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_certifications_profile ON certifications(profile_id);
  `);

  // Save to disk
  saveDatabase(database);

  db = database;
  return database;
}

export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Save database to disk
 */
export function saveDatabase(database?: SqlJsDatabase): void {
  const dbToSave = database || db;
  if (!dbToSave) {
    throw new Error('No database to save');
  }

  const data = dbToSave.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Helper to run a query and auto-save
 */
export function runAndSave(database: SqlJsDatabase, sql: string, params?: any[]): void {
  database.run(sql, params);
  saveDatabase(database);
}

/**
 * Helper to execute multiple statements in a transaction and auto-save
 */
export function transactionAndSave(database: SqlJsDatabase, callback: () => void): void {
  try {
    database.run('BEGIN TRANSACTION');
    callback();
    database.run('COMMIT');
    saveDatabase(database);
  } catch (error) {
    database.run('ROLLBACK');
    throw error;
  }
}
