# Upload System - Complete Data Flow Analysis

## Overview
The system supports **3 types of uploads**:
1. **NeupCDN** - Files uploaded to external CDN (neupgroup.com)
2. **Application/Server** - Files uploaded to local server
3. **HotLinked** - External URLs added as references

---

## Upload Methods & Database Fields

### 1. NeupCDN Uploads (via UploadDialog)

**Upload Flow:**
- User uploads file through `UploadDialog` component
- File sent to `https://neupgroup.com/content/bridge/api/upload`
- Response contains the CDN URL
- URL logged to database via `/api/log-upload`

**Database Fields Saved:**
```typescript
{
  name: string,                             // Original filename (e.g., "hero.jpg")
  url: string,                              // Full URL (e.g., "https://neupgroup.com/hero.jpg")
  from: 'NeupCDN','Hotlinked','Server'      // Fixed value
  uploadedBy: string,                       // User who uploaded (default: 'admin')
  type: string,                             // MIME type (e.g., "image/jpeg")
  size: number,                             // File size in bytes
  tags: string[],                           // Default: 'general'
  meta: [],                                 // Populated based on the file type.
  uploadedOn: string,                       // ISO date string
  uploadedAt: Timestamp,                    // Firestore server timestamp
  createdAt: Timestamp                      // Firestore server timestamp
}
```

Updates:
1. delete the UploadCategory and then we use the tags.
2. NeupCDN: there are certain files that 

**Example Values:**
```json
{
  "name": "mountain-hero.jpg",
  "url": "https://neupgroup.com/content/bridge/uploads/mountain-hero-1234567890.jpg",
  "location": "NeupCDN",
  "uploadedBy": "admin",
  "type": "image/jpeg",
  "size": 2048576,
  "category": "general",
  "meta": [],
  "uploadedOn": "2025-12-27T06:55:41.000Z",
  "uploadedAt": "Firestore Timestamp",
  "createdAt": "Firestore Timestamp"
}
```

---

### 2. Server/Application Uploads (via /api/upload)

**Upload Flow:**
- File uploaded via `/api/upload` API route
- File saved to `public/[serverPath]/` directory
- Path stored with `{{basePath}}` template
- Logged to database with relative path

**Database Fields Saved:**
```typescript
{
  url: string,               // Template path (e.g., "{{basePath}}/uploads/hero.jpg")
  path: string,              // Same as url
  pathType: 'relative',      // Fixed value for server uploads
  uploadSource: 'Application', // Fixed value
  fileName: string,          // Generated filename with timestamp
  fileType: string,          // MIME type
  userId: string,            // Default: 'admin'
  category: UploadCategory,  // Default: 'general'
  uploadedOn: string,        // ISO date string
  uploadedAt: Timestamp,     // Firestore server timestamp
  createdAt: Timestamp       // Firestore server timestamp
}
```

**Example Values (Uncompressed):**
```json
{
  "url": "{{basePath}}/uploads/trek-photo-1703673341000.png",
  "path": "{{basePath}}/uploads/trek-photo-1703673341000.png",
  "pathType": "relative",
  "uploadSource": "Application",
  "fileName": "trek-photo-1703673341000.png",
  "fileType": "image/png",
  "userId": "admin",
  "category": "general",
  "uploadedOn": "2025-12-27T06:55:41.000Z",
  "uploadedAt": "Firestore Timestamp",
  "createdAt": "Firestore Timestamp"
}
```

**Example Values (Compressed Image):**
```json
{
  "url": "{{basePath}}/uploads/trek-photo-1703673341000.jpg",
  "path": "{{basePath}}/uploads/trek-photo-1703673341000.jpg",
  "pathType": "relative",
  "uploadSource": "Application",
  "fileName": "trek-photo-1703673341000.jpg",
  "fileType": "image/jpeg",
  "userId": "admin",
  "category": "general",
  "uploadedOn": "2025-12-27T06:55:41.000Z",
  "uploadedAt": "Firestore Timestamp",
  "createdAt": "Firestore Timestamp"
}
```

**Compression Details:**
- If `compress=true` and file is an image:
  - Resized to max 1920x1920 (maintains aspect ratio)
  - Converted to JPEG with 85% quality
  - Extension changed to `.jpg`

---

### 3. HotLinked/External URLs (via addExternalMediaLink)

**Upload Flow:**
- User provides external URL
- URL added directly to database
- No file upload occurs

