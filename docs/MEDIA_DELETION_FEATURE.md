# Media Deletion Feature

## Overview
Users can now delete uploaded media files from the persistent storage (Firestore). This functionality is available in both the main **Uploads Library** page and the **Media Picker** dialog.

## Implementation

### 1. Database Function (`src/lib/db.ts`)
Added `deleteFileUpload(id: string)`:
- Deletes the document from the `uploads` collection in Firestore.
- Does NOT delete the physical file from storage (CDN or local), as we currently don't have direct management access to the CDN file system via this app logic (assumed managed externally or not supported yet). For local files, they remain in `/public` but the reference is removed.

```typescript
export async function deleteFileUpload(id: string): Promise<void> {
    // ... deleteDoc(doc(firestore, 'uploads', id)) ...
}
```

### 2. Uploads Library Page (`src/app/manage/uploads/page.tsx`)
- Added a "Delete" button to each file row.
- Prompts for confirmation before deletion.
- Optimistically updates the UI (removes item from list) upon success.
- Shows toast notifications for success/error.

### 3. Media Picker Dialog (`src/components/manage/MediaLibraryDialog.tsx`)
- Added a "Delete" (Trash) icon button to each image card in the grid.
- Button appears on hover.
- Prompts for confirmation.
- Prevents event propagation to avoid selecting the image while deleting it.
- Updates the local state to remove the deleted item from view.

## Usage

### Deleting from Uploads Page
1. Navigate to `/manage/uploads`.
2. Find the file you want to remove.
3. Click the "Delete" button.
4. Confirm the action.

### Deleting from Media Picker
1. Open any media picker (e.g., in Profile form).
2. Hover over an image in the gallery.
3. Click the red Trash icon in the top right corner.
4. Confirm the action.

## Important Notes

- **Irreversible**: Deletion cannot be undone (database record is removed).
- **References**: Deleting a file does NOT remove references to it in other documents (e.g., if it's used as a hero image). Those links will break or need to be updated manually.
- **Physical Files**: Currently only removes the database record. Physical files on CDN or local server remain.
