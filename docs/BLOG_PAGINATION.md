# Blog Pagination Implementation

## Overview
The Blog Management page (`/manage/blog`) now supports pagination to handle large numbers of blog posts efficiently. It fetches **10 posts per page**.

## Implementation Details

### Database (`src/lib/db.ts`)

Two new functions were added:

1.  **`getBlogPosts({ limit, lastDocId })`**:
    *   Fetches a subset of blog posts ordered by date (descending).
    *   Uses Firestore's `startAfter` cursor for efficient paging (no expensive offsets).
    *   Returns `{ posts, hasMore }`.

2.  **`getBlogPostCount()`**:
    *   Returns the total number of blog posts to calculate total pages.

### Frontend (`src/app/manage/blog/page.tsx`)

*   **State Management**:
    *   `currentPage`: Derived from URL query parameter `?page=X`.
    *   `pageHistory`: An array storing the ID of the last document for each page. This is essential for Firestore's cursor-based pagination (we need to know *where* the previous page ended to start the next one).
*   **Navigation**:
    *   **Next**: Pushes the current page's last ID to history and updates URL to `page + 1`.
    *   **Previous**: Updates URL to `page - 1` (history is already preserved).
    *   **Direct Access**: If a user tries to jump to `page=5` without visiting previous pages, the system detects missing history and safely redirects to `page=1`.

## User Interface
*   **Previous / Next Buttons**: Standard navigation controls at the bottom of the table.
*   **Page Info**: "Page X of Y" indicator.
*   **Loading State**: Skeletons are shown while fetching new pages.

## Configuration
To change the number of items per page, edit the `ITEMS_PER_PAGE` constant in `src/app/manage/blog/page.tsx`.
