# Blog Image Insertion Bug Fixes

## Issues Identified

1. **Maximum Update Depth Exceeded (Infinite Loop)**
   - **Location**: `MediaLibraryDialog.tsx`
   - **Cause**: Two conflicting `useEffect` hooks both triggering on `isOpen` changes
   - **Symptoms**: React error about nested updates, app crashes

2. **Type Mismatch**
   - **Location**: Multiple components using `MediaLibraryDialog`
   - **Cause**: Interface expected `string[]` but components were passing/receiving `ImageWithCaption[]`
   - **Symptoms**: TypeScript errors, runtime type mismatches

3. **404 Errors for Images**
   - **Cause**: Related to the infinite loop causing components to crash before images could load

## Fixes Applied

### 1. MediaLibraryDialog.tsx
**Fixed infinite loop by consolidating useEffect hooks:**
- Merged two conflicting `useEffect` hooks (lines 82-94) into a single effect
- Removed redundant dependencies that were causing re-renders
- Now properly initializes only when dialog opens

**Updated interface to use ImageWithCaption[]:**
- Changed `onSelect` prop from `(urls: string[]) => void` to `(images: ImageWithCaption[]) => void`
- Added `defaultCategory` prop for better categorization
- Updated `handleInsertSelected` to convert selected URLs to `ImageWithCaption[]` objects with captions

### 2. MediaPicker.tsx
**Updated to handle ImageWithCaption[]:**
- Changed `handleSelectImage` parameter from `string[]` to `{ url: string; caption?: string }[]`
- Updated all calls to `handleSelectImage` to pass objects with `url` and `caption` properties
- Extracts URL from the first image object for form field value

### 3. BasicMediaForm.tsx
**Updated to handle ImageWithCaption[]:**
- Changed `handleSelectImages` parameter from `string[]` to `ImageWithCaption[]`
- Simplified logic to work directly with image objects instead of mapping URLs
- Preserves existing captions when available

### 4. RichTextEditor.tsx
**Already correctly implemented:**
- Was already using `ImageWithCaption[]` type
- No changes needed - the fix in `MediaLibraryDialog` resolved the type mismatch

## Testing Recommendations

1. Navigate to `/manage/blog` and create or edit a blog post
2. Click the image insertion button in the rich text editor
3. Verify the media library dialog opens without errors
4. Select an image and verify it inserts correctly
5. Check browser console for any remaining errors
6. Test image replacement and deletion features
7. Verify captions/alt text are preserved

## Technical Details

### Root Cause Analysis
The infinite loop occurred because:
1. First `useEffect` (line 82) ran when `isOpen` changed → called `fetchUploads`
2. Second `useEffect` (line 90) also ran when `isOpen` changed → called `fetchUploads` again
3. `fetchUploads` updated state → triggered re-renders
4. Dependencies like `defaultTags` in the first effect caused additional re-renders
5. This created a cycle that exceeded React's maximum update depth limit

### Solution
Consolidated into a single `useEffect` that:
- Only depends on `isOpen`
- Initializes all state in one go
- Prevents redundant `fetchUploads` calls
- Breaks the infinite loop cycle
