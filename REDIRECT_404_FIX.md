# Production 404 Error - Root Cause & Solutions

## Problem Summary
Redirects work locally but return 404 errors in production (Firebase App Hosting).

## Root Causes

### 1. **File System Access in Production** ⚠️
- The `base/redirects.json` file exists locally but may not be accessible in production
- Firebase App Hosting runs in a containerized environment
- The `base/` directory is not part of the build output and won't be deployed
- File system operations in middleware/API routes may fail

### 2. **Middleware Fetch Timing**
- Middleware calls `/api/redirects/match` which reads from file system
- During cold starts, this can fail or timeout
- The middleware silently catches errors (line 143-145 in middleware.ts)

### 3. **Missing Data Persistence**
- The `base/` directory is meant for runtime data but isn't persisted in cloud deployments
- Each deployment may start with an empty `base/` directory

## Solutions

### ✅ **Solution 1: Use Firestore (RECOMMENDED)**

Store redirects in Firestore instead of the file system.

**Advantages:**
- Works in all environments (local, production, edge)
- Data persists across deployments
- Can be updated without redeployment
- Already using Firebase

**Implementation:**
1. Use the new `firestore-redirects.ts` module
2. Update API routes to use Firestore
3. Migrate existing redirects to Firestore
4. Keep `base/redirects.json` as a backup/fallback

**Files to update:**
- `src/app/api/redirects/route.ts` - Use Firestore functions
- `src/app/api/redirects/match/route.ts` - Use Firestore functions

### ✅ **Solution 2: Include base/ in Deployment**

Ensure the `base/` directory is included in your Firebase deployment.

**Steps:**
1. Add `base/` to your build output
2. Update `apphosting.yaml` to include the directory
3. Set proper file permissions

**Limitations:**
- Data won't update without redeployment
- Not ideal for dynamic redirects

### ✅ **Solution 3: Use Environment Variables + KV Store**

Use Vercel KV, Redis, or similar for fast key-value storage.

**Advantages:**
- Very fast lookups
- Works in edge runtime
- Good for high-traffic sites

## Recommended Action Plan

### Phase 1: Quick Fix (Use Firestore)
1. ✅ Created `src/lib/firestore-redirects.ts`
2. Update `src/app/api/redirects/route.ts`
3. Update `src/app/api/redirects/match/route.ts`
4. Migrate existing redirects to Firestore
5. Test locally
6. Deploy to production

### Phase 2: Optimization (Optional)
1. Add caching to reduce Firestore reads
2. Use SWR or React Query for client-side caching
3. Add redirect analytics
4. Implement A/B testing for redirects

## Testing Checklist

- [ ] Test redirects locally with Firestore
- [ ] Test exact match: `/kishor` → `/bhawani`
- [ ] Test pattern match: `/trip/abc` → `/tours/abc`
- [ ] Test non-existent paths (should return 404)
- [ ] Deploy to production
- [ ] Verify redirects work in production
- [ ] Check middleware logs for errors
- [ ] Test cold start behavior

## Migration Script

To migrate existing redirects from `base/redirects.json` to Firestore:

```typescript
// Run this once to migrate data
import { readBaseFile } from '@/lib/base';
import { addRedirectToFirestore } from '@/lib/firestore-redirects';

async function migrateRedirects() {
  const redirects = await readBaseFile('redirects.json');
  for (const redirect of redirects) {
    const { id, createdAt, ...data } = redirect;
    await addRedirectToFirestore(data);
  }
  console.log('Migration complete!');
}
```

## Next Steps

1. Review this document
2. Decide on solution (Firestore recommended)
3. Update API routes
4. Test thoroughly
5. Deploy to production

---

**Created:** 2025-12-17
**Status:** Pending Implementation
