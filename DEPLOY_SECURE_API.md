# Quick Start: Deploy Secure OpenAI Integration

## ⚠️ Current Issue
Your OpenAI API key is exposed in the browser because it uses `VITE_OPENAI_API_KEY`, which embeds the key in client-side code. Anyone can steal it!

## ✅ Solution Applied
I've implemented a secure backend API that keeps your key safe on the server.

---

## 🚀 Deploy in 3 Steps

### Step 1: Update Vercel Environment Variable
1. Go to: https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. **Delete** `VITE_OPENAI_API_KEY` (if exists)
4. **Add new variable:**
   - Key: `OPENAI_API_KEY` (no VITE_ prefix!)
   - Value: `sk-...` (your OpenAI API key)
   - Environments: ✅ Production ✅ Preview ✅ Development
5. Save

### Step 2: Deploy
```bash
git add .
git commit -m "feat: secure OpenAI API with backend function"
git push
```

### Step 3: Test
- Visit your deployed site
- Open AI chat panel  
- Send: "Create a red circle"
- ✅ Should work without warnings!

---

## 📂 What Changed

### New Files
- **`api/ai-chat.js`** - Serverless backend function (handles OpenAI securely)

### Modified Files
- **`src/utils/aiService.js`** - Now calls backend instead of OpenAI directly
- **`src/context/AIContext.jsx`** - Updated error messages

---

## 🔒 Security Benefits

| Before | After |
|--------|-------|
| ❌ API key in browser | ✅ API key on server only |
| ❌ Anyone can steal it | ✅ Completely hidden |
| ❌ `dangerouslyAllowBrowser: true` | ✅ Proper backend architecture |

---

## 🧪 Local Development

```bash
# 1. Create .env.local in project root
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# 2. Install Vercel CLI
npm install -g vercel

# 3. Run with backend functions
vercel dev
```

---

## 📋 Full Documentation

See **`SECURE_API_SETUP.md`** for complete details, troubleshooting, and best practices.

---

**That's it!** Your API key is now secure. 🎉

