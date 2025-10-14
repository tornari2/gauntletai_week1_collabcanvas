# CollabCanvas - Quick Start Checklist

Complete these steps to get CollabCanvas running locally and deployed.

## ⚡ Local Development Setup

### ✅ Step 1: Install Dependencies (DONE)
```bash
npm install
```

### 🔥 Step 2: Configure Firebase (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database** (Start in test mode)
5. Get your config from Project Settings → Web App
6. Copy `.env.example` to `.env` and add your Firebase credentials:
   ```bash
   cp .env.example .env
   # Then edit .env with your actual Firebase values
   ```

📖 **Detailed guide**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### ▶️ Step 3: Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

**Expected**: Login placeholder appears with no errors in console.

---

## 🚀 Production Deployment (Optional)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - PR1 complete"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel (5 minutes)

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Add environment variables (same as `.env` file)
5. Deploy!

📖 **Detailed guide**: See [VERCEL_SETUP.md](./VERCEL_SETUP.md)

---

## ✅ Verification Checklist

### Local Development
- [ ] `npm install` completed successfully
- [ ] Firebase project created
- [ ] `.env` file created with Firebase config
- [ ] `npm run dev` starts without errors
- [ ] App loads at `http://localhost:5173`
- [ ] No errors in browser console
- [ ] Login placeholder visible

### Production (Optional)
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Build succeeds
- [ ] App accessible via Vercel URL
- [ ] No errors in production console

---

## 🎯 What's Next?

Once local development is working:

1. **PR 2**: Implement authentication (login/signup UI)
2. **PR 3**: Set up canvas state management
3. **PR 4**: Build Konva canvas with pan/zoom
4. **PR 5+**: Add shapes, sync, multiplayer features

---

## 🆘 Need Help?

### Firebase Connection Issues?
- Check `.env` file has correct values
- Restart dev server after creating `.env`
- Verify Firebase Auth and Firestore are enabled

### Build Errors?
- Delete `node_modules` and run `npm install` again
- Check Node.js version: `node --version` (need v18+)
- Check for typos in file names

### Still Stuck?
1. Check [README.md](./README.md) for full documentation
2. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase details
3. Check browser console for specific error messages

---

## 📁 Current Project Status

**PR 1**: ✅ Complete  
**Next**: PR 2 (User Authentication)

All infrastructure is ready. You just need to:
1. Configure Firebase (5 min)
2. Start coding PR 2!

---

🚀 **Let's build something awesome!**

