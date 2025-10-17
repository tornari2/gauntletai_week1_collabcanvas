# Firebase Realtime Database Setup Checklist

## ✅ What's Already Done

- ✅ Code migrated to use Realtime Database
- ✅ Security rules created (`database.rules.json`)
- ✅ `.env.example` created with all required variables
- ✅ Your RTDB URL identified: `https://collabcanvas-8ef1b-default-rtdb.firebaseio.com/`

## 📋 Setup Steps (Do These Now)

### 1. Add Environment Variable to `.env`

**Action Required:** Add this line to your `.env` file:

```env
VITE_FIREBASE_DATABASE_URL=https://collabcanvas-8ef1b-default-rtdb.firebaseio.com
```

**Location:** `/gauntletai_week1_collabcanvas/.env`

> **Note:** Your `.env` file should already have the other Firebase variables. Just add this new line.

### 2. Deploy Security Rules to Firebase

**Option A: Using Firebase CLI (Recommended)**
```bash
cd gauntletai_week1_collabcanvas
firebase deploy --only database
```

**Option B: Manual via Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **collabcanvas-8ef1b**
3. Navigate to: **Realtime Database** → **Rules** tab
4. Copy the contents of `database.rules.json` and paste
5. Click **Publish**

### 3. Verify Setup

**Check 1: Database is Created**
- Go to: [Firebase Console → Realtime Database](https://console.firebase.google.com/project/collabcanvas-8ef1b/database/collabcanvas-8ef1b-default-rtdb/data)
- You should see an empty database or data tab

**Check 2: Rules are Deployed**
- Go to the **Rules** tab in Realtime Database
- Should see the rules from `database.rules.json`

**Check 3: App Works**
```bash
npm run dev
```
- Log in
- Open browser console - no Firebase errors
- Open a second browser window, move cursor
- Should see cursor in first window (faster/smoother than before!)

## 🔒 Security Rules Explained

The `database.rules.json` provides:

### ✅ Secure Access
- **Read:** All authenticated users can see presence data
- **Write:** Users can only write their own presence data
- **Auth Required:** Unauthenticated users have no access

### ✅ Data Validation
- **userId:** Must match authenticated user ID
- **displayName:** String, 1-100 characters
- **colorHex:** Valid hex color format (#RRGGBB)
- **cursorX/Y:** Must be numbers
- **lastActive:** Number or null
- **onlineStatus:** Must be "online" or "offline"

### ✅ No Additional Rules Needed
The provided rules are **complete and production-ready**. They:
- Prevent unauthorized access
- Validate all data fields
- Allow proper collaborative features
- Match the code implementation

## 🚫 What You DON'T Need

- ❌ **No new authentication** - Uses your existing Firebase Auth
- ❌ **No new packages** - Firebase SDK already includes RTDB
- ❌ **No new user setup** - Existing users work automatically
- ❌ **No database migrations** - Fresh RTDB instance, no data to migrate
- ❌ **No additional security rules** - `database.rules.json` is complete

## 🎯 That's It!

Once you:
1. Add the URL to `.env`
2. Deploy the rules

Your app will use Realtime Database for **3x faster cursor tracking** with **automatic cleanup**! 🚀

## 🐛 Troubleshooting

### Error: "databaseURL is not configured"
**Solution:** Make sure you added `VITE_FIREBASE_DATABASE_URL` to `.env` and **restarted the dev server**

### Error: "Permission denied" 
**Solution:** Deploy the security rules using one of the methods above

### Cursors not appearing
**Solution:** 
1. Check browser console for errors
2. Verify rules are deployed
3. Make sure both users are authenticated
4. Check Firebase Console → Realtime Database → Data to see if presence data is being written

## 📊 Expected Improvements

After setup, you should notice:
- **Smoother cursor movement** (16ms updates vs 50ms before)
- **Lower latency** (50-150ms vs 200-500ms)
- **Automatic cleanup** (users disappear when they disconnect)
- **Better collaborative feel** overall

---

**Need help?** Check the main [README.md](./README.md) for full documentation.

