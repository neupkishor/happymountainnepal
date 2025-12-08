# Base URL Configuration for Relative Paths

## Overview
The system now uses a **Base URL** setting from the site profile to construct full URLs for relative image paths. This provides flexibility in how images are served while maintaining clean path references in the database.

## How It Works

### 1. Base URL Configuration
- Go to `/manage/profile`
- Find the "Base URL" field in the "Company Information" section
- Enter your site's base URL (e.g., `https://happymountainnepal.com`)
- Save the profile

### 2. Image Path Resolution

**For Absolute Paths** (`pathType: 'absolute'`):
- Uses the `url` field directly
- Example: `https://cdn.example.com/image.jpg`
- No baseUrl needed

**For Relative Paths** (`pathType: 'relative'`):
- Constructs full URL as: `baseUrl + path`
- Example:
  - baseUrl: `https://happymountainnepal.com`
  - path: `/images/hero.jpg`
  - Result: `https://happymountainnepal.com/images/hero.jpg`

### 3. SmartImage Component

The `SmartImage` component automatically handles URL construction:

```tsx
<SmartImage
  src={file.url}
  pathType={file.pathType}
  path={file.path}
  alt="Description"
  fill
/>
```

**Behavior**:
- If `pathType === 'relative'`: Uses `baseUrl + path`
- If `pathType === 'absolute'`: Uses `src` directly
- If no baseUrl is set: Falls back to just `path` (relative to current domain)

## Benefits

1. **Flexibility**: Change your domain without updating all image references
2. **Portability**: Move images between CDN and local storage easily
3. **Clean Database**: Store simple paths instead of full URLs
4. **Environment Support**: Use different baseUrls for dev/staging/production
5. **SEO**: Serve images from your own domain for better SEO

## Use Cases

### Local Development
```
baseUrl: http://localhost:3000
path: /images/hero.jpg
Result: http://localhost:3000/images/hero.jpg
```

### Production
```
baseUrl: https://happymountainnepal.com
path: /images/hero.jpg
Result: https://happymountainnepal.com/images/hero.jpg
```

### CDN (Absolute)
```
pathType: absolute
url: https://cdn.happymountainnepal.com/uploads/hero.jpg
Result: https://cdn.happymountainnepal.com/uploads/hero.jpg
```

## Migration

Existing relative paths will work with the baseUrl once it's configured:
1. Set the baseUrl in `/manage/profile`
2. All relative images will automatically use the new baseUrl
3. No database changes needed

## Best Practices

1. **Always include protocol**: Use `https://` not just `example.com`
2. **No trailing slash**: Use `https://example.com` not `https://example.com/`
3. **Consistent paths**: Always start relative paths with `/`
4. **Test after changes**: Verify images load correctly after updating baseUrl

## Example Configuration

```typescript
// Site Profile
{
  baseUrl: "https://happymountainnepal.com",
  // ... other fields
}

// File Upload (Relative)
{
  fileName: "hero-image.jpg",
  pathType: "relative",
  path: "/images/hero.jpg",
  url: "/images/hero.jpg",
  uploadSource: "Application"
}

// Rendered URL
// https://happymountainnepal.com/images/hero.jpg
```

## Fallback Behavior

If `baseUrl` is not set:
- Relative paths render as-is (e.g., `/images/hero.jpg`)
- Browser resolves relative to current domain
- Works for same-domain deployments
