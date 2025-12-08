# Dashboard Layout Update: Compact Mode

## Changes
The dashboard layout (`src/app/manage/layout.tsx`) has been updated to provide a more compact and space-efficient viewing experience, particularly on mobile devices.

## Details

### Main Content Body
*   **Mobile Padding**: Reduced from `1rem` (`p-4`) to `0.5rem` (`p-2`).
*   **Desktop Padding**: Reduced from `2rem` (`p-8`) to `1.5rem` (`p-6`).

### Sidebar Layout
*   **Sidebar Padding**: explicit `p-2` on mobile, `p-4` on desktop for the `SidebarContent` wrapper. This matches the internal component updates made in `ui/sidebar.tsx`.

## Rationale
Matched the requested "Compact Mode" logic introduced in the sidebar components. This ensures the entire application feels consistent and maximizes screen real estate.
