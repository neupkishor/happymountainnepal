# Public Blog Pagination

## Overview
The public blog view (`/blog`) now incorporates pagination, fetching exactly 12 published posts per page.

## Implementation

*   **Items Per Page**: 12
*   **Filter**: Only fetches posts with `status: 'published'`.
*   **URL Structure**: `https://happymountainnepal.com/blog?page=2`
*   **Navigation**:
    *   **Previous / Next** buttons at the bottom.
    *   Automatically scrolls to top when navigating.
*   **State Handling**:
    *   Uses Client-Side state (`pageHistory`) to track cursors for efficient Firestore pagination.
    *   If a user deep-links to `?page=3` without visiting previous pages (missing cursor history), they are safely redirected to Page 1. This ensures data integrity as Firestore standard pagination requires knowing the last document of the previous page.

## Code Path
*   `src/app/blog/page.tsx`: Main UI and logic.
*   `src/lib/db.ts`: Data fetching functions `getBlogPosts` and `getBlogPostCount`.
