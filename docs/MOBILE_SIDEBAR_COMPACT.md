# Mobile Sidebar Compact Mode

## Overview
To improve usability on mobile devices (where screen real estate is limited), the sidebar now automatically switches to a "Compact Mode".

## Improvements
*   **Reduced Padding**: 
    *   Header padding decreased (`p-4` -> `p-2`).
    *   Footer padding decreased (`p-2` -> `p-1`).
    *   Group padding decreased (`px-2` -> `px-1`).
*   **Compact Links**:
    *   Menu items are slightly shorter (`h-7` instead of `h-8`).
    *   Icon/Text gap is tighter (`gap-1.5` instead of `gap-2`).

## Implementation
This is handled dynamically in `src/components/ui/sidebar.tsx` using the `isMobile` context hook. No global CSS changes were required, ensuring desktop remains spacious and comfortable.
