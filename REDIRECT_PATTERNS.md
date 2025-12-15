# Advanced Pattern Matching for Redirects

## Overview

The redirect system now supports **advanced pattern matching** using the `{{variable}}` syntax. This allows you to create dynamic redirects that work for multiple URLs with a single rule.

## Features

✅ **Multiple Variables**: Support for unlimited variables in a single pattern  
✅ **Exact Matching**: Backward compatible with exact path matching  
✅ **Error Handling**: Gracefully handles invalid patterns without crashing  
✅ **Type Safe**: Full TypeScript support with proper types  

## Syntax

Use double curly braces `{{variableName}}` to define dynamic segments in your redirect patterns.

### Basic Examples

#### Single Variable
```
Source:      /tours/{{slug}}
Destination: /trips/{{slug}}

Matches:
  /tours/langtang-trek        → /trips/langtang-trek
  /tours/everest-base-camp    → /trips/everest-base-camp
  /tours/annapurna-circuit    → /trips/annapurna-circuit
```

#### Variable in Middle of Path
```
Source:      /name/{{name}}/hello
Destination: /greet/{{name}}/world

Matches:
  /name/kishor/hello  → /greet/kishor/world
  /name/john/hello    → /greet/john/world
```

#### Multiple Variables
```
Source:      /blog/{{year}}/{{month}}/{{slug}}
Destination: /articles/{{year}}/{{month}}/{{slug}}

Matches:
  /blog/2025/12/my-post        → /articles/2025/12/my-post
  /blog/2024/01/another-post   → /articles/2024/01/another-post
```

### Advanced Examples

#### Redirecting to External URLs
```
Source:      /old-docs/{{page}}
Destination: https://docs.example.com/{{page}}

Matches:
  /old-docs/getting-started  → https://docs.example.com/getting-started
  /old-docs/api-reference    → https://docs.example.com/api-reference
```

#### Complex Patterns
```
Source:      /products/{{category}}/{{subcategory}}/{{id}}
Destination: /shop/{{category}}/{{id}}

Matches:
  /products/electronics/phones/123  → /shop/electronics/123
  /products/clothing/shirts/456     → /shop/clothing/456
```

## How It Works

1. **Pattern Conversion**: The system converts `{{variable}}` syntax to `path-to-regexp` format (`:variable`)
2. **Path Matching**: Uses `path-to-regexp` library to match incoming paths against patterns
3. **Variable Extraction**: Extracts variable values from the matched path
4. **Destination Building**: Replaces variables in the destination with extracted values

## Implementation Details

### Files Modified

- **`src/lib/redirect-matcher.ts`**: New utility for pattern matching
- **`src/middleware.ts`**: Updated to use pattern matching instead of exact matching
- **`src/app/manage/redirects/page.tsx`**: Added UI hints for pattern syntax

### Key Functions

#### `matchRedirect(pathname, redirects)`
Attempts to match a pathname against redirect rules.

```typescript
const result = matchRedirect('/tours/langtang-trek', redirects);
// Returns: { destination: '/trips/langtang-trek', permanent: true, matched: true }
```

#### `validateRedirectPattern(source)`
Validates a redirect pattern to ensure it's valid.

```typescript
const validation = validateRedirectPattern('/tours/{{slug}}');
// Returns: { valid: true }
```

## Testing

Run the test suite to verify pattern matching:

```bash
npx tsx test-redirects.js
```

All tests should pass:
- ✅ Exact match
- ✅ Single variable pattern
- ✅ Variable in middle of path
- ✅ Multiple variables
- ✅ No match (returns null)
- ✅ Special characters in slug

## Usage in Admin Panel

1. Navigate to `/manage/redirects`
2. Create a new redirect with pattern syntax:
   - **Source**: `/tours/{{slug}}`
   - **Destination**: `/trips/{{slug}}`
   - **Type**: Permanent or Temporary
3. Click "Add Redirect"
4. **Restart your dev server** for changes to take effect

## Important Notes

⚠️ **Server Restart Required**: After adding or modifying redirects, you must restart the development server for changes to take effect in the middleware.

⚠️ **Pattern Priority**: Redirects are matched in order. More specific patterns should be placed before more general ones.

⚠️ **Variable Names**: Use descriptive variable names like `{{slug}}`, `{{id}}`, `{{category}}` for clarity.

## Error Handling

The system is designed to be robust and won't crash if:
- A pattern is invalid (it will be skipped with a console error)
- No match is found (returns `null`)
- Variables don't exist in destination (they remain as-is)

## Performance

Pattern matching is efficient and uses the battle-tested `path-to-regexp` library, which is used by:
- Express.js
- React Router
- Next.js (internally)

## Future Enhancements

Potential future improvements:
- [ ] Optional parameters: `/tours/{{slug}}/:optional?`
- [ ] Wildcard matching: `/tours/*`
- [ ] Regex patterns: `/tours/:id(\\d+)`
- [ ] Query parameter preservation
- [ ] Fragment preservation

## Support

If you encounter any issues with pattern matching, check:
1. Pattern syntax is correct (use `{{variable}}` not `:variable`)
2. Variable names match between source and destination
3. Server has been restarted after adding redirects
4. Check browser console and server logs for errors
