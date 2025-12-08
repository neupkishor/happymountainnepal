# Upload System Enhancement - Relative & Absolute Paths

## Overview
The upload system now supports both **absolute** (external URLs) and **relative** (local files in `/public`) paths. This allows you to:
- Upload files to NeupCDN (external)
- Reference local files stored in your `/public` directory
- Mix both types in your media library

## New FileUpload Fields

### `pathType`: 'absolute' | 'relative'
- **absolute**: External URL (e.g., from NeupCDN)
- **relative**: Local file path relative to `/public` directory

### `path`: string
- If `pathType` is **absolute**: Full URL to the file
- If `pathType` is **relative**: Path relative to `/public` (e.g., `/images/hero.jpg` for `public/images/hero.jpg`)

### `uploadSource`: 'NeupCDN' | 'Application'
- **NeupCDN**: File uploaded to external CDN
- **Application**: File stored locally or external link added manually

## Usage

### Adding Local Images

1. **Via Uploads Page** (`/manage/uploads`):
   - Click "Add Local Image" button
   - Enter file name (e.g., "hero-image.jpg")
   - Enter relative path (e.g., "/images/hero.jpg")
   - Select category
   - Click "Add to Library"

2. **Via Media Library Dialog**:
   - Open any media picker
   - Click "Show More" to open media library
   - Click "Add Local Image" button
   - Follow same steps as above

### Using Images in Components

The system automatically handles path types:

```tsx
// Using SmartImage component (recommended)
import { SmartImage } from '@/components/ui/smart-image';

<SmartImage
  src={file.url}
  pathType={file.pathType}
  path={file.path}
  alt="Description"
  fill
  className="object-cover"
/>
```

### Manual Image Rendering

```tsx
// For relative paths, use the path field
const imageSrc = file.pathType === 'relative' ? file.path : file.url;

<Image src={imageSrc} alt="..." />
```

## File Information Display

The uploads page now shows:
- **File Name**: Name of the file
- **Uploader**: User who uploaded/added the file
- **File Size**: Size in KB (for uploaded files)
- **Upload Source**: NeupCDN or Application
- **Path Type**: Local (relative) or External (absolute)
- **Uploaded On**: Time since upload
- **Path**: For relative files, shows the path in `/public`

## Benefits

1. **Performance**: Local images load faster (no external requests)
2. **Reliability**: No dependency on external CDN for critical assets
3. **Flexibility**: Mix local and CDN images as needed
4. **Organization**: All images accessible through unified media library
5. **Version Control**: Local images can be committed to git

## Migration Notes

Existing uploads will need to have the new fields added:
- `pathType`: Should be set to 'absolute' for existing CDN uploads
- `path`: Should be set to the same value as `url` for existing uploads
- `uploadSource`: Should be set to 'NeupCDN' for existing uploads

New uploads automatically include these fields.
