# Fix: Online Users & Cursors Not Working

## 🔍 Problem
- Online Users showing 0
- Cursors not appearing
- Presence system not working

## 🎯 Root Cause
Firebase Realtime Database security rules haven't been deployed yet.

## ✅ Quick Fix (5 minutes)

### Option 1: Deploy Rules via Firebase Console (Easiest)

1. **Go to Firebase Console:**
   - Open: https://console.firebase.google.com/project/collabcanvas-8ef1b/database/collabcanvas-8ef1b-default-rtdb/data

2. **Click on "Rules" tab** (top of page)

3. **Replace the rules with this:**
   ```json
   {
     "rules": {
       "presence": {
         "$userId": {
           ".read": "auth != null",
           ".write": "$userId === auth.uid",
           ".validate": "newData.hasChildren(['userId', 'displayName', 'colorHex', 'cursorX', 'cursorY', 'lastActive', 'onlineStatus'])",
           "userId": {
             ".validate": "newData.val() === auth.uid"
           },
           "displayName": {
             ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
           },
           "colorHex": {
             ".validate": "newData.isString() && newData.val().matches(/^#[0-9A-Fa-f]{6}$/)"
           },
           "cursorX": {
             ".validate": "newData.isNumber()"
           },
           "cursorY": {
             ".validate": "newData.isNumber()"
           },
           "lastActive": {
             ".validate": "newData.isNumber() || newData.val() === null"
           },
           "onlineStatus": {
             ".validate": "newData.isString() && (newData.val() === 'online' || newData.val() === 'offline')"
           }
         }
       }
     }
   }
   ```

4. **Click "Publish"** button (top right)

5. **Restart your dev server:**
   ```bash
   npm run dev
   ```

6. **Test it:**
   - Log in
   - Open browser console - should see no errors
   - Open second browser/incognito window
   - Log in with another account
   - You should now see:
     - ✅ Online Users: 2
     - ✅ Both cursors visible on each other's screens

### Option 2: Deploy via Firebase CLI

```bash
cd gauntletai_week1_collabcanvas
firebase deploy --only database
```

## 🧪 Verify It's Working

### Check 1: Browser Console
Open browser console (F12) and look for errors. Should see NO errors like:
- ❌ "permission denied" 
- ❌ "PERMISSION_DENIED"
- ✅ Should be clean!

### Check 2: Firebase Console Data
Go to: https://console.firebase.google.com/project/collabcanvas-8ef1b/database/collabcanvas-8ef1b-default-rtdb/data

You should see:
```
presence/
  user-id-1/
    userId: "..."
    displayName: "..."
    colorHex: "#..."
    cursorX: 123
    cursorY: 456
    lastActive: 1234567890
    onlineStatus: "online"
```

### Check 3: Online Users Count
- Top right of canvas should show: "Online Users: 1" (or more)
- Each user should have a colored dot
- Cursors should be visible and moving

## 🚨 Still Not Working?

### Issue: "Database not found"
**Fix:** Enable Realtime Database in Firebase Console:
1. Go to: https://console.firebase.google.com/project/collabcanvas-8ef1b/database
2. Click "Create Database" for Realtime Database
3. Choose location (us-central1)
4. Start in "Locked mode"
5. Then follow the rules deployment steps above

### Issue: "PERMISSION_DENIED" in console
**Fix:** Rules aren't deployed correctly
- Double-check the rules in Firebase Console match exactly
- Make sure you clicked "Publish"
- Try hard-refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Issue: Cursor lag or not updating
**Fix:** This is normal if:
- Network latency is high
- Multiple browser tabs open
- Solution: Close extra tabs, check network connection

## 📊 What This Fixes

✅ Online Users count shows correctly
✅ User list displays all connected users
✅ Colored dots appear next to each user
✅ Cursors appear on canvas for all users
✅ Cursor movement syncs in real-time
✅ Users automatically removed on disconnect
✅ "(you)" label appears next to your name

## 🎉 Success!

Once deployed, you should immediately see:
- Your friend's cursor moving on your screen
- Your cursor moving on their screen
- Both names in the "Online Users" list
- User count updating in real-time

---

**Need help?** Check browser console for error messages and share them.

