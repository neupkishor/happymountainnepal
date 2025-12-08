# Media Library Pagination

## Overview
The Media Library Popup (`MediaLibraryDialog`) now utilizes pagination to efficiently manage large numbers of uploads.

## Functionality
*   **Initial Load**: Loads the first **16** images by default (limit 16).
*   **Load More**: A "Show More" button appears at the bottom if more images are available. Clicking it loads the next **8** images without refreshing the list.
*   **Filtering**: Clicking "Show More" respects the currently selected category filter.

## Implementation Details
*   Uses `lastDocId` to track the Firestore pagination cursor.
*   Accumulates results in the `uploads` state array.
*   Integrates seamlessly with the existing `getFileUploads` backend function in `src/lib/db.ts`.

## UI Changes
*   Added a "Show More" button below the image grid inside the scrollable area.
*   The button displays a loading spinner while fetching the next batch.
