# Component Management System

## Overview
The component management system allows you to dynamically manage header and footer navigation links through an admin interface. All changes are saved to `navigation-components.json` and automatically reflected on the website.

## Pages Created

### 1. `/manage/components`
Main dashboard for component management with cards for:
- Header Navigation
- Footer Navigation

### 2. `/manage/components/header`
Visual editor for managing header navigation with:
- Multi-level navigation support (up to 3 levels)
- Drag indicators for future drag-and-drop functionality
- Expand/collapse for nested items
- Real-time editing of titles, URLs, and descriptions
- Preview mode to see JSON structure
- Add/delete links at any level

### 3. `/manage/components/footer`
Editor for managing footer navigation with:
- Section-based organization
- Multiple footer sections support
- Links within each section
- Title, URL, and description for each link
- Preview mode

## Data Structure

### File Location
`navigation-components.json` (project root)

### Structure
```json
{
  "header": {
    "links": [
      {
        "title": "Activities",
        "children": [
          {
            "title": "Trekking",
            "href": "/tours?type=trek",
            "description": "Journey through stunning mountain trails."
          }
        ]
      }
    ]
  },
  "footer": {
    "links": [
      {
        "title": "Quick Links",
        "links": [
          {
            "title": "About Us",
            "href": "/about",
            "description": "Learn more about our company"
          }
        ]
      }
    ]
  }
}
```

## Navigation Levels

### Header Navigation
- **Level 1**: Top navigation items (shown in header bar)
  - Can have children or be a direct link
  - Example: "Activities", "Destinations", "About"

- **Level 2**: Dropdown items (left column in mega menu)
  - Can have children (Level 3) or be a direct link
  - Requires: title, optional: href, description
  - Example: "Company", "Community", "Legal"

- **Level 3**: Sub-items (right column in mega menu)
  - Must have href (final destination)
  - Requires: title, href, optional: description
  - Example: "About Us", "Our Team", "Reviews"

### Footer Navigation
- **Sections**: Top-level groupings
  - Example: "Quick Links", "Company", "Support"

- **Links**: Items within each section
  - Requires: title, href
  - Optional: description

## API Endpoints

### GET `/api/navigation-components`
Returns the current navigation data from `navigation-components.json`

**Response:**
```json
{
  "header": { "links": [...] },
  "footer": { "links": [...] }
}
```

### POST `/api/navigation-components`
Saves navigation data to `navigation-components.json`

**Request Body:**
```json
{
  "header": { "links": [...] },
  "footer": { "links": [...] }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Navigation data saved successfully"
}
```

## Hooks

### `useNavigationData()`
Fetches complete navigation data (header + footer)

```tsx
const { data, loading, error } = useNavigationData();
```

### `useHeaderLinks()`
Fetches only header navigation links

```tsx
const { links, loading, error } = useHeaderLinks();
```

### `useFooterLinks()`
Fetches only footer navigation links

```tsx
const { links, loading, error } = useFooterLinks();
```

## Integration

### Header Component
The `HeaderV3` component automatically loads navigation data from the API:

```tsx
import { useHeaderLinks } from '@/hooks/use-navigation-data';

export function HeaderV3() {
  const { links: apiLinks, loading } = useHeaderLinks();
  const navLinks = apiLinks.length > 0 ? apiLinks : defaultNavLinks;
  
  // Component uses navLinks for rendering
}
```

### Fallback Behavior
If the API fails or returns empty data, the header falls back to hardcoded `defaultNavLinks` to ensure the site remains functional.

## Features

### Header Editor
- ✅ Visual hierarchy with indentation
- ✅ Level indicators (Level 1, 2, 3)
- ✅ Child count badges
- ✅ Expand/collapse nested items
- ✅ Add child links to any item (up to Level 3)
- ✅ Delete any link
- ✅ Edit title, URL, and description inline
- ✅ Preview JSON structure
- ✅ Save to file

### Footer Editor
- ✅ Section-based organization
- ✅ Add/delete sections
- ✅ Add/delete links within sections
- ✅ Edit section titles
- ✅ Edit link titles, URLs, and descriptions
- ✅ Preview JSON structure
- ✅ Save to file

## Usage Guide

### Adding a New Header Link

1. Go to `/manage/components/header`
2. Click "Add Level 1 Link" for top-level items
3. Or click "Add Child" on an existing item to add nested items
4. Fill in:
   - **Title**: Display name
   - **URL**: Link destination (optional for parent items)
   - **Description**: Brief description (shown in dropdown)
5. Click "Save Changes"

### Organizing Footer Links

1. Go to `/manage/components/footer`
2. Click "Add Section" to create a new footer section
3. Name the section (e.g., "Quick Links", "Support")
4. Click "Add Link" within the section
5. Fill in link details
6. Click "Save Changes"

### Best Practices

**Header:**
- Keep Level 1 items to 5-7 for optimal UX
- Use descriptive titles (short but clear)
- Add descriptions for Level 2 and 3 items
- Organize related items under the same Level 1 parent
- Use relative URLs for internal pages (`/about`)
- Use absolute URLs for external links (`https://example.com`)

**Footer:**
- Group related links into sections
- Keep section titles short (1-2 words)
- Limit to 3-5 sections for clean layout
- Order sections by importance (left to right)

## Troubleshooting

### Changes Not Appearing
1. Check if save was successful (green toast notification)
2. Refresh the page to reload navigation data
3. Check browser console for errors
4. Verify `navigation-components.json` exists in project root

### API Errors
- Ensure the API route `/api/navigation-components` is accessible
- Check file permissions on `navigation-components.json`
- Verify the file contains valid JSON

### Fallback Data
If you see default navigation instead of your custom data:
- Check if `navigation-components.json` exists
- Verify the file has valid JSON structure
- Check browser console for fetch errors

## Files Modified/Created

### Pages
- ✨ `src/app/manage/components/page.tsx` - Main dashboard
- ✨ `src/app/manage/components/header/page.tsx` - Header editor
- ✨ `src/app/manage/components/footer/page.tsx` - Footer editor

### API
- ✨ `src/app/api/navigation-components/route.ts` - Save/load endpoint

### Hooks
- ✨ `src/hooks/use-navigation-data.ts` - Client-side data fetching

### Utilities
- ✨ `src/lib/navigation.ts` - Server-side data loading

### Data
- ✨ `navigation-components.json` - Navigation data storage

### Components
- ✏️ `src/components/layout/HeaderV3.tsx` - Updated to use dynamic data
- ✏️ `src/app/manage/layout.tsx` - Added Components menu item

## Future Enhancements
- [ ] Drag-and-drop reordering
- [ ] Bulk import/export
- [ ] Navigation preview before save
- [ ] Undo/redo functionality
- [ ] Version history
- [ ] Multi-language support
- [ ] Icon picker for footer links
- [ ] Link validation
- [ ] Analytics integration (track popular links)
