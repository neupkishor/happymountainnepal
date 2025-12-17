# Final Storage Architecture

## Overview
The application now uses a **hybrid storage approach** that separates credential files (Edge runtime compatible) from configuration files (Node.js runtime only).

## Directory Structure

### `/base` - Configuration Files (Node.js Runtime)
```
/base
├── navigation-components.json  (tracked in git)
└── redirects.json              (tracked in git)
```

**Purpose**: Runtime-editable configuration files  
**Runtime**: Node.js only (API routes, Server Components)  
**Access Method**: `fs.readFile()` via `readBaseFile()` and `writeBaseFile()`  
**Git**: Tracked in repository  

### `/src/base` - Credential Files (Edge Runtime Compatible)
```
/src/base
├── manager.json                (gitignored)
├── session.json                (gitignored)
├── manager.template.json       (tracked in git)
├── session.template.json       (tracked in git)
├── navigation-components.template.json (tracked in git)
├── redirects.template.json     (tracked in git)
└── README.md                   (tracked in git)
```

**Purpose**: Sensitive credential files  
**Runtime**: Both Edge and Node.js (imported as JSON modules)  
**Access Method**: Direct imports via `getManagerData()` and `getSessionData()`  
**Git**: Actual files gitignored, templates tracked  

## How It Works

### Edge Runtime (Middleware)
```typescript
// src/middleware.ts
import { getManagerData } from '@/lib/base';
import { matchRedirectEdge } from '@/lib/redirects-edge';

// Direct imports work in Edge runtime
const managers = getManagerData(); // From /src/base/manager.json
const redirect = matchRedirectEdge(pathname); // From /base/redirects.json (direct import)
```

### Node.js Runtime (API Routes)
```typescript
// src/app/api/*/route.ts
import { readBaseFile, writeBaseFile, readCredentialFile } from '@/lib/base';

// File system operations work in Node.js runtime
const redirects = await readBaseFile('redirects.json'); // From /base
const managers = await readCredentialFile('manager.json'); // From /src/base
```

## File Access Functions

### For Configuration Files (`/base`)
```typescript
// Read configuration (redirects, navigation)
const data = await readBaseFile<T>('filename.json');

// Write configuration
await writeBaseFile('filename.json', data);

// Check if file exists
const exists = await baseFileExists('filename.json');
```

### For Credential Files (`/src/base`)
```typescript
// Read credentials (manager, session)
const data = await readCredentialFile<T>('filename.json');

// Write credentials
await writeCredentialFile('filename.json', data);

// Or use direct imports (Edge compatible)
const managers = getManagerData();
const sessions = getSessionData();
```

## Why This Architecture?

### Problem
- **Edge Runtime** doesn't support Node.js modules (`fs`, `path`)
- **Middleware** runs in Edge Runtime
- **Credentials** need to be accessible in middleware for authentication
- **Configuration** files need to be editable at runtime

### Solution
1. **Credentials** (`manager.json`, `session.json`) → `/src/base`
   - Imported as JSON modules (no `fs` needed)
   - Work in Edge Runtime
   - Bundled with the application
   - Gitignored for security

2. **Configuration** (`redirects.json`, `navigation-components.json`) → `/base`
   - Read using `fs` in Node.js runtime
   - Editable at runtime without rebuild
   - Tracked in git
   - Used by API routes and Server Components

## Benefits

✅ **Edge Runtime Compatible** - Credentials work in middleware  
✅ **No Rebuild Required** - Configuration files can be edited at runtime  
✅ **Secure** - Credentials gitignored, never committed  
✅ **Flexible** - Configuration tracked in git, can be version controlled  
✅ **Fast** - Direct imports for credentials (no file I/O)  
✅ **Maintainable** - Clear separation of concerns  

## File Usage Map

| File | Location | Runtime | Access Method | Git |
|------|----------|---------|---------------|-----|
| `manager.json` | `/src/base` | Edge + Node.js | Direct import | Gitignored |
| `session.json` | `/src/base` | Edge + Node.js | Direct import | Gitignored |
| `redirects.json` | `/base` | Node.js only | `fs.readFile()` | Tracked |
| `navigation-components.json` | `/base` | Node.js only | `fs.readFile()` | Tracked |

## Code Examples

### Middleware (Edge Runtime)
```typescript
// ✅ Works - Direct import from /src/base
import { getManagerData } from '@/lib/base';
const managers = getManagerData();

// ✅ Works - Direct import from /base
import redirectsData from '../../base/redirects.json';
const redirects = redirectsData;

// ❌ Doesn't work - fs not available in Edge
import fs from 'fs';
const data = fs.readFileSync('...');
```

### API Routes (Node.js Runtime)
```typescript
// ✅ Works - fs available in Node.js
const redirects = await readBaseFile('redirects.json');
await writeBaseFile('redirects.json', newData);

// ✅ Also works - Direct imports work everywhere
import { getManagerData } from '@/lib/base';
const managers = getManagerData();
```

## Deployment

### Local Development
1. Files already set up in correct locations
2. Run `npm run dev`
3. Everything works out of the box

### AWS Server Deployment
1. **Configuration files** (`/base`) - Tracked in git, deployed automatically
2. **Credential files** (`/src/base`) - Must be created manually:
   ```bash
   # On AWS server
   cp src/base/manager.template.json src/base/manager.json
   cp src/base/session.template.json src/base/session.json
   # Edit with production credentials
   nano src/base/manager.json
   ```

## Security Notes

⚠️ **Important**:
- Never commit actual credential files to git
- Use strong passwords in production
- Ensure proper file permissions on server (`chmod 600` for credentials)
- Consider using AWS Secrets Manager for production credentials
- HTTPS is enforced for `/manage` routes

## Summary

This architecture provides the best of both worlds:
- **Credentials** in `/src/base` for Edge runtime compatibility
- **Configuration** in `/base` for runtime editability
- **No rebuilds** needed for configuration changes
- **Secure** credential management
- **Fast** performance with direct imports

The system is now production-ready for AWS server deployment! 🎉