**Database Fields Saved:**
```typescript
{
  url: string,               // External URL
  name: string,              // Extracted from URL
  type: string,              // Inferred from extension
  size: number,              // Always 0
  location: 'HotLinked',     // Fixed value
  meta: [],                  // Empty array
  uploadedOn: string,        // ISO date string
  uploadedAt: Timestamp,     // Firestore server timestamp
  uploadedBy: string,        // User who added
  category: 'general',       // Fixed value
  createdAt: Timestamp       // Firestore server timestamp
}
```

**Example Values:**
```json
{
  "url": "https://example.com/images/mountain.jpg",
  "name": "mountain.jpg",
  "type": "image/jpg",
  "size": 0,
  "location": "HotLinked",
  "meta": [],
  "uploadedOn": "2025-12-27T06:55:41.000Z",
  "uploadedAt": "Firestore Timestamp",
  "uploadedBy": "admin",
  "category": "general",
  "createdAt": "Firestore Timestamp"
}
```

---

## Upload Categories

Available categories (UploadCategory type):
- `'general'` - Default category
- `'trip'` - Trip/tour related media
- `'document'` - Documents
- `'background'` - Background images
- `'feature-icon'` - Feature icons
- `'user-photo'` - User photos
- `'blog'` - Blog images
- `'logo'` - Logos
- `'author'` - Author photos

---

## File Locations

Three possible locations (FileLocation type):
- `'NeupCDN'` - Uploaded to external CDN
- `'Local'` - Uploaded to application server
- `'HotLinked'` - External URL reference

---

## Database Collection

**Collection Name:** `uploads`

**Retrieval Logic** (from `getFileUploads`):
The system handles backward compatibility by mapping old field names to new ones:

```typescript
{
  id: doc.id,
  name: data.name || data.fileName || 'Untitled',
  caption: data.caption || '',
  type: data.type || data.fileType || 'application/octet-stream',
  category: data.category || 'general',
  size: data.size || data.fileSize || 0,
  location: data.location || 
            (data.uploadSource === 'NeupCDN' ? 'NeupCDN' : 
            (data.pathType === 'absolute' ? 'HotLinked' : 'Local')),
  meta: Array.isArray(data.meta) ? data.meta : 
        (data.metaInformation ? [data.metaInformation] : []),
  uploadedOn: data.uploadedOn || 
              (data.uploadedAt instanceof Timestamp ? 
              data.uploadedAt.toDate().toISOString() : 
              new Date().toISOString()),
  uploadedBy: data.uploadedBy || data.userId || 'Unknown',
  url: data.url || ''
}
```

---

## API Endpoints

### 1. `/api/upload` (POST)
**Purpose:** Upload files to server  
**Form Data:**
- `file` - The file to upload
- `compress` - 'true' | 'false' (optional)
- `uploadType` - 'server' | 'api' (default: 'server')
- `serverPath` - Subdirectory path (optional)

**Response:**
```json
{
  "success": true,
  "url": "{{basePath}}/uploads/filename.jpg",
  "fileName": "filename.jpg",
  "compressed": true,
  "uploadType": "server",
  "serverPath": "uploads"
}
```

### 2. `/api/log-upload` (POST)
**Purpose:** Log NeupCDN uploads to database  
**JSON Body:**
```json
{
  "name": "filename.jpg",
  "url": "https://neupgroup.com/...",
  "uploadedBy": "admin",
  "type": "image/jpeg",
  "category": "general",
  "size": 2048576
}
```

---

## Summary Table

| Upload Type | Location | URL Format | Physical Storage | Database Fields |
|------------|----------|------------|------------------|-----------------|
| **NeupCDN** | NeupCDN | `https://neupgroup.com/...` | External CDN | name, url, location, uploadedBy, type, size, category, meta, uploadedOn, uploadedAt, createdAt |
| **Server** | Local | `{{basePath}}/path/file.jpg` | `public/` directory | url, path, pathType, uploadSource, fileName, fileType, userId, category, uploadedOn, uploadedAt, createdAt |
| **HotLinked** | HotLinked | `https://external.com/...` | External (not stored) | url, name, type, size, location, meta, uploadedOn, uploadedAt, uploadedBy, category, createdAt |

---

## Key Points

1. **NeupCDN uploads** are the primary method via UploadDialog
2. **Server uploads** require `basePath` to be configured in site settings
3. **HotLinked** files are just URL references, no actual upload
4. All uploads are logged to Firestore `uploads` collection
5. Server files use `{{basePath}}` template for portability
6. Images can be auto-compressed during server upload
7. The system maintains backward compatibility with old field names
