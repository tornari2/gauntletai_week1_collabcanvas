# FlowCanvas

A production-ready, real-time collaborative whiteboard application with advanced AI-powered features and intelligent conflict resolution. Built for teams to design, prototype, and collaborate seamlessly across distributed environments.

## 🎨 Overview

FlowCanvas is a modern web-based collaborative design tool that combines real-time multiplayer synchronization with AI assistance. Teams can work together on a shared infinite canvas with robust conflict resolution preventing editing conflicts, while an AI assistant helps create and manipulate shapes through natural language commands.

**Tech Stack:** React 18 • Konva.js • Firebase (Auth + Firestore + Realtime Database) • OpenAI GPT-4o mini • Vercel Serverless Functions

---

## ✨ Features

### Core Canvas Functionality
- **Multi-Shape Support:** Create and manipulate rectangles, diamonds, circles, arrows, and text
- **Intuitive Controls:** Click-and-drag creation, resize handles, rotation controls
- **Canvas Navigation:** Pan and zoom to explore large canvases (zooming via mouse wheel, panning via click-and-drag)
- **Multi-Selection:** Select multiple shapes with drag-select box or Shift+Click
- **Layer Management:** Control z-index with "Send to Front" and "Send to Back" operations
- **Keyboard Shortcuts:** Delete shapes with Backspace/Delete, multi-select with Shift

### Real-Time Multiplayer Features
- **Live Collaboration:** Changes propagate to all users in <100ms via Firebase Firestore
- **Cursor Presence:** See real-time cursor positions of all online users (~60fps updates)
- **User Presence List:** View all online collaborators with color-coded indicators
- **Automatic Cleanup:** User presence and locks removed on disconnect or browser close
- **Persistent State:** Canvas state stored permanently in Firestore
- **First-To-Select-Wins Locking:** Advanced conflict resolution system (see detailed section below)

### Intelligent Conflict Resolution System

FlowCanvas implements a **First-To-Select-Wins locking mechanism** that prevents editing conflicts in real-time:

#### How It Works

