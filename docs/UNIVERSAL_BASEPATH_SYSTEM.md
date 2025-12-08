# Universal {{basePath}} Template System

## Overview
ALL uploaded files now use the `{{basePath}}` template system, regardless of whether they're uploaded to CDN, added as external links, or stored locally. This makes the entire media library completely portable across different domains and environments.

## Implementation

### All Upload Types Use Template

#### 1. CDN Uploads (FileUploadInput)
```typescript
// Upload to: https://neupgroup.com/content/bridge/uploads/image.jpg
// Extract path: /content/bridge/uploads/image.jpg
// Store as: {{basePath}}/content/bridge/uploads/image.jpg
```

#### 2. External Links (addExternalMediaLink)
```typescript
// External URL: https://example.com/media/photo.jpg
// Extract path: /media/photo.jpg
// Store as: {{basePath}}/media/photo.jpg
```

#### 3. Local Images (AddLocalImageDialog)
```typescript
// User enters: /images/hero.jpg
// Store as: {{basePath}}/images/hero.jpg
```

## Benefits

✅ **Complete Portability**: Change base URL and ALL images update  
✅ **Environment Flexibility**: Same database works across dev/staging/prod  
✅ **Domain Migration**: Move domains without database changes  
✅ **CDN Switching**: Switch CDN providers by changing base URL  
✅ **Unified System**: All images use the same template mechanism  

## How It Works

### Storage Phase
All uploads extract the relative path and store with template:

```typescript
// Original URL
const fullUrl = "https://neupgroup.com/content/bridge/uploads/hero.jpg";

// Extract relative path
const url = new URL(fullUrl);
const relativePath = url.pathname; // "/content/bridge/uploads/hero.jpg"

// Create template
const templatePath = `{{basePath}}${relativePath}`;
// Result: "{{basePath}}/content/bridge/uploads/hero.jpg"

// Store in database
{
  pathType: 'relative',
  path: '{{basePath}}/content/bridge/uploads/hero.jpg',
  url: '{{basePath}}/content/bridge/uploads/hero.jpg'
}
```

### Usage Phase
When images are used, template is replaced with actual base URL:

```typescript
// From database
path: "{{basePath}}/content/bridge/uploads/hero.jpg"

// Base URL from profile
baseUrl: "https://neupgroup.com"

// Template replacement
result: "https://neupgroup.com/content/bridge/uploads/hero.jpg"
```

## Migration Scenarios

### Scenario 1: CDN Provider Change
```
Old CDN: https://old-cdn.com
New CDN: https://new-cdn.com

Action: Update base URL to https://new-cdn.com
Result: All images automatically point to new CDN
```

### Scenario 2: Domain Migration
```
Old: https://old-domain.com
New: https://new-domain.com

Action: Update base URL to https://new-domain.com
Result: All images work on new domain
```

### Scenario 3: Multi-Environment Deployment
```
Dev: http://localhost:3000
Staging: https://staging.example.com
Production: https://example.com

Each environment has its own base URL
Same database, different rendered URLs
```

### Scenario 4: Moving from CDN to Local
```
Old: https://cdn.example.com/uploads/image.jpg
Stored: {{basePath}}/uploads/image.jpg

New: Copy files to local /public/uploads/
Update base URL: https://example.com
Result: https://example.com/uploads/image.jpg
```

## Path Extraction Examples

### CDN Upload
```
Input: https://neupgroup.com/content/bridge/uploads/2024/image.jpg
Pathname: /content/bridge/uploads/2024/image.jpg
Stored: {{basePath}}/content/bridge/uploads/2024/image.jpg
```

### External Link
```
Input: https://example.com/media/photos/hero.jpg
Pathname: /media/photos/hero.jpg
Stored: {{basePath}}/media/photos/hero.jpg
```

### Local Image
```
Input: /images/logo.png
Stored: {{basePath}}/images/logo.png
```

## Database Structure

All uploads now have consistent structure:

```typescript
{
  id: "abc123",
  fileName: "hero.jpg",
  pathType: "relative", // All are now relative
  path: "{{basePath}}/uploads/hero.jpg",
  url: "{{basePath}}/uploads/hero.jpg",
  uploadSource: "NeupCDN" | "Application",
  fileSize: 102400,
  fileType: "image/jpeg",
  category: "background",
  uploadedAt: Timestamp,
  userId: "admin-user"
}
```

## Configuration

### Setting Base URL
1. Go to `/manage/profile`
2. Find "Base URL" field
3. Enter your domain (e.g., `https://neupgroup.com`)
4. Save

### For Different Environments
```
Development:
baseUrl: http://localhost:3000

Staging:
baseUrl: https://staging.happymountainnepal.com

Production:
baseUrl: https://happymountainnepal.com
```

## Edge Cases

### URL Parsing Failure
```typescript
try {
  const url = new URL(fullUrl);
  relativePath = url.pathname;
} catch (e) {
  // Fallback: use full URL as-is
  console.warn('Could not parse URL, using as-is');
  relativePath = fullUrl;
}
```

### No Base URL Configured
```
Stored: {{basePath}}/uploads/image.jpg
Base URL: (empty)
Rendered: /uploads/image.jpg
```

### Query Parameters
```
Input: https://example.com/image.jpg?v=123
Pathname: /image.jpg (query stripped)
Stored: {{basePath}}/image.jpg
```

## Files Modified

1. **FileUploadInput.tsx**:
   - Extracts pathname from CDN URL
   - Stores with `{{basePath}}` template
   - Changed `pathType` to 'relative'

2. **db.ts (addExternalMediaLink)**:
   - Extracts pathname from external URL
   - Stores with `{{basePath}}` template
   - Changed `pathType` to 'relative'

3. **AddLocalImageDialog.tsx**:
   - Already using `{{basePath}}` template
   - No changes needed

## Testing

### Test CDN Upload
1. Upload file via FileUploadInput
2. Check database: should see `{{basePath}}/content/bridge/uploads/...`
3. View in media picker: should render with full URL
4. Change base URL: image should update

### Test External Link
1. Add external media link
2. Check database: should see `{{basePath}}/path/to/file`
3. View in uploads: should render with full URL
4. Change base URL: link should update

### Test Local Image
1. Add local image
2. Check database: should see `{{basePath}}/images/...`
3. View in media picker: should render with full URL
4. Change base URL: image should update

## Backward Compatibility

### Existing Absolute Paths
Old uploads with `pathType: 'absolute'` will still work:
- `getFullUrl()` checks pathType
- Absolute paths returned as-is
- No template replacement for absolute paths

### Migration Strategy
To migrate existing uploads:
1. Query all uploads with `pathType: 'absolute'`
2. Extract pathname from URL
3. Update to `pathType: 'relative'` with template
4. Test thoroughly before production

## Best Practices

1. **Always Set Base URL**: Configure in site profile
2. **Use HTTPS**: Include protocol in base URL
3. **No Trailing Slash**: Use `https://example.com` not `https://example.com/`
4. **Test Environments**: Verify images in all environments
5. **Document Changes**: Note when changing base URL

## Troubleshooting

### Images Not Loading
- Verify base URL is set correctly
- Check base URL includes protocol (https://)
- Ensure no trailing slash in base URL
- Verify path extraction worked correctly

### Wrong Domain in URLs
- Check base URL in site profile
- Verify profile settings saved
- Clear session storage cache
- Refresh page

### Template Visible in Browser
- Indicates base URL not configured
- Set base URL in `/manage/profile`
- Save and refresh
