# Quick Setup: Firebase App Hosting Environment Variable

## MANAGER_CREDENTIALS Environment Variable

Copy the value below and set it as an environment variable in Firebase App Hosting:

### Variable Name:
```
MANAGER_CREDENTIALS
```

### Variable Value (copy this exactly):
```
[{"username":"neupkishor","password":"I@mkishor"}]
```

## Steps to Set in Firebase:

1. Open Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **App Hosting** in the left sidebar
4. Click on your backend/site
5. Go to **Settings** tab
6. Scroll to **Environment Variables** section
7. Click **Add Variable**
8. Paste the variable name: `MANAGER_CREDENTIALS`
9. Paste the variable value: `[{"username":"neupkishor","password":"I@mkishor"}]`
10. Click **Save**
11. **Redeploy** your application for changes to take effect

## After Setting the Variable:

Your manager login should now work on the deployed site at `/manage/login`

---

**Note**: This file contains sensitive credentials. Do NOT commit this file to version control.
