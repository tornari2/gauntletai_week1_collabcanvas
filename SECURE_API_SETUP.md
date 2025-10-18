# 🔐 Secure OpenAI API Setup - Deployment Guide

## Problem Fixed
Your OpenAI API key was being exposed in the client-side code (browser), which is a **critical security vulnerability**. Anyone could steal your key and rack up charges on your account.

## Solution
We've moved the OpenAI API calls to a **secure backend function** using Vercel Serverless Functions. Your API key now stays safe on the server.

---

## 📋 Deployment Steps

### 1. **Update Vercel Environment Variables**

Go to your Vercel project settings and **update** your environment variable:

1. Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
2. **REMOVE** the old `VITE_OPENAI_API_KEY` variable (if it exists)
3. **ADD** a new variable:
   - **Key**: `OPENAI_API_KEY` (no `VITE_` prefix!)
   - **Value**: Your OpenAI API key (starts with `sk-...`)
   - **Environment**: Check all environments (Production, Preview, Development)
4. Click **Save**

### 2. **Redeploy Your Application**

After updating the environment variable:

**Option A: Trigger from Vercel Dashboard**
- Go to **Deployments** tab
- Click the three dots on your latest deployment
- Select **Redeploy**

**Option B: Push a new commit**
```bash
git add .
git commit -m "feat: secure OpenAI API with backend function"
git push
```

### 3. **Verify the Deployment**

After deployment completes:
1. Visit your Vercel URL
2. Open the AI chat panel
3. Try a command like "Create a red circle"
4. ✅ It should work without any API key warnings!

---

## 🔍 What Changed?

### Before (Insecure ❌)
```
Frontend → OpenAI API (with exposed key)
```
- API key visible in browser
- Anyone could steal it

### After (Secure ✅)
```
Frontend → Vercel Backend API → OpenAI API
```
- API key stays on server
- Not visible to users
- Backend validates requests

---

## 📁 Files Modified

1. **`/api/ai-chat.js`** (NEW)
   - Serverless function that handles OpenAI API calls
   - Keeps API key secure on server-side

2. **`/src/utils/aiService.js`** (UPDATED)
   - Now calls backend API instead of OpenAI directly
   - Removed client-side OpenAI initialization

3. **`/src/context/AIContext.jsx`** (UPDATED)
   - Updated error messages

---

## 🧪 Local Development

For local testing:

1. Create a `.env.local` file in the project root:
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

2. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

3. Run locally with Vercel dev server:
```bash
vercel dev
```

This will simulate the serverless functions locally.

---

## 🔒 Security Checklist

- ✅ API key is NOT in client-side code
- ✅ API key uses `OPENAI_API_KEY` (not `VITE_OPENAI_API_KEY`)
- ✅ Backend function validates requests
- ✅ No `dangerouslyAllowBrowser: true` flag
- ✅ API calls go through secure backend

---

## 🚨 Important Notes

1. **Never commit `.env.local`** - It's in `.gitignore` for a reason!
2. **Monitor API usage** - Set up billing alerts in your OpenAI dashboard
3. **Rate limiting** - Consider adding rate limiting to your backend function for production

---

## 🐛 Troubleshooting

### Error: "OpenAI API key not configured on server"
- Make sure you set `OPENAI_API_KEY` (not `VITE_OPENAI_API_KEY`) in Vercel
- Redeploy after adding the variable

### Error: "Failed to process command"
- Check Vercel function logs: Dashboard → Your Project → Functions → Logs
- Verify your OpenAI API key is valid

### Backend function not found (404)
- Make sure the `api/` folder is in the root of your project
- Redeploy the application

---

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

## ✅ Summary

Your OpenAI API key is now **secure**! The warning you saw has been resolved by moving the API key to a server-side environment variable that's never exposed to the browser.

Deploy the changes and test it out! 🚀

