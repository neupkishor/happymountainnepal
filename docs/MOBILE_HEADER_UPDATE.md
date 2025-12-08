# Mobile Header Simplification

## Changes
The public website header on mobile devices has been simplified according to user request.

### Mobile View (`md:hidden`)
*   **Left**: Logo + "Happy Mountain Nepal" text. (Previously text was hidden on small screens, now visible).
*   **Right**: Outlined Menu (Burger) button.
*   **Hidden**: Search icon, User profile icon, Login/Signup buttons are removed from the mobile header bar to reduce clutter.

### Desktop View (`md:flex`)
*   **Left**: Logo + Text.
*   **Center**: Full Navigation Menu.
*   **Right**: User Profile / Login / Signup buttons.

## Implementation
*   Updated `src/components/layout/HeaderV3.tsx`.
*   Used `justify-between` flex container to cleanly separate Left and Right zones.
*   Grouped Desktop interactions into a `hidden md:flex` block.
*   Moved Mobile Menu Trigger to the Right block and applied `md:hidden`.
