
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
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      isFeatured INTEGER DEFAULT 0,
      parentId TEXT,
      createdAt TEXT,
      FOREIGN KEY (parentId) REFERENCES locations(id) ON DELETE SET NULL
    );
  `);

  // Migration for adding parentId to existing table if needed
  try {
    const tableInfo = db.prepare("PRAGMA table_info(locations)").all() as any[];
    const hasParentId = tableInfo.some(col => col.name === 'parentId');
    if (!hasParentId) {
      db.prepare("ALTER TABLE locations ADD COLUMN parentId TEXT").run();
      // SQLite doesn't support adding FK constraints in ALTER TABLE easily, so we skip the constraint for existing tables or rely on app logic
    }
  } catch (error) {
    console.error("Migration error (parentId):", error);
  }
}

// Initialize tables
initDb();

// --- Location Helpers ---

export interface LocationDB {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isFeatured: number; // SQLite stores booleans as 0/1
  parentId: string | null;
  createdAt: string;
  parentName?: string; // Derived
}

export function getLocations(options?: { featured?: boolean }) {
  let query = `
    SELECT l.*, p.name as parentName 
    FROM locations l
    LEFT JOIN locations p ON l.parentId = p.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (options?.featured) {
    conditions.push('l.isFeatured = 1');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY l.createdAt DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as LocationDB[];

  return rows.map(row => ({
    ...row,
    isFeatured: Boolean(row.isFeatured),
    parentId: row.parentId || null
  }));
}

export function getLocationById(id: string) {
  const row = db.prepare(`
    SELECT l.*, p.name as parentName 
    FROM locations l
    LEFT JOIN locations p ON l.parentId = p.id
    WHERE l.id = ?
  `).get(id) as LocationDB | undefined;

  if (!row) return null;
  return {
    ...row,
    isFeatured: Boolean(row.isFeatured),
    parentId: row.parentId || null
  };
}

export function getLocationBySlug(slug: string) {
  const row = db.prepare(`
    SELECT l.*, p.name as parentName 
    FROM locations l
    LEFT JOIN locations p ON l.parentId = p.id
    WHERE l.slug = ?
  `).get(slug) as LocationDB | undefined;

  if (!row) return null;
  return {
    ...row,
    isFeatured: Boolean(row.isFeatured),
    parentId: row.parentId || null
  };
}

export function saveLocation(location: Omit<LocationDB, 'createdAt' | 'parentName'> & { createdAt?: string }) {
  const existing = db.prepare('SELECT id FROM locations WHERE id = ?').get(location.id);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE locations 
      SET name = @name, slug = @slug, description = @description, image = @image, isFeatured = @isFeatured, parentId = @parentId
      WHERE id = @id
    `).run({
      ...location,
      isFeatured: location.isFeatured ? 1 : 0,
      parentId: location.parentId || null
    });
  } else {
    db.prepare(`
      INSERT INTO locations (id, name, slug, description, image, isFeatured, parentId, createdAt)
      VALUES (@id, @name, @slug, @description, @image, @isFeatured, @parentId, @createdAt)
    `).run({
      ...location,
      isFeatured: location.isFeatured ? 1 : 0,
      parentId: location.parentId || null,
      createdAt: location.createdAt || now
    });
  }
  return location.id;
}

export function deleteLocation(id: string) {
  db.prepare('DELETE FROM locations WHERE id = ?').run(id);
}

export function getChildLocations(parentId: string) {
  const rows = db.prepare('SELECT * FROM locations WHERE parentId = ?').all(parentId) as LocationDB[];
  return rows.map(row => ({
    ...row,
    isFeatured: Boolean(row.isFeatured),
    parentId: row.parentId || null
  }));
}
