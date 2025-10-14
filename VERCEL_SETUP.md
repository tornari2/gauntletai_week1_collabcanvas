# Vercel Deployment Guide

Follow these steps to deploy CollabCanvas to Vercel for production hosting with automatic deployments.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Firebase project configured (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
- Git repository pushed to GitHub

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PR1: Project setup complete"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/your-username/collabcanvas.git

# Push to GitHub
git push -u origin main
```

## Step 2: Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

## Step 3: Import Project

1. From Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your GitHub repository (`collabcanvas` or your repo name)
3. Click **"Import"**

## Step 4: Configure Project Settings

### Framework Preset
- Vercel should auto-detect **Vite** as the framework
- If not, select **"Vite"** from the dropdown

### Build and Output Settings
- **Build Command**: `npm run build` (should be auto-filled)
- **Output Directory**: `dist` (should be auto-filled)
- **Install Command**: `npm install` (should be auto-filled)

### Root Directory
- Leave as `.` (project root)

## Step 5: Add Environment Variables

This is **critical** - add your Firebase configuration as environment variables:

1. In the "Environment Variables" section, click **"Add"**
2. Add each of the following variables (see `.env.example` for reference):

| Name | Value (from your `.env` file) |
|------|-------------------------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID |

**Important**: 
- Copy values exactly from your `.env` file (see `.env.example` for variable names)
- Include all variables - missing one will break the app
- Variable names must start with `VITE_` for Vite to expose them

## Step 6: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, Vercel will show your live URL (e.g., `https://collabcanvas.vercel.app`)

## Step 7: Test Deployment

1. Click on your deployment URL
2. The app should load without errors
3. Open browser console (F12) - check for Firebase connection errors
4. Try the authentication flow (will implement in PR 2)

## Step 8: Configure Automatic Deployments

Vercel automatically sets up CI/CD:

- **Production**: Every push to `main` branch → deploys to production
- **Preview**: Every push to other branches or PRs → creates preview deployment

No additional configuration needed! ✨

## Production URL

Your app will be live at:
```
https://your-project-name.vercel.app
```

Or with custom domain (optional):
```
https://collabcanvas.yourdomain.com
```

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Click **"Add"**
4. Enter your domain name
5. Follow DNS configuration instructions

## Troubleshooting

### Build Failed

**Check build logs:**
1. Click on the failed deployment
2. Read the build logs for errors
3. Common issues:
   - Missing dependencies → check `package.json`
   - Syntax errors → check linter output locally
   - Environment variables → verify all are set

**Fix and redeploy:**
```bash
# Fix the issue locally
# Commit and push
git add .
git commit -m "Fix build issue"
git push
# Vercel will auto-deploy again
```

### App Loads But Shows Errors

**Check environment variables:**
1. Go to Project Settings → Environment Variables
2. Verify all Firebase variables are present
3. Check for typos in variable names or values
4. Redeploy after fixing: Deployments → Redeploy

**Check browser console:**
- Firebase authentication errors → check Firebase config
- Network errors → check Firestore security rules
- CORS errors → check Firebase authorized domains

### Firebase Authentication Not Working

1. Go to Firebase Console → Authentication → Settings
2. Scroll to **"Authorized domains"**
3. Add your Vercel domain: `your-project-name.vercel.app`
4. Click **"Add domain"**

### "Firebase: Error (auth/unauthorized-domain)"

- Add your Vercel domain to Firebase authorized domains (see above)
- Wait a few minutes for changes to propagate
- Clear browser cache and retry

## Updating Deployment

### After Code Changes

```bash
git add .
git commit -m "Description of changes"
git push
# Vercel automatically deploys!
```

### After Environment Variable Changes

1. Update variables in Vercel dashboard
2. Trigger redeploy:
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

## Monitoring & Analytics

### View Deployment Logs

1. Go to your project in Vercel
2. Click **"Deployments"**
3. Click on any deployment to see logs
4. Check build logs, function logs, and errors

### Enable Analytics (Optional)

1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. View real-time traffic, performance, and user data

## Production Checklist

- [ ] Firebase project created and configured
- [ ] All environment variables added to Vercel
- [ ] Build succeeds without errors
- [ ] App loads at production URL
- [ ] No console errors in browser
- [ ] Firebase authentication works
- [ ] Firestore security rules published
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Auto-deploy working (test with a commit)

## Next Steps

Once deployed:
1. ✅ Share the URL with team members for testing
2. ✅ Test multi-user functionality (PR 9-10)
3. ✅ Monitor performance and errors
4. ✅ Iterate based on feedback

## Useful Commands

```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

---

**Need help?** Check the [Vercel Documentation](https://vercel.com/docs) or the main [README.md](./README.md)

