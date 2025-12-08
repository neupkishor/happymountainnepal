# View Button URL Construction

## Overview
The "View" button in the uploads page now properly constructs full URLs for local images by replacing the `{{basePath}}` template with the actual base URL from the site profile.

## Implementation

### Before
```tsx
<Link href={item.pathType === 'relative' ? item.path : item.url}>
  View
</Link>

// For relative images
// Clicked URL: {{basePath}}/images/hero.jpg ❌ (template not replaced)
```

### After
```tsx
<Link href={getFullUrl(item, profile?.baseUrl)}>
  View
</Link>

// For relative images
// Clicked URL: https://happymountainnepal.com/images/hero.jpg ✅
```

## Behavior

### Absolute URLs (CDN)
```
pathType: 'absolute'
url: 'https://cdn.example.com/image.jpg'
View button opens: https://cdn.example.com/image.jpg
```

### Relative URLs (Local) - With Base URL
```
pathType: 'relative'
path: '{{basePath}}/images/hero.jpg'
baseUrl: 'https://happymountainnepal.com'
View button opens: https://happymountainnepal.com/images/hero.jpg
```

### Relative URLs (Local) - Without Base URL
```
pathType: 'relative'
path: '{{basePath}}/images/hero.jpg'
baseUrl: (empty)
View button opens: /images/hero.jpg
```

## Usage

1. **Configure Base URL**:
   - Go to `/manage/profile`
   - Set Base URL: `https://happymountainnepal.com`
   - Save

2. **Add Local Image**:
   - Go to `/manage/uploads`
   - Click "Add Local Image"
   - Path: `/images/test.jpg`
   - Stored as: `{{basePath}}/images/test.jpg`

3. **View Image**:
   - In uploads list, click "View" button
   - Opens: `https://happymountainnepal.com/images/test.jpg`
   - Image loads from your configured domain

## Files Modified

- `src/app/manage/uploads/page.tsx`:
  - Added `useSiteProfile` import
  - Added `getFullUrl` import
  - Updated View button to use `getFullUrl(item, profile?.baseUrl)`

## Benefits

✅ **Correct URLs**: View button always opens the right URL  
✅ **Template Replacement**: {{basePath}} automatically replaced  
✅ **Environment Aware**: Uses configured base URL  
✅ **Consistent**: Same logic as image rendering  
✅ **Fallback**: Works even without base URL configured  

## Testing

1. Set base URL to `https://happymountainnepal.com`
2. Add local image with path `/images/test.jpg`
3. Click "View" button in uploads list
4. Should open: `https://happymountainnepal.com/images/test.jpg`
5. Image should load correctly
