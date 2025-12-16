# Deployment Setup Guide

## Manager Authentication Configuration

The manager authentication system uses environment variables in production to avoid security issues with gitignored files.

### Local Development

For local development, the system reads from `manager.json` file (which is gitignored):

```json
[
  {
    "username": "your_username_here",
    "password": "your_password_here"
  }
]
```

### Production Deployment

For production (Firebase App Hosting or any other platform), you need to set the `MANAGER_CREDENTIALS` environment variable.

#### Firebase App Hosting

1. Go to your Firebase Console
2. Navigate to App Hosting
3. Select your backend
4. Go to Settings → Environment Variables
5. Add a new environment variable:
   - **Name**: `MANAGER_CREDENTIALS`
   - **Value**: The JSON array of manager credentials (minified, no line breaks)
   
   Example value:
   ```
   [{"username":"admin","password":"your_secure_password"}]
   ```

#### Other Platforms

Set the environment variable according to your platform's documentation:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Railway**: Project → Variables
- **Render**: Environment → Environment Variables

### Security Notes

1. ✅ **DO**: Use strong passwords for production
2. ✅ **DO**: Keep `manager.json` in `.gitignore`
3. ✅ **DO**: Use environment variables for production
4. ❌ **DON'T**: Commit `manager.json` to version control
5. ❌ **DON'T**: Use simple passwords in production

### Testing

After setting up the environment variable:

1. Deploy your application
2. Navigate to `/manage/login`
3. Try logging in with your credentials
4. If successful, you should be redirected to the manager dashboard

### Troubleshooting

If manager login fails in production:

1. **Check environment variable is set**: Verify in your platform's dashboard
2. **Check JSON format**: Ensure the JSON is valid (no trailing commas, proper quotes)
3. **Check logs**: Look for error messages in your deployment logs
4. **Test locally**: Ensure `manager.json` works locally first

## Legal Documents Page Fix

The legal documents redirect has been fixed to use the proper domain instead of `0.0.0.0:port`. This fix ensures that redirects work correctly in both development and production environments.

No additional configuration is needed for this fix.
