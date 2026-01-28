
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

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      author TEXT,
      authorPhoto TEXT,
      image TEXT,
      tags TEXT, -- JSON array
      metaInformation TEXT,
      status TEXT, -- 'draft' | 'published'
      searchKeywords TEXT, -- JSON array
      searchKeywords TEXT, -- JSON array
      createdAt TEXT -- ISO string
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      uploadedBy TEXT,
      type TEXT,
      size INTEGER,
      tags TEXT, -- JSON array
      meta TEXT, -- JSON array
      uploadedOn TEXT,
      uploadedAt TEXT,
      createdAt TEXT
    );



    DELETE FROM uploads WHERE rowid NOT IN (
      SELECT MIN(rowid) FROM uploads GROUP BY url
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_uploads_url ON uploads(url);
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

// --- Blog Post Helpers ---

export interface PostDB {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorPhoto: string;
  createdAt: string; // ISO string
  image: string;
  tags: string; // JSON string array
  metaInformation: string;
  status: string; // 'draft' | 'published'
  searchKeywords: string; // JSON string array
}

export function getPosts(options?: {
  limit?: number;
  page?: number;
  status?: string;
  search?: string;
  tags?: string[];
}) {
  const limit = options?.limit || 10;
  const page = options?.page || 1;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM posts';
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }

  if (options?.search) {
    conditions.push('(title LIKE ? OR content LIKE ? OR searchKeywords LIKE ?)');
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }

  if (options?.tags && options.tags.length > 0) {
    const tagConditions = options.tags.map(() => 'tags LIKE ?');
    conditions.push(`(${tagConditions.join(' OR ')})`);
    options.tags.forEach(tag => params.push(`%${tag}%`));
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params) as PostDB[];

  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM posts';
  const countParams = params.slice(0, params.length - 2);

  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }

  const totalCount = (db.prepare(countQuery).get(...countParams) as { count: number }).count;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    posts: rows.map(row => ({
      ...row,
      date: row.createdAt, // Map for compatibility
      tags: JSON.parse(row.tags || '[]'),
      searchKeywords: JSON.parse(row.searchKeywords || '[]'),
    })),
    totalCount,
    totalPages,
    hasMore: page < totalPages
  };
}

export function getPostById(id: string) {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as PostDB | undefined;
  if (!row) return null;
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    searchKeywords: JSON.parse(row.searchKeywords || '[]'),
  };
}

export function getPostBySlug(slug: string) {
  const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as PostDB | undefined;
  if (!row) return null;
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    searchKeywords: JSON.parse(row.searchKeywords || '[]'),
  };
}

export function savePost(post: Omit<PostDB, 'tags' | 'searchKeywords'> & { tags: string[], searchKeywords: string[] }) {
  const existing = db.prepare('SELECT id FROM posts WHERE id = ?').get(post.id);

  // Convert arrays to JSON strings
  const serializedPost = {
    ...post,
    tags: JSON.stringify(post.tags),
    searchKeywords: JSON.stringify(post.searchKeywords)
  };

  if (existing) {
    db.prepare(`
            UPDATE posts 
            SET slug = @slug, title = @title, excerpt = @excerpt, content = @content, 
                author = @author, authorPhoto = @authorPhoto, image = @image, 
                tags = @tags, metaInformation = @metaInformation, status = @status, 
                searchKeywords = @searchKeywords
            WHERE id = @id
        `).run(serializedPost);
  } else {
    db.prepare(`
            INSERT INTO posts (id, slug, title, excerpt, content, author, authorPhoto, createdAt, image, tags, metaInformation, status, searchKeywords)
            VALUES (@id, @slug, @title, @excerpt, @content, @author, @authorPhoto, @createdAt, @image, @tags, @metaInformation, @status, @searchKeywords)
        `).run(serializedPost);
  }
  return post.id;
}

export function deletePost(id: string) {
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
}

// --- Upload Helpers ---

export interface UploadDB {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  type: string;
  size: number;
  tags: string; // JSON string
  meta: string; // JSON string
  uploadedOn: string;
  uploadedAt: string;
  createdAt: string;
}

export function saveUpload(upload: Omit<UploadDB, 'tags' | 'meta'> & { tags: string[], meta: any[] }) {
  // Check collision on URL
  const existingUrl = db.prepare('SELECT id FROM uploads WHERE url = ?').get(upload.url) as { id: string } | undefined;

  if (existingUrl) {
    if (existingUrl.id !== upload.id) {
      // URL exists on DIFFERENT ID.
      // If we are trying to insert new (upload.id not in DB), then we should deduplicate and return existing ID.
      const selfExists = db.prepare('SELECT id FROM uploads WHERE id = ?').get(upload.id);
      if (selfExists) {
        // This is an UPDATE to an existing record, changing its URL to a duplicate one.
        throw new Error('Cannot update upload: URL already exists.');
      } else {
        // This is an INSERT of a new record with a duplicate URL.
        // Return the EXISTING ID and skip insert.
        return existingUrl.id;
      }
    }
  }

  const existing = db.prepare('SELECT id FROM uploads WHERE id = ?').get(upload.id);

  const serializedUpload = {
    ...upload,
    tags: JSON.stringify(upload.tags),
    meta: JSON.stringify(upload.meta)
  };

  if (existing) {
    db.prepare(`
      UPDATE uploads 
      SET name = @name, url = @url, uploadedBy = @uploadedBy, type = @type, 
          size = @size, tags = @tags, meta = @meta, uploadedOn = @uploadedOn, 
          uploadedAt = @uploadedAt, createdAt = @createdAt
      WHERE id = @id
    `).run(serializedUpload);
  } else {
    db.prepare(`
      INSERT INTO uploads (id, name, url, uploadedBy, type, size, tags, meta, uploadedOn, uploadedAt, createdAt)
      VALUES (@id, @name, @url, @uploadedBy, @type, @size, @tags, @meta, @uploadedOn, @uploadedAt, @createdAt)
    `).run(serializedUpload);
  }
  return upload.id;
}

export function getUploads(options?: {
  limit?: number;
  page?: number;
  tags?: string[];
  search?: string;
}) {
  const limit = options?.limit || 10;
  const page = options?.page || 1;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM uploads';
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.search) {
    conditions.push('name LIKE ?');
    params.push(`%${options.search}%`);
  }

  if (options?.tags && options.tags.length > 0) {
    const tagConditions = options.tags.map(() => 'tags LIKE ?');
    conditions.push(`(${tagConditions.join(' OR ')})`);
    options.tags.forEach(tag => params.push(`%${tag}%`));
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY uploadedAt DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params) as UploadDB[];

  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM uploads';
  const countParams = params.slice(0, params.length - 2);

  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }

  const totalCount = (db.prepare(countQuery).get(...countParams) as { count: number }).count;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    uploads: rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      meta: JSON.parse(row.meta || '[]'),
      size: row.size || 0
    })),
    totalCount,
    totalPages,
    hasMore: page < totalPages
  };
}

export function getUploadById(id: string) {
  const row = db.prepare('SELECT * FROM uploads WHERE id = ?').get(id) as UploadDB | undefined;
  if (!row) return null;
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    meta: JSON.parse(row.meta || '[]'),
    size: row.size || 0
  };
}

export function deleteUpload(id: string) {
  db.prepare('DELETE FROM uploads WHERE id = ?').run(id);
}

export function getUploadByUrl(url: string) {
  const row = db.prepare('SELECT * FROM uploads WHERE url = ?').get(url) as UploadDB | undefined;
  if (!row) return null;
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    meta: JSON.parse(row.meta || '[]'),
    size: row.size || 0
  };
}