1. **Lock Acquisition:**
   - User A selects a shape → Selection broadcast to Firebase Realtime Database in ~10ms
   - User B receives the lock update in ~50-100ms → Shape marked as "locked by User A"
   - User B sees a colored dashed border around the locked shape (matching User A's color)

2. **Lock Enforcement:**
   - Locked shapes **cannot be clicked, selected, dragged, resized, or modified** by other users
   - Hover events disabled on locked shapes to prevent interaction
   - Visual feedback clearly indicates which user has control

3. **Lock Release:**
   - When User A deselects (clicks empty canvas) → Lock released immediately
   - When User A disconnects/closes browser → Lock auto-removed via Firebase `onDisconnect()`
   - Other users can now interact with the shape

#### Multi-Selection Protection

The system implements an **all-or-nothing policy** for multi-selection to prevent partial ownership conflicts:

- **Drag-Select Box:**
  - User draws a selection box around multiple shapes
  - System checks if **any** shape in the box is locked by another user
  - **If locked shapes found:** Entire selection operation aborted (nothing selected)
  - **If all shapes available:** All shapes in box successfully selected
  - Prevents scenarios where user partially owns a group

- **Shift+Click:**
  - Automatically filters out locked shapes
  - Only unlocked shapes added to selection
  - More granular control for power users

#### Edge Cases Handled

- **Network Disconnect:** Locks released via Firebase `onDisconnect()` callback
- **Browser Crash:** Presence cleanup within ~30 seconds (Firebase timeout)
- **Simultaneous Selection:** Firebase write ordering resolves conflicts (sub-millisecond resolution)
- **Partial Multi-Select:** All-or-nothing policy prevents split ownership
- **Race Conditions:** First write to Firebase wins, later attempts see lock and abort

#### Technical Implementation

- **Lock Storage:** Firebase Realtime Database (`presence/{userId}/selectedShapeIds`)
- **Lock Check Function:** `isShapeLockedByOtherUser(shapeId)` checks `remoteSelections` from `PresenceContext`
- **Visual Indicators:** Colored dashed borders (5px dash, 3px gap) matching user's assigned color
- **Performance:** Lock checks use memoized callbacks, minimal performance impact

### Advanced Customization Panel

- **Color Control:** HSL-based color picker with live preview for fills and borders
- **Opacity Management:** Adjust transparency from 10-100% (minimum 10% for arrows/text visibility)
- **Border Styling:** Choose thickness (1-10px) and style (solid, dashed, dotted)
- **Text Formatting:**
  - Font families: Arial, Helvetica, Times New Roman, Courier New, Georgia, Verdana
  - Font sizes: Small (16px), Medium (24px), Large (32px), Extra Large (48px)
  - Font weights: Normal, Bold, Light, Semi-Bold
  - Font styles: Normal, Italic
  - Text decorations: None, Underline, Line-through
- **Layer Defaults:** Set whether new shapes appear on front or back layer
- **Persistent Settings:** Customizations automatically apply to all newly created shapes

### AI-Powered Canvas Assistant

FlowCanvas includes an intelligent AI assistant powered by OpenAI GPT-4o mini that understands natural language commands and helps you create and manipulate shapes.

#### 🚨 Important: Selection Requirement for Modifications

**To modify, move, resize, rotate, delete, or duplicate existing shapes, you MUST select them on the canvas first.** The AI cannot directly target shapes by description alone for modification operations. This design ensures:

- **Explicit User Intent:** You control exactly which shapes are affected
- **Conflict Prevention:** Works seamlessly with the locking system
- **Visual Feedback:** You see what will be modified before giving commands

**Workflow Example:**
```
1. Click a shape on the canvas to select it (or select multiple with Shift+Click or drag-box)
2. Open AI chat panel
3. Give command: "Make this red" or "Move this to the center" or "Rotate 45 degrees"
4. AI modifies the selected shape(s)
```

#### AI Capabilities

**1. Create Operations (No Selection Required)**
- **Basic Shapes:** "Create a red rectangle at 200,100" or "Make a blue circle in the center"
- **Arrows:** "Draw an arrow from 100,100 to 300,300"
- **Text Content:** "Write 'Hello World' in large font" or "Create a title that says 'Project Roadmap'"
- **Creative Content:** "Write an inspirational quote" or "Create a poem about collaboration"
- **Complex Templates:**
  - Login forms: "Make a login form"
  - Navigation bars: "Create a navigation bar with Home, About, Services, Contact"
  - Card layouts: "Design a card layout with title and description"
  - Button groups: "Create 3 buttons side by side"

**2. Modify Operations (Selection Required ⚠️)**
- **Move:** "Move this to the center" or "Move 100 pixels to the right"
- **Resize:** "Make this twice as big" or "Resize to 200x150"
- **Rotate:** "Rotate 45 degrees" or "Rotate to 90 degrees"
- **Color Changes:** "Change the fill to blue" or "Make the border green"
- **Style Changes:** "Make the border thicker" or "Change to dashed border"
- **Opacity:** "Make this 50% transparent"

**3. Delete Operations (Selection Required ⚠️)**
- "Delete this shape" or "Remove the selected shapes"

**4. Duplicate Operations (Selection Required ⚠️)**
- "Duplicate this" or "Make a copy offset by 50 pixels"

**5. Arrange Operations (Selection Required ⚠️)**
- "Arrange these horizontally with 100px spacing"
- "Distribute these vertically"

**6. Grid Creation (No Selection Required)**
- "Create a 3x3 grid of blue squares"
- "Make a 2x4 grid of circles with 50px spacing"

#### AI System Features

- **Context-Aware:** AI knows about canvas dimensions and centers
- **Conversation Memory:** Follow-up commands reference previous context
- **Visual Feedback:** Real-time results display (created/modified shape counts)
- **Error Handling:** Clear error messages if operations fail
- **Smart Positioning:** Keywords like "center", "top-left", "bottom-right" work automatically
- **Intelligent Spacing:** AI automatically spaces multiple shapes to avoid overlap

#### Example Commands

```
# Creating shapes (no selection needed)
"Create a red rectangle at 100,100"
"Make 5 blue circles in a horizontal line"
"Write 'Welcome' in large bold text at the center"
"Draw an arrow pointing right"
"Make a login form"
"Create a 3x3 grid of blue squares"
"Make a 2x4 grid of red circles"

# Modifying shapes (must select first!)
[Select shape] → "Make this red"
[Select shape] → "Move to the center"
[Select multiple] → "Arrange these horizontally"
[Select shape] → "Rotate 90 degrees"
[Select shape] → "Duplicate this 3 times"
```

### Performance Optimizations

- **Memoized Components:** Reduced re-renders using React.memo and useCallback
- **Throttled Updates:** Cursor updates at ~60fps (16ms), shape transforms throttled
- **Code Splitting:** Manual chunks for Firebase, Konva, and React vendor libraries
- **Efficient Queries:** Firestore queries optimized with indexed fields
- **Build Optimization:** Terser minification with dead code elimination
- **Lazy Loading:** Components loaded on-demand

---

## 🏗️ Architecture

### System Architecture Overview

FlowCanvas uses a **hybrid database architecture** that leverages the strengths of both Firestore and Realtime Database:

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │  Canvas    │  │  AI Chat   │  │  Customization │   │
│  │  (Konva)   │  │   Panel    │  │     Panel      │   │
│  └────────────┘  └────────────┘  └────────────────┘   │
│         │               │                  │            │
│  ┌──────┴───────────────┴──────────────────┴──────┐   │
│  │            Context Providers                     │   │
│  │  • AuthContext  • CanvasContext                 │   │
│  │  • PresenceContext  • AIContext                 │   │
│  └──────────────────┬──────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐   ┌───▼────┐   ┌───▼─────────┐
   │Firebase │   │Firebase│   │   Vercel    │
   │  Auth   │   │Firestore│   │ Serverless  │
   └─────────┘   └────────┘   │  (OpenAI)   │
                               └─────────────┘
   ┌────────────┐
   │  Firebase  │
   │  Realtime  │
   │  Database  │
   └────────────┘
```

### Database Architecture: Hybrid Approach

#### **Firestore** (Persistent Data)
Used for data that needs to persist indefinitely:

- **`users/` collection:** User profiles (displayName, colorHex, createdAt)
- **`canvases/global/shapes/` collection:** All shape data
  - Shape properties: position (x, y), dimensions, rotation, colors, text content
  - Metadata: ownerId, createdAt, updatedAt, lastModifiedBy
  - Z-index for layering control

**Why Firestore:**
- ✅ Complex queries and filtering
- ✅ Offline support and sync
- ✅ Strong consistency for persistent data
- ✅ Automatic data persistence

#### **Realtime Database** (Ephemeral Data)
Used for data that changes frequently and should auto-cleanup:

- **`presence/{userId}/` nodes:**
  - `cursorX`, `cursorY`: Cursor position (~60fps updates)
  - `selectedShapeIds`: Array of currently selected shape IDs (for locking)
  - `displayName`, `colorHex`: User identity
  - `lastSeen`: Timestamp for connection monitoring

**Why Realtime Database:**
- ⚡ **3x Faster:** ~50-150ms latency vs Firestore's ~200-500ms
- 🔒 **Instant Lock Broadcasting:** Selection locks in <100ms
- 🧹 **Auto Cleanup:** `.onDisconnect()` removes data when user leaves
- 💰 **Cost Efficient:** Cheaper for high-frequency small updates
- 🎯 **Real-Time Optimized:** Built for cursor tracking and presence

### Component Architecture

#### **Context Providers**

1. **AuthContext** (`src/context/AuthContext.jsx`)
   - Manages Firebase Authentication state
   - Provides: `currentUser`, `login()`, `signup()`, `logout()`
   - Creates user profile in Firestore on signup

2. **CanvasContext** (`src/context/CanvasContext.jsx`)
   - Manages canvas state: shapes, selection, customization settings
   - Provides: `shapes`, `addShape()`, `updateShape()`, `deleteShape()`
   - Syncs with Firestore for persistence
   - Handles z-index management

3. **PresenceContext** (`src/context/PresenceContext.jsx`)
   - Manages user presence and remote cursors
   - Provides: `onlineUsers`, `remoteCursors`, `remoteSelections`
   - Syncs with Realtime Database
   - Handles automatic cleanup on disconnect

4. **AIContext** (`src/context/AIContext.jsx`)
   - Manages AI chat state and API calls
   - Provides: `messages`, `sendMessage()`, `isProcessing`
   - Maintains conversation history for context
   - Executes operations returned by AI

5. **CanvasViewportContext** (`src/context/CanvasViewportContext.jsx`)
   - Manages canvas viewport state (zoom, pan)
   - Provides: `scale`, `position`, `updateZoom()`, `updatePosition()`

#### **Custom Hooks**

- **`useCursorSync`** (`src/hooks/useCursorSync.js`): Syncs local cursor to Realtime Database
- **`usePresence`** (`src/hooks/usePresence.js`): Manages presence lifecycle (join/leave)
- **`useShapeSync`** (`src/hooks/useShapeSync.js`): Syncs shapes with Firestore
- **`useShapePreviewSync`** (`src/hooks/useShapePreviewSync.js`): Broadcasts shape creation previews
- **`useTransformSync`** (`src/hooks/useTransformSync.js`): Syncs shape transformations

#### **Key Components**

- **Canvas** (`src/components/Canvas.jsx`): Main Konva canvas with all shape rendering and interaction logic
- **AIChatPanel** (`src/components/AIChatPanel.jsx`): AI chat interface with example commands
- **CustomizationPanel** (`src/components/CustomizationPanel.jsx`): Shape customization controls
- **Toolbar** (`src/components/Toolbar.jsx`): Shape creation tools
- **UserList** (`src/components/UserList.jsx`): Online users display
- **LoginModal** (`src/components/LoginModal.jsx`): Authentication UI

### Data Flow

**Creating a Shape:**
```
1. User clicks and drags on canvas
2. Canvas component creates shape locally (optimistic update)
3. Canvas calls addShape() from CanvasContext
4. CanvasContext writes to Firestore
5. Firestore listeners trigger on all connected clients
6. Other users see the new shape appear
```

**Cursor Movement:**
```
1. User moves mouse on canvas
2. useCursorSync hook throttles updates (16ms)
3. Cursor position written to Realtime Database
4. Realtime Database broadcasts to all clients (~50ms)
5. PresenceContext updates remoteCursors
6. Cursor components re-render with new positions
```

**AI Command Execution:**
```
1. User types command in AI chat
2. AIContext sends request to /api/ai-chat Vercel function
3. Vercel function calls OpenAI API with system prompt
4. OpenAI returns JSON operations
5. AIContext executes operations via commandExecutor
6. commandExecutor calls CanvasContext methods
7. Changes sync to Firestore → all users see results
```

### Security Architecture

- **Authentication:** Firebase Auth with email/password (extendable to OAuth)
- **Firestore Rules:** Authenticated users can read/write shapes and their own profile
- **Realtime Database Rules:** Authenticated users can read all presence, write only their own
- **API Security:** Vercel serverless functions keep OpenAI API key server-side
- **Input Validation:** Shape data validated on both client and Firebase rules

---

## 📦 Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework with hooks and Context API |
| `react-dom` | ^18.3.1 | React DOM rendering |
| `react-konva` | ^18.2.14 | React bindings for Konva canvas library |
| `konva` | ^10.0.2 | High-performance 2D canvas library |
| `firebase` | ^12.4.0 | Auth, Firestore, Realtime Database client |
| `openai` | ^6.5.0 | OpenAI API client for serverless functions |
| `uuid` | ^13.0.0 | Generate unique IDs for shapes |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^6.0.11 | Build tool and dev server with HMR |
| `@vitejs/plugin-react` | ^4.3.4 | React plugin for Vite with Fast Refresh |
| `terser` | ^5.44.0 | JavaScript minifier for production builds |

### Backend Services

- **Firebase Authentication:** User authentication and session management
- **Firebase Firestore:** Persistent shape data storage
- **Firebase Realtime Database:** Live cursor tracking and presence
- **Vercel Serverless Functions:** Backend API for OpenAI integration
- **OpenAI API:** GPT-4o mini for natural language command parsing

---

## 🚀 Setup and Installation

### Prerequisites

- **Node.js:** Version 16 or higher
- **npm:** Version 7 or higher
- **Firebase Account:** Free tier works perfectly
- **OpenAI API Key:** For AI features (has free trial, then paid)
- **Vercel Account:** For deployment (free tier available)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd gauntletai_week1_collabcanvas
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`.

### Step 3: Firebase Setup

#### 3.1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the wizard
3. Give your project a name (e.g., "FlowCanvas")
4. Disable Google Analytics (optional, not needed for this app)

#### 3.2: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

#### 3.3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll deploy rules next)
4. Select a location (choose closest to your users)
5. Click "Enable"

#### 3.4: Create Realtime Database

1. In Firebase Console, go to **Realtime Database**
2. Click "Create Database"
3. Choose **Start in locked mode** (we'll deploy rules next)
4. Select a location (ideally same as Firestore)
5. Click "Enable"
6. **Important:** Copy the database URL (format: `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com`)

#### 3.5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **</>** (web) icon to add a web app
4. Register app with a nickname (e.g., "FlowCanvas Web")
5. Copy the `firebaseConfig` object
6. **Important:** Also note the Realtime Database URL from step 3.4

#### 3.6: Deploy Firebase Security Rules

##### Option A: Using Firebase CLI (Recommended)

```bash
# Install Firebase CLI globally (first time only)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore (to deploy firestore.rules)
# - Realtime Database (to deploy database.rules.json)
# - Use existing project → select your project
# - Accept default file paths

# Deploy rules
firebase deploy --only firestore:rules,database
```

##### Option B: Manual Copy-Paste

**Firestore Rules:**
1. Open `firestore.rules` in your project
2. Copy the entire contents
3. In Firebase Console → Firestore Database → Rules tab
4. Paste and click "Publish"

**Realtime Database Rules:**
1. Open `database.rules.json` in your project
2. Copy the entire contents
3. In Firebase Console → Realtime Database → Rules tab
4. Paste and click "Publish"

### Step 4: OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Navigate to "API keys" section
4. Click "Create new secret key"
5. Give it a name (e.g., "FlowCanvas")
6. Copy the key immediately (you can't see it again!)

### Step 5: Environment Configuration

Create a `.env` file in the project root directory:

```bash
# Firebase Configuration (from Step 3.5)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# OpenAI Configuration (from Step 4)
OPENAI_API_KEY=sk-your-openai-api-key

# Production URL (leave blank for now, set after first deployment)
VITE_PRODUCTION_URL=
```

**Important Notes:**
- Variables prefixed with `VITE_` are exposed to the browser (public)
- `OPENAI_API_KEY` without `VITE_` prefix stays server-side only
- Never commit `.env` to version control (it's in `.gitignore`)

### Step 6: Running Locally

#### Option A: Basic Development (Without AI Features)

```bash
npm run dev
```

- Opens at `http://localhost:5173` (or next available port)
- All features work EXCEPT AI chat panel
- AI chat will show "Failed to fetch" errors (because serverless function not running)
- Perfect for frontend development and testing core features

#### Option B: Full Development (With AI Features)

```bash
# First time only: login to Vercel
npx vercel login

# Run development server with serverless functions
npx vercel dev
```

- Opens at `http://localhost:3000`
- All features work, including AI chat
- Serverless functions run locally
- Simulates production environment

**Note:** For `vercel dev` to work with AI features, you need `OPENAI_API_KEY` in your `.env` file.

### Step 7: Deployment to Production

#### 7.1: Deploy to Vercel

```bash
# First deployment (follow prompts)
npx vercel

# Prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: flowcanvas (or your choice)
# - Directory: ./ (current directory)
# - Override settings? No

# After deployment, copy the production URL
```

#### 7.2: Set Production Environment Variables

```bash
# Set environment variables on Vercel
npx vercel env add OPENAI_API_KEY

# When prompted:
# - Value: paste your OpenAI API key
# - Environment: Production

# Add Firebase variables (repeat for each)
npx vercel env add VITE_FIREBASE_API_KEY
# ... (repeat for all VITE_FIREBASE_* variables)
```

**Or use Vercel Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add each variable from your `.env` file
5. Make sure to select "Production" environment

#### 7.3: Update Local .env with Production URL

```bash
# Edit .env file
VITE_PRODUCTION_URL=https://your-app-name.vercel.app
```

This makes local AI chat use production API (useful for `npm run dev` without Vercel).

#### 7.4: Redeploy with Environment Variables

```bash
npx vercel --prod
```

Your app is now live! 🎉

### Verification Checklist

After setup, verify everything works:

- [ ] Can sign up with email/password
- [ ] Can login and see canvas
- [ ] Can create shapes (rectangle, circle, diamond, arrow, text)
- [ ] Can move, resize, rotate shapes
- [ ] Open another browser/incognito window, login as different user
- [ ] Can see other user's cursor moving in real-time
- [ ] Can see other user's shapes appear instantly
- [ ] Selecting a shape in one window shows colored border in other window
- [ ] Cannot select shapes that are selected by other user
- [ ] AI chat panel opens (click robot icon bottom-right)
- [ ] AI commands work (try "Create a red circle")
- [ ] Close one browser → user disappears from user list in other browser

---

## 📖 Usage Guide

### Getting Started

1. **Authentication:**
   - Open the app URL
   - Click "Sign Up" and create an account
   - Or use "Log In" if you have an existing account

2. **Canvas Navigation:**
   - **Pan:** Click and drag on empty space
   - **Zoom:** Use mouse wheel (scroll up = zoom in, scroll down = zoom out)
   - Current zoom level shown in top-left

3. **Creating Shapes:**
   - **Rectangle/Diamond/Circle:** Click toolbar button → click and drag on canvas
   - **Arrow:** Click arrow button → click and drag from start to end point
   - **Text:** Double-click anywhere on canvas → type → click outside to finish

4. **Selecting Shapes:**
   - **Single Selection:** Click on a shape
   - **Multi-Selection Box:** Click and drag on empty canvas to create selection box
   - **Add to Selection:** Hold Shift and click additional shapes
   - **Deselect:** Click on empty canvas

5. **Manipulating Shapes:**
   - **Move:** Click and drag a selected shape
   - **Resize:** Drag the corner/edge handles on selected shapes
   - **Rotate:** Drag the circular rotation handle above selected shapes
   - **Delete:** Select shape(s) and press `Backspace` or `Delete` key

6. **Customizing Shapes:**
   - Open the Customization Panel (right side of screen)
   - Adjust color, opacity, border, text formatting
   - Settings apply to newly created shapes
   - To modify existing shapes: select them first, then adjust settings

7. **Using AI Assistant:**
   - Click the robot icon (🤖) in bottom-right corner
   - Try example commands or type your own
   - **To modify existing shapes:** Select them first, then give command
   - See "AI-Powered Canvas Assistant" section for full capabilities

8. **Collaboration:**
   - Share the app URL with teammates
   - Each person logs in with their own account
   - See each other's cursors and shapes in real-time
   - Locked shapes show colored borders (you cannot select them)

### Keyboard Shortcuts

- `Backspace` / `Delete` - Delete selected shape(s)
- `Shift + Click` - Add/remove shapes from multi-selection
- `Double-Click` (on empty canvas) - Create text
- `Mouse Wheel` - Zoom in/out
- `Click + Drag` (on empty canvas) - Pan canvas

### Understanding Visual Indicators

- **Blue Border (Solid):** Shape(s) you have selected
- **Colored Border (Dashed):** Shape(s) locked by another user
  - Border color matches that user's cursor color
  - You cannot interact with these shapes
- **User Cursors:** Colored arrows with usernames showing where others are pointing
- **User List:** Colored dots match cursor colors

---

## 🐛 Troubleshooting

### AI Features Not Working

**Symptom:** Clicking robot icon shows errors, or commands return "Failed to fetch"

**Solutions:**

1. **Local Development (npm run dev):**
   - Set `VITE_PRODUCTION_URL` in `.env` to your deployed Vercel app URL
   - Or use `npx vercel dev` instead to run serverless functions locally

2. **Production Deployment:**
   - Ensure `OPENAI_API_KEY` is set in Vercel environment variables
   - Check Vercel function logs: Dashboard → Your Project → Functions → Logs
   - Verify `/api/ai-chat` endpoint returns 200 status

3. **OpenAI API Issues:**
   - Check your OpenAI API key is valid
   - Ensure you have credits available (check billing)
   - Verify API key has correct permissions

### Presence/Cursors Not Showing

**Symptom:** Cannot see other users' cursors or online status

**Solutions:**

1. **Check Realtime Database URL:**
   - Verify `VITE_FIREBASE_DATABASE_URL` in `.env` is correct
   - Should be format: `https://PROJECT-ID-default-rtdb.firebaseio.com`
   - Must include full URL with `https://`

2. **Check Realtime Database Rules:**
   - Go to Firebase Console → Realtime Database → Rules
   - Verify rules match `database.rules.json`
   - Rules should allow authenticated users to read `presence/*`

3. **Check Authentication:**
   - Ensure both users are logged in
   - Check browser console for connection errors

4. **Browser Console Debugging:**
   - Open developer tools (F12)
   - Look for Firebase connection errors
   - Check Network tab for failed requests to `.firebaseio.com`

### Shapes Not Syncing

**Symptom:** Creating shapes in one browser doesn't show in another

**Solutions:**

1. **Check Firestore Rules:**
   - Go to Firebase Console → Firestore → Rules
   - Verify rules match `firestore.rules`
   - Ensure authenticated users can read/write `canvases/global/shapes`

2. **Check Authentication:**
   - Verify both users are logged in
   - Check browser console for permission errors

3. **Check Firestore Connection:**
   - Open browser console (F12)
   - Look for Firestore errors
   - Verify shapes appear in Firestore Database (Firebase Console)

4. **Clear Browser Cache:**
   - Sometimes stale service workers cause issues
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Cannot Select Shapes

**Symptom:** Clicking shapes doesn't select them

**Solutions:**

1. **Check if Locked by Another User:**
   - Shapes with colored dashed borders are locked
   - Wait for other user to deselect
   - Or ask them to click away from the shape

2. **Check Zoom Level:**
   - Very small zoom levels might make shapes hard to click
   - Zoom in closer to the shapes

3. **Check Layer Order:**
   - Another shape might be covering it
   - Try selecting nearby shapes

### Build/Deployment Errors

**Symptom:** `npm run build` or Vercel deployment fails

**Solutions:**

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 16+
   ```

3. **Check for dependency conflicts:**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Vercel deployment issues:**
   - Check build logs in Vercel Dashboard
   - Ensure all environment variables are set
   - Verify `vercel.json` configuration is correct

### Performance Issues

**Symptom:** Canvas feels slow or laggy

**Solutions:**

1. **Reduce shape count:** 50-100 shapes is recommended, 500+ may cause slowdown
2. **Check browser:** Chrome/Edge recommended for best performance
3. **Disable browser extensions:** Some extensions interfere with canvas rendering
4. **Check network connection:** Slow connection affects real-time sync
5. **Close other tabs:** Canvas uses GPU acceleration (memory-intensive)

---

## 🔐 Security Best Practices

This app implements production-ready security:

### Authentication
- ✅ Firebase Authentication with secure token-based sessions
- ✅ Passwords hashed and managed by Firebase (never stored in plain text)
- ✅ Session persistence with automatic token refresh
- ✅ Proper logout clears all session data

### Database Security
- ✅ Firestore security rules enforce authenticated-only access
- ✅ Realtime Database rules enforce authenticated-only access
- ✅ Users can only modify their own presence data
- ✅ Input validation prevents malformed data

### API Security
- ✅ OpenAI API key stored server-side only (Vercel environment variables)
- ✅ No API keys exposed to browser
- ✅ CORS headers configured properly
- ✅ Rate limiting handled by Firebase and Vercel

### Best Practices
- ✅ `.env` file in `.gitignore` (never commit secrets)
- ✅ Environment variables for all sensitive data
- ✅ XSS protection via React's built-in escaping
- ✅ HTTPS enforced in production (Vercel default)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- [Konva.js](https://konvajs.org/) - Powerful 2D canvas library
- [Firebase](https://firebase.google.com/) - Backend infrastructure (Auth, Firestore, Realtime Database)
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Lightning-fast build tool
- [OpenAI](https://openai.com/) - AI-powered natural language processing
- [Vercel](https://vercel.com/) - Seamless serverless deployment

---

## 👥 Authors

Built as part of **GauntletAI Week 1 Challenge** - Real-time collaborative canvas with AI features.

---

**Ready to collaborate? Start creating together with FlowCanvas!** 🎨✨🤖
