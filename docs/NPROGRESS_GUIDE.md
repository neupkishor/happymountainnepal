# NProgress Integration Guide

## Overview
NProgress is now fully integrated across the entire application. It automatically displays a loading bar at the top of the page during navigation and can be manually controlled for async operations.

## Automatic Navigation Progress

The progress bar automatically appears when:
- Clicking on any internal link (Next.js Link or regular anchor tags)
- Using browser back/forward buttons
- Programmatic navigation with `router.push()`, `router.replace()`, etc.

No additional code is required for these scenarios - it works out of the box!

## Manual Control with `useNProgress` Hook

For form submissions, API calls, or any async operations, use the `useNProgress` hook:

### Basic Example

```tsx
'use client';

import { useNProgress } from '@/hooks/useNProgress';

export function MyComponent() {
  const { start, done } = useNProgress();

  const handleSubmit = async (data: FormData) => {
    start(); // Start the progress bar
    try {
      await fetch('/api/submit', {
        method: 'POST',
        body: data,
      });
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      done(); // Always complete the progress bar
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Advanced Example with Progress Updates

```tsx
'use client';

import { useNProgress } from '@/hooks/useNProgress';

export function FileUploader() {
  const { start, set, done } = useNProgress();

  const handleUpload = async (file: File) => {
    start();
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = e.loaded / e.total;
          set(percentComplete); // Update progress bar to match upload progress
        }
      });

      xhr.addEventListener('load', () => {
        done();
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      done();
    }
  };

  return (
    <input type="file" onChange={(e) => handleUpload(e.target.files?.[0])} />
  );
}
```

### Example with Multiple API Calls

```tsx
'use client';

import { useNProgress } from '@/hooks/useNProgress';

export function DataFetcher() {
  const { start, inc, done } = useNProgress();

  const fetchMultipleResources = async () => {
    start();
    
    try {
      // Fetch first resource
      await fetch('/api/resource1');
      inc(0.33); // Increment by 33%
      
      // Fetch second resource
      await fetch('/api/resource2');
      inc(0.33); // Increment by another 33%
      
      // Fetch third resource
      await fetch('/api/resource3');
      done(); // Complete
    } catch (error) {
      done();
    }
  };

  return (
    <button onClick={fetchMultipleResources}>
      Load All Data
    </button>
  );
}
```

## API Reference

### `useNProgress()` Hook

Returns an object with the following methods:

- **`start()`**: Start the progress bar
- **`done()`**: Complete and hide the progress bar
- **`set(n: number)`**: Set progress to a specific value (0.0 to 1.0)
- **`inc(amount?: number)`**: Increment the progress bar by a specific amount
- **`remove()`**: Remove the progress bar without completing it

## Configuration

The progress bar is configured in `src/components/layout/ProgressBar.tsx` with the following settings:

```typescript
NProgress.configure({ 
  showSpinner: false,    // Hide the spinner
  minimum: 0.1,          // Minimum percentage (10%)
  easing: 'ease',        // CSS easing function
  speed: 500,            // Animation speed in ms
  trickleSpeed: 200,     // How often to trickle (in ms)
});
```

## Styling

The progress bar uses your app's primary color (`hsl(var(--primary))`) and is styled in:
- `src/components/layout/ProgressBar.tsx` (inline styles)
- `src/app/globals.css` (global styles)

To customize the appearance, modify these files.

## Best Practices

1. **Always use `try/finally`**: Ensure `done()` is called even if an error occurs
2. **Don't nest progress bars**: Only one progress bar should be active at a time
3. **Use for operations > 300ms**: Don't show progress for very quick operations
4. **Provide feedback**: Combine with toast notifications for better UX

## Troubleshooting

### Progress bar doesn't appear on navigation
- Check that the `<ProgressBar />` component is rendered in your root layout
- Ensure you're using Next.js Link components or standard anchor tags

### Progress bar doesn't complete
- Make sure you're calling `done()` in all code paths (success and error)
- Check browser console for JavaScript errors

### Progress bar appears twice
- Don't manually call `start()` for navigation - it's automatic
- Only use manual control for non-navigation async operations
