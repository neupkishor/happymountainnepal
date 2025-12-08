# Blog Styling Fix

## Issue
The blog posts and the rich text editor were displaying headings (H1, H2, H3) at the same size as body text, and paragraphs lacked proper spacing. This was happening because:
1. The `@tailwindcss/typography` plugin was missing from the project (not in `package.json` or `tailwind.config.ts`), rendering the `prose` classes ineffective.
2. Tailwind's global reset (preflight) removes default browser styling for headings, making them look like plain text.

## Solution

Instead of requiring a new package installation (`npm install -D @tailwindcss/typography`), we implemented a robust custom CSS solution that works immediately without internet access or build changes.

### 1. Global CSS Updates (`src/app/globals.css`)

Defined two sets of styles:

**A. `.formatted-content`**
A utility class for displaying rich text content on the frontend (Blog Page).
- H1: 4xl (mobile) / 5xl (desktop), bold, headline font
- H2: 3xl/4xl
- H3: 2xl/3xl
- Paragraphs: Large text, relaxed line height, bottom margin
- Lists: Disc/Decimal style, indented
- Images: Rounded, shadowed

**B. `.ql-editor` overrides**
Specific styles for the ReactQuill editor to ensure the "What You See Is What You Get" experience is accurate.
- Overrides Tailwind resets using `!important` to force proper heading sizes and spacing inside the editor area.

### 2. Blog Post Component (`src/app/blog/[slug]/blog-post-client.tsx`)

Replaced the ineffective plugin classes:
```tsx
// Before
className="prose prose-lg max-w-none ..."

// After
className="formatted-content max-w-none ..."
```

## Maintenance

If you decide to install `@tailwindcss/typography` in the future:
1. Run `npm install -D @tailwindcss/typography`
2. Add `require('@tailwindcss/typography')` to `tailwind.config.ts` plugins.
3. You can revert `blog-post-client.tsx` to use `prose` classes, OR just keep using `formatted-content` as it provides more granular control without the plugin dependency.

## Files Modified
- `src/app/globals.css`
- `src/app/blog/[slug]/blog-post-client.tsx`
