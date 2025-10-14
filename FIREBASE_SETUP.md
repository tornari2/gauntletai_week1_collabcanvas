# Firebase Setup Guide

Follow these steps to create and configure your Firebase project for CollabCanvas.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `collabcanvas-mvp` (or your preferred name)
4. Choose whether to enable Google Analytics (optional for MVP)
5. Click **"Create project"**

## Step 2: Enable Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on **"Email/Password"** in the Sign-in method tab
4. Toggle **"Email/Password"** to **Enabled**
5. Click **"Save"**

## Step 3: Enable Firestore Database

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules later)
4. Select your preferred location (choose one close to your users)
5. Click **"Enable"**

## Step 4: Set Up Firestore Security Rules

1. In Firestore Database, click on the **"Rules"** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read all, write their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Canvas shapes - all authenticated users can read/write
    match /canvases/global/shapes/{shapeId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
    
    // Presence - users can read all, write their own
    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## Step 5: Get Firebase Configuration

1. Click on the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click on the **"</>** (Web) icon to add a web app
5. Register app name: `CollabCanvas Web`
6. **Do not check** "Also set up Firebase Hosting"
7. Click **"Register app"**
8. Copy the Firebase configuration object that appears

It will look something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "collabcanvas-mvp.firebaseapp.com",
  projectId: "collabcanvas-mvp",
  storageBucket: "collabcanvas-mvp.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 6: Create `.env` File

1. Copy the template file to create your `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual Firebase configuration from Step 5

3. Save the file

**Important**: Never commit this `.env` file to Git. It's already in `.gitignore`.

## Step 7: Test Firebase Connection

1. Stop the dev server if it's running (Ctrl+C)
2. Restart the dev server: `npm run dev`
3. Open the app in your browser (usually `http://localhost:5173`)
4. Open browser console (F12) and check for any Firebase errors
5. You should see the login placeholder with no errors

## Step 8: Initialize Firestore Collections

The collections will be created automatically when you first:
- Sign up a user (creates `users` collection)
- Create a shape (creates `canvases/global/shapes` collection)
- Log in (creates `presence` collection)

No manual setup needed!

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that your API key in `.env` is correct
- Ensure you're using `VITE_` prefix for environment variables

### "Missing or insufficient permissions"
- Check that Firestore security rules are published
- Ensure you're authenticated (logged in)

### "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Verify Firebase project is active and not disabled

### Environment variables not loading
- Restart the dev server after creating `.env`
- Ensure `.env` is in the project root directory
- Check that variable names start with `VITE_`

## Next Steps

Once Firebase is configured:
1. ✅ Test authentication (PR 2)
2. ✅ Build canvas components (PR 3-4)
3. ✅ Implement real-time sync (PR 9-10)
4. ✅ Deploy to production (PR 13)

---

**Need help?** Check the [Firebase Documentation](https://firebase.google.com/docs) or the main [README.md](./README.md)

