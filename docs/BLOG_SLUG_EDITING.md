# Blog Post Slug Editing

## Overview
This feature allows administrators to manually edit the URL slug for blog posts. Previously, slugs were automatically generated from the title and could not be changed. Now, slugs can be customized for better SEO and URL management.

## Features
- **Manual Slug Editing**: A dedicated "Slug (URL)" field in the blog post editor.
- **Auto-Generation**: A "fresh" button to generate a slug from the current title.
- **Validation**:
  - Format: Lowercase letters, numbers, and hyphens only (e.g., `my-blog-post`).
  - Uniqueness: Checks against existing blog posts to prevent duplicate URLs.
- **Safety**: Prevents saving if the slug is already taken (excluding the current post being edited).

## Implementation Details

### Database (`src/lib/db.ts`)
1. **`checkBlogSlugAvailability(slug, excludePostId)`**:
   - Queries the `blogPosts` collection.
   - Returns `true` if the slug is available (or belongs to the current post).
   - Returns `false` if another post already uses the slug.

2. **`updateBlogPost`**:
   - Removed the automatic Title -> Slug logic.
   - Now accepts and saves the `slug` passed from the form.

### Form (`src/components/manage/forms/BlogPostForm.tsx`)
1. **Schema Validation**:
   - Uses RegEx `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` to enforce URL-safe format.
2. **Submission Logic**:
   - Calls `checkBlogSlugAvailability` before saving.
   - Sets a manual form error "This slug is already taken" if the check fails.

## Usage
1. Open a blog post to edit.
2. Change the **Slug** field.
3. Click "Save Post".
4. If valid and available, the post is updated. If the slug is taken, an error message appears.
