# fix: Blog Slug Field Visibility

## Issue
The user reported that the slug field was not visible on the blog edit page, even though the feature was implemented.

## Root Cause
There were duplicate `BlogPostForm` components in the project:
1. `src/components/manage/forms/BlogPostForm.tsx` (The one we updated with the Slug field)
2. `src/components/manage/BlogPostForm.tsx` (An outdated copy without the Slug field)

The Edit Blog page (`src/app/manage/blog/[id]/edit/page.tsx`) was importing the **old** component:
```tsx
import { BlogPostForm } from '@/components/manage/BlogPostForm'; // Old path
```

## Resolution
1. **Updated Import**: Changed the import path in the edit page to point to the correct, updated component:
   ```tsx
   import { BlogPostForm } from '@/components/manage/forms/BlogPostForm'; // Correct path
   ```
2. **Deleted Duplicate**: Removed the redundant `src/components/manage/BlogPostForm.tsx` file to prevent future confusion.

## Verification
- The Edit Blog page now loads the correct form.
- The "Slug (URL)" field should now be visible below the Title field.
