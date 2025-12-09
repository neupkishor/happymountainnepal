# Comprehensive Logging System

## Overview
This application now includes a comprehensive logging system that tracks all user activity, page accesses, resource fetches, and bot activities.

## Features

### 1. **Cookie-Based Session Tracking**
- Every visitor gets a unique `temp_account` cookie that persists for 1 year
- The cookie is created automatically on first visit via middleware
- All logs are associated with this cookie ID for session tracking

### 2. **What Gets Logged**
The system logs:
- **Page Views**: Every page access (both server-side and client-side navigation)
- **API Calls**: All API route accesses
- **Static Files**: Public file accesses (images, documents, etc.)
- **Redirects**: All redirect activities
- **Bot Activity**: Automatically detects and flags bot traffic

### 3. **Logged Information**
Each log entry contains:
- `cookieId`: The visitor's unique session ID
- `pageAccessed`: The URL path accessed
- `resourceType`: Type of resource (page, api, static, redirect)
- `method`: HTTP method (GET, POST, etc.)
- `statusCode`: Response status code
- `referrer`: Where the visitor came from
- `userAgent`: Browser/bot user agent string
- `ipAddress`: Client IP address
- `timestamp`: When the access occurred
- `isBot`: Boolean flag for bot detection
- `metadata`: Additional contextual information

### 4. **Bot Detection**
The system automatically detects common bots including:
- Search engine crawlers (Google, Bing, Yahoo, DuckDuckGo, Baidu, Yandex)
- Social media bots (Facebook, Twitter, LinkedIn, Pinterest, etc.)
- Other common bots (Semrush, Ahrefs, Discord, Telegram, etc.)

## Components

### Database Functions (`src/lib/db.ts`)
- `createLog()`: Create a new log entry
- `getLogs()`: Fetch logs with filtering and pagination
- `getLogCount()`: Get total count of logs
- `deleteLog()`: Delete a specific log
- `clearOldLogs()`: Bulk delete logs older than X days

### API Route (`src/app/api/log/route.ts`)
- POST endpoint that receives log data from middleware and client
- Validates required fields
- Saves logs to Firestore

### Middleware (`src/middleware.ts`)
- Intercepts all requests
- Creates/reads the temp_account cookie
- Logs page accesses, redirects, and static file requests
- Detects bots automatically
- Non-blocking logging (doesn't slow down responses)

### Client-Side Tracker (`src/lib/client-logger.tsx`)
- `PageViewTracker` component tracks client-side navigation
- Logs additional metadata (screen size, navigation source)
- Integrated into the root layout

### Management Page (`src/app/manage/logs/page.tsx`)
Access at: `/manage/logs`

Features:
- View all logs with detailed information
- Filter by:
  - Resource type (page, api, static, redirect)
  - Visitor type (humans, bots, all)
  - Cookie ID (search specific sessions)
- Export logs to CSV
- Delete individual logs
- Bulk delete old logs (7, 30, or 90 days)
- Pagination for large datasets
- Real-time refresh

## Database Structure

### Firestore Collection: `logs`
```typescript
{
  id: string;
  cookieId: string;
  pageAccessed: string;
  resourceType: 'page' | 'api' | 'static' | 'redirect';
  method?: string;
  statusCode?: number;
  referrer?: string;
  userAgent: string;
  ipAddress?: string;
  timestamp: Timestamp;
  isBot?: boolean;
  metadata?: Record<string, any>;
}
```

## Security

### Firestore Rules
The logs collection has strict security rules:
- Client reads: **Disabled** (use server actions)
- Client writes: **Disabled** (use API route)
- All operations go through server-side code with Admin SDK

This ensures:
- Logs cannot be tampered with by clients
- Sensitive data is protected
- Only authorized server code can access logs

## Usage Examples

### Viewing Logs
1. Navigate to `/manage/logs`
2. Use filters to narrow down results
3. Click on any log to see full details

### Exporting Data
1. Apply desired filters
2. Click "Export CSV"
3. Download includes all filtered logs

### Cleaning Up Old Logs
1. Click the "Clear old logs" dropdown
2. Select time period (7, 30, or 90 days)
3. Confirm deletion

### Tracking a Specific User Session
1. Copy a cookie ID from any log entry
2. Paste it in the "Cookie ID" filter
3. View all activities for that session

## Performance Considerations

### Non-Blocking Logging
- Middleware uses `setTimeout` for async logging
- API calls don't wait for log completion
- User experience is not impacted

### Pagination
- Logs are loaded in batches of 50
- "Load More" button for additional results
- Prevents overwhelming the browser

### Cleanup
- Regular cleanup recommended (monthly)
- Keeps database size manageable
- Improves query performance

## Privacy Considerations

### What We Track
- Anonymous cookie IDs (not personally identifiable)
- IP addresses (can be anonymized if needed)
- User agents (standard browser information)
- Page paths (what users view)

### What We Don't Track
- Personal information
- Form submissions (unless explicitly logged)
- Passwords or sensitive data
- Cross-site activity

### GDPR Compliance
To make this system GDPR compliant:
1. Add a cookie consent banner
2. Anonymize IP addresses (remove last octet)
3. Provide a way for users to request data deletion
4. Update privacy policy to mention logging

## Future Enhancements

Potential improvements:
1. **Analytics Dashboard**: Visualize traffic patterns
2. **Geolocation**: Map IP addresses to locations
3. **Session Replay**: Reconstruct user journeys
4. **Anomaly Detection**: Flag suspicious activity
5. **Real-time Monitoring**: Live activity feed
6. **Performance Metrics**: Track page load times
7. **Conversion Tracking**: Monitor goal completions
8. **A/B Testing**: Compare different versions

## Troubleshooting

### Logs Not Appearing
1. Check Firestore rules are deployed
2. Verify API route is accessible
3. Check browser console for errors
4. Ensure cookie is being set

### High Log Volume
1. Implement rate limiting
2. Filter out certain paths
3. Increase cleanup frequency
4. Consider log aggregation

### Bot Traffic Overwhelming
1. Add more bot patterns to detection
2. Implement CAPTCHA for suspicious traffic
3. Use CDN-level bot protection
4. Filter bots from analytics

## Maintenance

### Regular Tasks
- **Weekly**: Review bot detection accuracy
- **Monthly**: Clean up old logs
- **Quarterly**: Export important data for backup
- **Yearly**: Review and update privacy policy

### Monitoring
- Watch database size
- Monitor API usage
- Check for errors in logs
- Review unusual patterns

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Test in development environment
4. Check Firestore console for data
