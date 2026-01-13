# Image Data Format Documentation

## Overview
The application supports flexible image data formats in the database. Images can be stored in multiple formats and will be automatically normalized when fetched.

## Supported Database Formats

### 1. Array Format (Recommended for new entries)
```javascript
// Format: [url, posted_by, caption, story]
images: [
  ["https://example.com/image1.jpg", "John Doe", "Beautiful mountain view", "This was taken during sunrise..."],
  ["https://example.com/image2.jpg", "Jane Smith", "Trek to base camp"],
  ["https://example.com/image3.jpg", null, "Group photo"] // posted_by can be null
]
```

**Array Index Mapping:**
- `[0]` → `url` (required)
- `[1]` → `posted_by` (optional)
- `[2]` → `caption` (optional)
- `[3]` → `story` (optional)

### 2. Object Format
```javascript
images: [
  {
    url: "https://example.com/image1.jpg",
    posted_by: "John Doe",
    caption: "Beautiful mountain view",
    story: "This was taken during sunrise..."
  }
]
```

### 3. String Format (Legacy - still supported)
```javascript
images: [
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg"
]
```

## Image Fields

### `url` (required)
- Type: `string`
- The URL of the image
- Must be a valid URL string

### `posted_by` (optional)
- Type: `string`
- Name of the person who posted/took the photo
- Displayed with a user icon in the gallery

### `caption` (optional)
- Type: `string`
- Short description or caption for the image
- Displayed in italic text if no story is present

### `story` (optional)
- Type: `string`
- Longer narrative or story about the image
- Takes priority over caption in display
- Can be expanded/collapsed in the viewer

## How It Works

### Normalization Process
When tour data is fetched from the database, all images are automatically normalized to the object format:

```typescript
// Input (array format)
["https://example.com/img.jpg", "John", "Caption", "Story"]

// Output (normalized)
{
  url: "https://example.com/img.jpg",
  posted_by: "John",
  caption: "Caption",
  story: "Story"
}
```

### Display Priority
1. **Story** is shown as the main text if available
2. **Caption** is shown as italic text if no story exists
3. **Posted by** is always shown when available

## Examples

### Example 1: Full Data
```javascript
mainImage: ["https://cdn.example.com/everest.jpg", "Tenzing Norgay", "Summit day", "After 8 hours of climbing, we finally reached the summit. The view was breathtaking."]
```

### Example 2: Minimal Data
```javascript
images: [
  ["https://cdn.example.com/trek1.jpg"],
  ["https://cdn.example.com/trek2.jpg", "Guide Team"]
]
```

### Example 3: Mixed Formats (all supported)
```javascript
images: [
  ["https://cdn.example.com/img1.jpg", "John", "Day 1"],
  { url: "https://cdn.example.com/img2.jpg", posted_by: "Jane" },
  "https://cdn.example.com/img3.jpg"
]
```

## Database Update Examples

### Firebase Console
```javascript
// Update a package's images
{
  images: [
    ["https://example.com/img1.jpg", "John Doe", "Base camp arrival", "We arrived at base camp after 3 days of trekking"],
    ["https://example.com/img2.jpg", "Jane Smith", "Mountain sunrise"],
    ["https://example.com/img3.jpg", null, "Group photo"]
  ]
}
```

### Via Admin Panel
When using the admin panel, images should be uploaded and metadata can be added through the form fields.

## Technical Notes

- All formats are automatically converted to the object format when fetched
- Empty or invalid URLs are filtered out
- The normalization happens in `/src/lib/db/tours.ts`
- Type safety is maintained through the `ImageWithCaption` interface
- String conversion ensures compatibility with Next.js Image component
