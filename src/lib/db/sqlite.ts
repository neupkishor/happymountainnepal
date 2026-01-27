
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'happymountain.db');

// Singleton pattern to prevent multiple connections during development hot-reloading
const globalForDb = global as unknown as { db: Database.Database };

export const db = globalForDb.db || new Database(dbPath);

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT NOT NULL,
      description TEXT NOT NULL,
      link TEXT
    );

    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      basePath TEXT,
      reviewCount INTEGER,
      contactEmail TEXT,
      phone TEXT,
      address TEXT,
      heroTitle TEXT,
      heroDescription TEXT,
      footerTagline TEXT,
      location TEXT,
      locationUrl TEXT,
      heroImage TEXT,
      heroImages TEXT,
      heroTransitionInterval INTEGER,
      socials TEXT,
      whyUs TEXT,
      chatbot TEXT
    );
  `);
}

// Initialize tables
initDb();
