# Base Storage Directory

This directory contains runtime-editable data files for the application.

## Files

### Credential Files (Gitignored)
- **manager.json** - Manager account credentials
- **session.json** - Active session data

### Configuration Files (Gitignored)
- **navigation-components.json** - Navigation menu configuration
- **redirects.json** - URL redirect rules

## Setup Instructions

### Local Development
1. Copy the template files to create your actual data files:
   ```bash
   cp src/base/manager.template.json src/base/manager.json
   cp src/base/session.template.json src/base/session.json
   cp src/base/navigation-components.template.json src/base/navigation-components.json
   cp src/base/redirects.template.json src/base/redirects.json
   ```

2. Edit `manager.json` with your credentials:
   ```json
   [
     {
       "username": "your-username",
       "password": "your-secure-password"
     }
   ]
   ```

### AWS Server Deployment
1. **Option A: Manual Setup**
   - SSH into your AWS server
   - Navigate to the application directory
   - Create the `/src/base` directory if it doesn't exist
   - Create the JSON files with your production credentials

2. **Option B: Use AWS Secrets Manager** (Recommended)
   - Store credentials in AWS Secrets Manager
   - Modify the application to fetch credentials from Secrets Manager on startup
   - This is more secure than storing credentials in files

3. **Option C: Environment Variables**
   - Set credentials as environment variables
   - Modify the application to read from environment variables instead of JSON files

## Security Notes

⚠️ **IMPORTANT**: All `.json` files in this directory are gitignored to prevent credentials from being committed to version control.

- Never commit actual credential files to git
- Use strong passwords for production
- Rotate credentials regularly
- Consider using AWS Secrets Manager for production deployments
- Ensure proper file permissions on the server (e.g., `chmod 600` for credential files)

## File Formats

### manager.json
```json
[
  {
    "username": "string",
    "password": "string"
  }
]
```

### session.json
```json
[
  {
    "session_id": "string",
    "session_key": "string",
    "device_id": "string",
    "username": "string",
    "created_at": "ISO8601 timestamp",
    "expires_at": "ISO8601 timestamp",
    "isExpired": 0 | 1
  }
]
```

### navigation-components.json
Array of navigation component configurations.

### redirects.json
```json
[
  {
    "source": "/old-path",
    "destination": "/new-path",
    "permanent": true | false
  }
]
```
