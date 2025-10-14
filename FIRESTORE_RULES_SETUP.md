# Firestore Security Rules Setup

## Problem
If shapes are not syncing between users, it's likely because Firestore security rules are blocking reads/writes.

## Solution: Deploy Firestore Rules

### Option 1: Firebase Console (Recommended - Fastest)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Rules:**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top

3. **Replace the rules with the following:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Presence collection - users can write their own presence, read all
    match /presence/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Canvas metadata (global canvas)
    match /canvases/{canvasId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
      
      // Shapes subcollection - all authenticated users can read/write
      match /shapes/{shapeId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated();
        allow delete: if isAuthenticated();
      }
    }
  }
}
```

4. **Click "Publish"**

5. **Test immediately:**
   - Refresh your browser windows
   - Try creating a shape
   - It should now sync across both windows!

### Option 2: Firebase CLI

If you have Firebase CLI installed:

```bash
# Login to Firebase (if not already)
firebase login

# Initialize Firestore (if not already)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

The rules are already in `firestore.rules` file.

## What These Rules Do

### Security Model
- **Authenticated users only:** All operations require authentication
- **Users collection:** Users can read all profiles, but only write their own
- **Presence collection:** Users can read all presence, but only manage their own
- **Shapes collection:** All authenticated users can create/read/update/delete shapes

### Why This Works for MVP
- Simple and permissive for authenticated users
- Prevents unauthenticated access
- All authenticated users can collaborate on the global canvas
- No complex authorization logic needed

## Testing After Deployment

1. **Clear browser console errors:**
   - Open DevTools (F12)
   - Clear console
   - Create a shape

2. **Verify sync:**
   - Create a shape in Window 1
   - Should appear in Window 2 within 100ms

3. **Check for errors:**
   - If still seeing "Permission denied" → rules not deployed yet
   - If no errors and sync works → Success! ✅

## Troubleshooting

### Still seeing "Permission denied"?
- Make sure you clicked "Publish" in Firebase Console
- Wait 30 seconds for rules to propagate
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Rules deployed but still not syncing?
- Check browser console for other errors
- Verify both users are authenticated (logged in)
- Check Firestore Database in Firebase Console to see if documents are being created

### Want to verify rules are active?
1. Go to Firebase Console > Firestore Database > Rules
2. You should see the rules with a "Last deployed" timestamp
3. The rules should match the content above

## Current Status

**These rules allow:**
- ✅ All authenticated users to read all shapes
- ✅ All authenticated users to create shapes
- ✅ All authenticated users to update any shape
- ✅ All authenticated users to delete any shape
- ✅ Multi-user collaboration on global canvas

**These rules block:**
- ❌ Unauthenticated (logged out) users from any operations
- ❌ Users from editing other users' profiles
- ❌ Users from editing other users' presence

Perfect for MVP collaborative canvas! 🎨

