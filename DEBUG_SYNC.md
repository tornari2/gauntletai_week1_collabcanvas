# Debug Multi-User Sync Issues

## Quick Fix: Inspect Element Now Works!
**Right-click + Cmd (Mac) or Right-click + Ctrl (Windows)** to open inspect element.

---

## Debugging Steps

### Step 1: Check Both Users Are Authenticated

1. **Open browser console** in both windows (Right-click + Cmd/Ctrl → Inspect → Console tab)
2. **Type this command:**
   ```javascript
   console.log('User:', window.localStorage.getItem('firebase:authUser'))
   ```
3. **Expected:** Should see a user object (not null)
4. **If null:** User not logged in - try logging out and back in

### Step 2: Check for Firebase Errors

In **both browser consoles**, look for errors mentioning:
- ❌ "Permission denied"
- ❌ "Missing or insufficient permissions"
- ❌ "FirebaseError"
- ❌ Any red error messages

**If you see permission errors:**
- Rules may not have deployed yet (wait 30 seconds, refresh)
- Wrong project in Firebase Console
- Rules not published (check Firebase Console → Firestore → Rules → should show timestamp)

### Step 3: Test Firebase Connection

In **console of Window 1**, paste this:
```javascript
// Test if Firebase is connected
import { db } from './src/utils/firebase.js'
console.log('Firebase DB:', db)
```

**Expected:** Should see Firestore object, not undefined

### Step 4: Check Firestore Listener

In **console**, check if listener is active:
```javascript
// In React DevTools, check CanvasContext
// Should see shapes array updating
```

### Step 5: Manual Shape Creation Test

In **Window 1 console**, try creating a test shape directly:
```javascript
// This will help us see if writes work at all
console.log('Testing Firestore write...')
```

### Step 6: Check Firestore Database

1. **Go to Firebase Console:** https://console.firebase.google.com
2. **Navigate to:** Firestore Database
3. **Look for:** `canvases/global/shapes` collection
4. **Try this:**
   - Create a shape in Window 1
   - Refresh Firebase Console
   - Do you see the shape document appear?

**If NO documents appear:**
- Writes are failing (likely rules issue)
- Check console for errors

**If documents appear but Window 2 doesn't update:**
- Reads/listener issue
- Check Window 2 console for errors

---

## Common Issues & Solutions

### Issue: "Permission Denied" in Console

**Solution:**
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure rules match the ones in `firestore.rules`
3. Click "Publish" again
4. Wait 30 seconds
5. Hard refresh both windows (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Shapes Appear in Firestore But Not in Window 2

**Solution:**
```javascript
// In Window 2 console, check if listener is running
// You should see this log when shapes update
```

Possible fixes:
- Window 2 user not authenticated → Re-login
- Listener not attached → Refresh page
- React state not updating → Check React DevTools

### Issue: Console Shows "Firebase is not defined"

**Solution:**
- Environment variables missing
- Check `.env` file exists
- Restart dev server: `npm run dev`

### Issue: Both Users See Different Shapes

**Solution:**
- Not connected to same Firebase project
- Check `VITE_FIREBASE_PROJECT_ID` in both environments
- Both should show same project in Firebase Console

---

## Expected Console Output (When Working)

**Window 1 (after creating shape):**
```
Creating shape with ID: abc-123-def...
Shape created successfully
```

**Window 2 (should see automatically):**
```
Firestore snapshot received: 1 shape(s)
Updating canvas with new shapes
```

---

## Emergency Debug: Check Everything

Run this in **both browser consoles**:

```javascript
// Copy-paste this entire block
console.log('=== CollabCanvas Debug Info ===')
console.log('1. User authenticated:', !!window.localStorage.getItem('firebase:authUser'))
console.log('2. Window location:', window.location.href)
console.log('3. Checking for errors...')

// Check if canvas is rendering
const canvasElement = document.querySelector('.canvas-container')
console.log('4. Canvas element found:', !!canvasElement)

// Check toolbar
const toolbarElement = document.querySelector('.toolbar')
console.log('5. Toolbar found:', !!toolbarElement)

console.log('=== End Debug Info ===')
```

**Share the output** if you need help debugging!

---

## Quick Test Procedure

1. ✅ **Window 1:** Log in as User A
2. ✅ **Window 2:** Log in as User B (private/incognito)
3. ✅ **Both:** Open console (Right-click + Cmd/Ctrl → Inspect)
4. ✅ **Both:** Check for errors (should be none)
5. ✅ **Window 1:** Click "Create Rectangle"
6. ✅ **Window 1:** Drag to create shape
7. ✅ **Window 2:** Should see shape appear within 1 second!

If Step 7 fails, check Firestore Database in Firebase Console to see if the shape was written.

---

## Still Not Working?

**Share with me:**
1. Console errors from both windows
2. Screenshot of Firebase Console → Firestore Database → Rules
3. Screenshot of Firestore Database data (canvases/global/shapes)
4. Which step in Quick Test fails?

I'll help you fix it! 🔧

