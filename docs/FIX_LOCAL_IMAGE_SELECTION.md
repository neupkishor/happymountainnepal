# Fix Summary: Local Image Selection in MediaPicker

## Issue
Local images (with `pathType: 'relative'`) were not selectable from the MediaPicker/MediaLibraryDialog because the selection logic was only using `file.url` instead of the appropriate path based on `pathType`.

## Changes Made

### 1. MediaLibraryDialog.tsx
- Added `getFilePath()` helper function to return the correct path based on `pathType`
  - Returns `file.path` for relative paths
  - Returns `file.url` for absolute paths
- Updated `handleImageClick()` to accept and use `filePath` instead of `url`
- Updated the file grid to:
  - Calculate `filePath` using `getFilePath(file)`
  - Use `filePath` for onClick handler
  - Use `filePath` for selection checking (border highlight)
  - Use `filePath` for selected state (checkmark overlay)

### 2. MediaPicker.tsx
- Added `getFilePath()` helper function (same logic as MediaLibraryDialog)
- Added `selectedFile` lookup to find the file matching the current `previewUrl`
- Updated preview image to use:
  - `selectedFile?.url` for the src (fallback to previewUrl)
  - `selectedFile?.pathType` for proper rendering
  - `selectedFile?.path` for relative path handling
- Updated recent images grid to:
  - Calculate `filePath` using `getFilePath(file)`
  - Use `filePath` for onClick handler
  - Use `filePath` for selection checking (border highlight)
  - Use `filePath` for selected state (checkmark overlay)

## How It Works Now

1. **For Absolute Paths (CDN images)**:
   - `getFilePath()` returns `file.url`
   - Selection stores the full URL
   - SmartImage renders using the URL

2. **For Relative Paths (local images)**:
   - `getFilePath()` returns `file.path` (e.g., "/images/hero.jpg")
   - Selection stores the relative path
   - SmartImage renders using the relative path from `/public`

3. **Form Value**:
   - The form field receives the correct path (relative or absolute)
   - When saving, the database stores the appropriate path
   - When loading, the preview shows the correct image

## Testing
To test local image selection:
1. Go to `/manage/uploads`
2. Click "Add Local Image"
3. Add a local image (e.g., fileName: "test.jpg", path: "/images/test.jpg")
4. Go to `/manage/profile`
5. Click on the Hero Background Image picker
6. Click "Show More" to open media library
7. The local image should now be selectable
8. Clicking it should select it and show it in the preview
9. Saving the form should store the relative path

## Result
✅ Both local (relative) and CDN (absolute) images are now fully selectable
✅ Preview works correctly for both types
✅ Selection state (borders, checkmarks) works correctly
✅ Form values are saved with the correct path type
