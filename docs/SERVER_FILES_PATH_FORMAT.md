# Server Files (Local /public) Path Format

## Overview
Files saved on the server (in the `/public` directory) use the `{{basePath}}` + relativePath format, making them portable and consistent with all other file types.

## Implementation

### AddLocalImageDialog
When adding a local image from the `/public` directory:

```typescript
// User enters
relativePath: "/images/hero.jpg"

// System normalizes
normalizedPath: "/images/hero.jpg" // Ensures leading slash

// System creates template
templatePath: "{{basePath}}/images/hero.jpg"

// Stored in database
{
  fileName: "hero.jpg",
  pathType: "relative",
  path: "{{basePath}}/images/hero.jpg",
  url: "{{basePath}}/images/hero.jpg",
  uploadSource: "Application"
}
```

## Path Format Examples

### Example 1: Image in /public/images
```
File location: /public/images/logo.png
User enters: /images/logo.png
Stored as: {{basePath}}/images/logo.png
```

### Example 2: Asset in /public/assets
```
File location: /public/assets/icons/star.svg
User enters: /assets/icons/star.svg
Stored as: {{basePath}}/assets/icons/star.svg
```

### Example 3: Media in /public/media
```
File location: /public/media/videos/intro.mp4
User enters: /media/videos/intro.mp4
Stored as: {{basePath}}/media/videos/intro.mp4
```

## Runtime Resolution

When the image is used, the template is replaced:

```typescript
// Stored in database
path: "{{basePath}}/images/logo.png"

// Base URL from profile
baseUrl: "https://happymountainnepal.com"

// Rendered URL
result: "https://happymountainnepal.com/images/logo.png"
```

## Complete Flow

### 1. Adding Local Image
```
User Action:
- Go to /manage/uploads
- Click "Add Local Image"
- Enter path: /images/hero.jpg

System Processing:
- Normalizes path: /images/hero.jpg
- Creates template: {{basePath}}/images/hero.jpg
- Stores in database

Database Entry:
{
  pathType: "relative",
  path: "{{basePath}}/images/hero.jpg",
  uploadSource: "Application"
}
```

### 2. Selecting Image
```
User Action:
- Open media picker
- Select the local image

System Processing:
- Reads from database: {{basePath}}/images/hero.jpg
- Gets base URL: https://happymountainnepal.com
- Replaces template: https://happymountainnepal.com/images/hero.jpg
- Returns to form

Form Receives:
https://happymountainnepal.com/images/hero.jpg
```

### 3. Rendering Image
```
Component:
<SmartImage 
  pathType="relative"
  path="{{basePath}}/images/hero.jpg"
/>

Processing:
- Gets base URL from profile
- Replaces {{basePath}} with base URL
- Renders with full URL

HTML Output:
<img src="https://happymountainnepal.com/images/hero.jpg" />
```

## All File Types Use Same Format

### Comparison Table

| File Type | Source | Stored Format | Example |
|-----------|--------|---------------|---------|
| CDN Upload | NeupCDN | `{{basePath}}/path` | `{{basePath}}/content/bridge/uploads/hero.jpg` |
| External Link | Application | `{{basePath}}/path` | `{{basePath}}/media/photo.jpg` |
| Local File | Application | `{{basePath}}/path` | `{{basePath}}/images/logo.png` |

**All use the same template system!** ✅

## Benefits

✅ **Consistency**: All files use the same path format  
✅ **Portability**: Change base URL, all files update  
✅ **Environment Flexibility**: Works across dev/staging/production  
✅ **Simple Migration**: Move files without database changes  
✅ **Unified Logic**: Single code path for all file types  

## Environment Examples

### Development
```
Base URL: http://localhost:3000
Stored: {{basePath}}/images/hero.jpg
Rendered: http://localhost:3000/images/hero.jpg
File serves from: /public/images/hero.jpg
```

### Staging
```
Base URL: https://staging.happymountainnepal.com
Stored: {{basePath}}/images/hero.jpg
Rendered: https://staging.happymountainnepal.com/images/hero.jpg
File serves from: /public/images/hero.jpg
```

### Production
```
Base URL: https://happymountainnepal.com
Stored: {{basePath}}/images/hero.jpg
Rendered: https://happymountainnepal.com/images/hero.jpg
File serves from: /public/images/hero.jpg
```

## Path Normalization

The system ensures paths are properly formatted:

```typescript
// User can enter with or without leading slash
Input: "images/hero.jpg"
Normalized: "/images/hero.jpg"
Template: "{{basePath}}/images/hero.jpg"

// Or with leading slash
Input: "/images/hero.jpg"
Normalized: "/images/hero.jpg"
Template: "{{basePath}}/images/hero.jpg"
```

## Code Implementation

### AddLocalImageDialog.tsx
```typescript
// Normalize path
const normalizedPath = relativePath.startsWith('/') 
  ? relativePath 
  : `/${relativePath}`;

// Create template
const templatePath = `{{basePath}}${normalizedPath}`;

// Store
await logFileUpload({
  fileName,
  url: templatePath,
  pathType: 'relative',
  path: templatePath,
  uploadSource: 'Application',
  // ...
});
```

### SmartImage.tsx
```typescript
function replaceBasePath(path: string, baseUrl?: string): string {
  if (!path.includes('{{basePath}}')) return path;
  
  if (!baseUrl) {
    return path.replace('{{basePath}}', '');
  }
  
  const cleanBaseUrl = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
  return path.replace('{{basePath}}', cleanBaseUrl);
}
```

## File Organization

### Recommended Structure
```
/public
  /images
    /backgrounds
      hero.jpg
    /logos
      logo.png
  /assets
    /icons
      star.svg
  /media
    /videos
      intro.mp4
```

### Corresponding Paths
```
{{basePath}}/images/backgrounds/hero.jpg
{{basePath}}/images/logos/logo.png
{{basePath}}/assets/icons/star.svg
{{basePath}}/media/videos/intro.mp4
```

## Migration from Absolute Paths

If you have existing local files with absolute paths:

### Before
```
pathType: 'absolute'
path: '/images/hero.jpg'
url: '/images/hero.jpg'
```

### After
```
pathType: 'relative'
path: '{{basePath}}/images/hero.jpg'
url: '{{basePath}}/images/hero.jpg'
```

### Migration Script (Conceptual)
```typescript
// For each local file upload
if (pathType === 'absolute' && uploadSource === 'Application') {
  // Convert to template format
  const templatePath = `{{basePath}}${path}`;
  
  // Update database
  await updateDoc(docRef, {
    pathType: 'relative',
    path: templatePath,
    url: templatePath
  });
}
```

## Verification

To verify local files are using the correct format:

1. **Add a local image**:
   - Path: `/images/test.jpg`
   
2. **Check database**:
   - Should see: `{{basePath}}/images/test.jpg`
   - pathType: `relative`
   - uploadSource: `Application`

3. **View in media picker**:
   - Should render: `https://your-domain.com/images/test.jpg`

4. **Change base URL**:
   - Update in profile
   - Image should render with new base URL

## Summary

✅ **Server files (local /public)** use: `{{basePath}} + relativePath`  
✅ **CDN uploads** use: `{{basePath}} + relativePath`  
✅ **External links** use: `{{basePath}} + relativePath`  

**All file types use the same portable template system!**
