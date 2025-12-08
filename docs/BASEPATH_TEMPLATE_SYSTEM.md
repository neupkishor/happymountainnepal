# Template Variable System: {{basePath}}

## Overview
The system now uses a `{{basePath}}` template variable in relative image paths. This template is automatically replaced with the actual base URL when images are used, making paths completely portable across different environments and domains.

## How It Works

### Storage
When adding a local image, the path is stored with the `{{basePath}}` template:

```
User enters: /images/hero.jpg
Stored in database: {{basePath}}/images/hero.jpg
```

### Runtime Replacement
When the image is used, the template is replaced with the actual base URL:

```
Base URL: https://happymountainnepal.com
Stored path: {{basePath}}/images/hero.jpg
Rendered URL: https://happymountainnepal.com/images/hero.jpg
```

## Benefits

✅ **Complete Portability**: Change domains without updating any image references  
✅ **Environment Flexibility**: Use different base URLs for dev/staging/production  
✅ **Clean Migration**: Move between servers without database changes  
✅ **Single Source of Truth**: Base URL is configured once in site profile  
✅ **Automatic Updates**: Change base URL and all images update instantly  

## Implementation

### 1. Adding Local Images

When you add a local image via `/manage/uploads`:

```typescript
// User input
relativePath: "/images/hero.jpg"

// Stored in database
{
  fileName: "hero.jpg",
  pathType: "relative",
  path: "{{basePath}}/images/hero.jpg",
  url: "{{basePath}}/images/hero.jpg",
  uploadSource: "Application"
}
```

### 2. Template Replacement

The `replaceBasePath()` utility function handles replacement:

```typescript
function replaceBasePath(path: string, baseUrl?: string): string {
  if (!path.includes('{{basePath}}')) {
    return path; // No template, return as-is
  }
  
  if (!baseUrl) {
    return path.replace('{{basePath}}', ''); // Remove template if no baseUrl
  }
  
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return path.replace('{{basePath}}', cleanBaseUrl);
}
```

### 3. Usage in Components

**SmartImage Component**:
```tsx
<SmartImage
  src={file.url}
  pathType="relative"
  path="{{basePath}}/images/hero.jpg"
  alt="Hero"
/>
// Renders with: https://happymountainnepal.com/images/hero.jpg
```

**Media Selector**:
```tsx
// When selecting an image
const fullUrl = getSelectablePath(file, baseUrl);
// Returns: https://happymountainnepal.com/images/hero.jpg
// Form receives the full URL
```

## Examples

### Example 1: Development Environment
```
Base URL: http://localhost:3000
Stored: {{basePath}}/images/logo.png
Rendered: http://localhost:3000/images/logo.png
```

### Example 2: Staging Environment
```
Base URL: https://staging.happymountainnepal.com
Stored: {{basePath}}/images/logo.png
Rendered: https://staging.happymountainnepal.com/images/logo.png
```

### Example 3: Production Environment
```
Base URL: https://happymountainnepal.com
Stored: {{basePath}}/images/logo.png
Rendered: https://happymountainnepal.com/images/logo.png
```

### Example 4: No Base URL
```
Base URL: (empty)
Stored: {{basePath}}/images/logo.png
Rendered: /images/logo.png
```

## Path Format

### Correct Format
```
{{basePath}}/images/hero.jpg
{{basePath}}/assets/icons/star.svg
{{basePath}}/media/videos/intro.mp4
```

### What Gets Stored
When you enter `/images/hero.jpg`, the system automatically creates:
```
{{basePath}}/images/hero.jpg
```

## Migration Scenarios

### Scenario 1: Moving to New Domain
```
Old: https://old-domain.com
New: https://new-domain.com

Action: Update base URL in /manage/profile
Result: All images automatically use new domain
```

### Scenario 2: Moving to CDN
```
Old: https://happymountainnepal.com
New: https://cdn.happymountainnepal.com

Action: Update base URL in /manage/profile
Result: All images automatically served from CDN
```

### Scenario 3: Local Development
```
Production: https://happymountainnepal.com
Local: http://localhost:3000

Action: Set base URL to localhost in local profile
Result: All images load from local server
```

## Edge Cases

### Template in Absolute URLs
```
pathType: 'absolute'
url: 'https://cdn.example.com/image.jpg'
Result: Template replacement is skipped, URL used as-is
```

### Multiple Templates
```
path: '{{basePath}}/{{folder}}/image.jpg'
Result: Only {{basePath}} is replaced
Note: Only {{basePath}} is supported
```

### No Base URL Configured
```
path: '{{basePath}}/images/hero.jpg'
baseUrl: (empty)
Result: '/images/hero.jpg' (template removed)
```

## Best Practices

1. **Always Use Template**: Let the system add `{{basePath}}` automatically
2. **Configure Base URL**: Set it in `/manage/profile` for proper rendering
3. **Consistent Paths**: Use forward slashes and start with `/`
4. **Test Environments**: Verify images load in all environments
5. **Document Changes**: Note when changing base URL

## Technical Details

### Files Modified
- `src/components/manage/AddLocalImageDialog.tsx` - Adds template to paths
- `src/lib/url-utils.ts` - Template replacement logic
- `src/components/ui/smart-image.tsx` - Renders with replaced template
- `src/components/manage/MediaPicker.tsx` - Uses template replacement
- `src/components/manage/MediaLibraryDialog.tsx` - Uses template replacement

### Template Replacement Flow
```
1. Image added → Path stored with {{basePath}}
2. Image selected → Template replaced with baseUrl
3. Form receives → Full absolute URL
4. Image rendered → Full absolute URL
5. Database stores → Original template preserved
```

## Troubleshooting

### Images Not Loading
- Check base URL is configured in `/manage/profile`
- Verify base URL includes protocol (https://)
- Ensure no trailing slash in base URL

### Wrong Domain
- Verify correct base URL for environment
- Check profile settings were saved
- Clear session storage cache

### Template Visible in URL
- Indicates baseUrl not configured
- Set base URL in site profile
- Refresh page after setting
