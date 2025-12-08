# Media Selector: Absolute URL Construction for Relative Paths

## Overview
The media selector (MediaPicker and MediaLibraryDialog) now automatically constructs full absolute URLs for relative images using the site's base URL. This means when you select a relative image, the form receives the complete URL instead of just the relative path.

## How It Works

### Before
When selecting a relative image:
- **Stored in database**: `pathType: 'relative'`, `path: '/images/hero.jpg'`
- **Selected value**: `/images/hero.jpg`
- **Saved to form**: `/images/hero.jpg`

### After
When selecting a relative image:
- **Stored in database**: `pathType: 'relative'`, `path: '/images/hero.jpg'`
- **Base URL**: `https://happymountainnepal.com` (from site profile)
- **Selected value**: `https://happymountainnepal.com/images/hero.jpg`
- **Saved to form**: `https://happymountainnepal.com/images/hero.jpg`

## Implementation

### URL Construction Utility
Created `src/lib/url-utils.ts` with helper functions:

```typescript
// Constructs full URL from file upload
getFullUrl(file: FileUpload, baseUrl?: string): string

// Gets the selectable path (full URL for relative, url for absolute)
getSelectablePath(file: FileUpload, baseUrl?: string): string
```

### Updated Components

1. **MediaLibraryDialog**:
   - Uses `useSiteProfile()` to get baseUrl
   - Calls `getSelectablePath(file, baseUrl)` for selection
   - Returns full URLs to parent component

2. **MediaPicker**:
   - Uses `useSiteProfile()` to get baseUrl
   - Calls `getSelectablePath(file, baseUrl)` for selection
   - Stores full URLs in form fields

3. **SmartImage**:
   - Still handles both absolute and relative paths
   - Constructs URLs for display purposes
   - Works seamlessly with both URL types

## Benefits

✅ **Consistency**: Forms always receive complete URLs  
✅ **Portability**: Images work even if moved to different domains  
✅ **Simplicity**: No need to handle relative paths in consuming components  
✅ **Flexibility**: Can still change baseUrl and images update automatically  
✅ **Backward Compatible**: Works with or without baseUrl configured  

## Example Flow

### 1. Setup Base URL
```
Go to /manage/profile
Set Base URL: https://happymountainnepal.com
Save
```

### 2. Add Local Image
```
Go to /manage/uploads
Click "Add Local Image"
Enter:
  - File Name: hero.jpg
  - Path: /images/hero.jpg
  - Category: background
Save
```

### 3. Select in Profile
```
Go to /manage/profile
Click Hero Background Image picker
Select the local image
```

### 4. Result
```
Database stores:
{
  pathType: 'relative',
  path: '/images/hero.jpg',
  url: '/images/hero.jpg'
}

Form receives:
heroImage: 'https://happymountainnepal.com/images/hero.jpg'

Saved to profile:
{
  heroImage: 'https://happymountainnepal.com/images/hero.jpg'
}
```

## Edge Cases

### No Base URL Set
If baseUrl is empty or not configured:
- Relative paths return as-is (e.g., `/images/hero.jpg`)
- Browser resolves relative to current domain
- Works for same-domain deployments

### Absolute Paths
For CDN or external images:
- `pathType: 'absolute'`
- Returns `url` directly
- baseUrl is ignored

### URL Normalization
The utility handles:
- Trailing slashes in baseUrl
- Leading slashes in paths
- Consistent URL construction

## Testing

1. **With Base URL**:
   ```
   baseUrl: https://example.com
   path: /images/test.jpg
   Result: https://example.com/images/test.jpg
   ```

2. **Without Base URL**:
   ```
   baseUrl: (empty)
   path: /images/test.jpg
   Result: /images/test.jpg
   ```

3. **Absolute Path**:
   ```
   pathType: absolute
   url: https://cdn.example.com/image.jpg
   Result: https://cdn.example.com/image.jpg
   ```

## Migration

Existing forms with relative paths will automatically get full URLs when:
1. Base URL is configured in site profile
2. User re-selects images from media picker
3. New selections automatically use full URLs

No database migration needed - the conversion happens at selection time.
