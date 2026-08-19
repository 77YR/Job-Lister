import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../../local-data');
const DB_PATH = path.join(DB_DIR, 'joblister.db');

/**
 * Initialize SQLite database
 * Schema will be populated in Milestone 1+
 */
export function initDatabase(): Database.Database {
  // Ensure local-data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Create minimal schema for M0 - will expand in future milestones
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  return db;
}

export function getDatabase(): Database.Database {
  return new Database(DB_PATH);
}