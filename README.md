# CollabCanvas

A real-time collaborative whiteboard application that enables multiple users to draw, manipulate shapes, and see each other's cursors in real-time.

## 🎨 Overview

CollabCanvas is a modern, web-based collaborative design tool built with React and Firebase. It provides a shared canvas where teams can work together in real-time, seeing each other's changes instantly.

## ✨ Features

### Core Functionality
- **Real-Time Collaboration:** See all users' changes instantly via Firebase Firestore
- **Shape Creation:** Draw rectangles on the canvas
- **Shape Manipulation:** Move, resize, and rotate shapes with intuitive controls
- **Canvas Navigation:** Pan and zoom to explore large canvases
- **User Authentication:** Secure login with Firebase Authentication

### Multiplayer Features
- **Live Cursors:** See colored cursor positions for all online users
- **User Presence:** View list of online users with color-coded indicators
- **Color Coding:** Each user has a unique color for cursors and selections
- **Auto-Cleanup:** Users automatically removed when they log out or close browser

### User Experience
- **Smooth Interactions:** Optimistic UI updates for instant feedback
- **Responsive Design:** Works on various screen sizes
- **Keyboard Shortcuts:** Delete shapes with Backspace/Delete key
- **Visual Feedback:** Selected shapes show colored borders

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Konva.js** - Canvas rendering and manipulation
- **Vite** - Build tool and dev server

### Backend & Services
- **Firebase Authentication** - User authentication
- **Firebase Firestore** - Persistent shape data storage
- **Firebase Realtime Database** - Real-time cursor tracking and presence
- **Firebase Hosting** - Deployment (optional)

### Styling
- **CSS3** - Custom styling with modern features
- **CSS Transitions** - Smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase account (free tier works fine)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gauntletai_week1_collabcanvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database (for persistent shape data)
   - Enable Realtime Database (for live cursors & presence)
     - Start in **test mode** or use the provided `database.rules.json`
   - Copy your Firebase configuration (including the Realtime Database URL)

4. **Configure environment**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   ```

5. **Deploy Security Rules**
   
   Deploy both Firestore and Realtime Database rules:
   ```bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   
   # Deploy Realtime Database rules
   firebase deploy --only database
   ```
   
   Or manually copy rules from:
   - `firestore.rules` → Firestore Rules in Firebase Console
   - `database.rules.json` → Realtime Database Rules in Firebase Console

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5174`

## 📖 Usage

### Getting Started
1. **Sign Up / Login** - Create an account or log in with existing credentials
2. **Create Shapes** - Click the "Rectangle" button in the toolbar, then click and drag on the canvas
3. **Manipulate Shapes:**
   - **Move:** Click and drag a shape
   - **Resize:** Select a shape to show resize handles, drag handles to resize
   - **Rotate:** Use the rotation handle (circular icon) above selected shapes
   - **Delete:** Select a shape and press `Backspace` or `Delete`
4. **Navigate Canvas:**
   - **Pan:** Click and drag on empty space
   - **Zoom:** Use mouse wheel to zoom in/out
5. **Collaborate:**
   - Open another browser window/profile and log in as a different user
   - See each other's cursors and changes in real-time
   - View online users in the top-right corner

### Keyboard Shortcuts
- `Backspace` / `Delete` - Delete selected shape
- Mouse wheel - Zoom in/out
- Click + Drag (empty space) - Pan canvas

## 📁 Project Structure

```
gauntletai_week1_collabcanvas/
├── src/
│   ├── components/         # React components
│   │   ├── Canvas.jsx      # Main canvas component (Konva)
│   │   ├── Cursor.jsx      # Remote user cursor component
│   │   ├── LoginModal.jsx  # Authentication UI
│   │   ├── Toolbar.jsx     # Shape creation toolbar
│   │   └── UserList.jsx    # Online users list
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx     # Authentication state
│   │   ├── CanvasContext.jsx   # Canvas/shapes state
│   │   └── PresenceContext.jsx # User presence state
│   ├── hooks/             # Custom React hooks
│   │   ├── useCursorSync.js   # Cursor position syncing
│   │   ├── usePresence.js     # User presence management
│   │   └── useShapeSync.js    # Shape data syncing
│   ├── styles/            # CSS files
│   ├── utils/             # Utility functions
│   │   ├── colorGenerator.js  # User color generation
│   │   ├── constants.js       # App constants
│   │   └── firebase.js        # Firebase configuration
│   ├── App.jsx            # Root component
│   └── index.jsx          # App entry point
├── firestore.rules        # Firestore security rules
├── database.rules.json    # Realtime Database security rules
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies
```

## 🔥 Firebase Setup

### Architecture: Hybrid Database Approach

This app uses **both** Firestore and Realtime Database for optimal performance:

**Firestore (Persistent Data)**
- **users/** - User profiles (displayName, colorHex, etc.)
- **canvases/global/shapes/** - All shape data (position, size, rotation, color)
- Optimized for: Complex queries, offline support, data persistence

**Realtime Database (Ephemeral/Live Data)**
- **presence/{userId}** - Online users and live cursor positions
- Optimized for: Real-time updates, automatic cleanup, high-frequency updates (~60fps)
- Key advantage: Built-in `.onDisconnect()` for automatic presence cleanup

### Why the Hybrid Approach?

- ⚡ **3x Faster Cursors**: RTDB latency ~50-150ms vs Firestore ~200-500ms
- 🧹 **Auto Cleanup**: RTDB automatically removes users on disconnect
- 💰 **Cost Efficient**: RTDB cheaper for frequent small updates
- 🎯 **Best of Both**: Firestore for queryable data, RTDB for real-time features

### Security Rules

**Firestore Rules** (`firestore.rules`)
- Authenticated users can read/write shapes
- Users can read/write their own profiles
- Prevents unauthorized access

**Realtime Database Rules** (`database.rules.json`)
- Authenticated users can read all presence data
- Users can only write their own presence data
- Validates data structure and types

## 🎯 Key Features Explained

### Real-Time Synchronization
- **Optimistic Updates:** Local changes appear instantly, then sync to Firebase
- **Conflict Resolution:** Last-write-wins strategy using server timestamps
- **Throttling:** Cursor updates at ~60fps (16ms intervals) via Realtime Database
- **Dual Database:** Firestore for shapes, RTDB for cursors/presence

### User Colors
- Each user gets a unique color based on their display name
- Colors are deterministic (same name = same color)
- Used for cursors, shape selections, and user list indicators

### Shape Management
- Shapes stored with metadata: owner, creation time, last modified time
- Full CRUD operations: Create, Read, Update, Delete
- Real-time listeners update all connected clients automatically

### Performance Optimizations
- Memoized components and context functions
- Throttled cursor and shape updates
- Efficient Firestore queries with indexed fields
- Minimal re-renders using React Context

## 🏗️ Development

### Build for Production
```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploy to Firebase Hosting
```bash
firebase deploy
```

### Deploy to Vercel
```bash
vercel
```

## 🔧 Configuration

### Canvas Settings
Edit `src/utils/constants.js`:
- `MIN_ZOOM` / `MAX_ZOOM` - Zoom limits
- `CANVAS_WIDTH` / `CANVAS_HEIGHT` - Canvas dimensions
- `CURSOR_THROTTLE_MS` - Cursor update frequency
- `SHAPE_UPDATE_THROTTLE_MS` - Shape update frequency

### Shape Defaults
- `DEFAULT_FILL_COLOR` - Default shape fill
- `DEFAULT_STROKE_COLOR` - Default shape border
- `MIN_SHAPE_SIZE` - Minimum allowed shape size

## 🐛 Known Limitations

- **Single Canvas:** Currently supports one global canvas (can be extended)
- **Rectangle Only:** Only rectangles supported (circles, lines can be added)
- **No Undo/Redo:** Shape changes are permanent
- **No Shape Layers:** All shapes on same layer (z-index)
- **No Text Labels:** Text annotations not yet implemented
- **No Export:** Can't export canvas as image (feature coming soon)

## 🛣️ Roadmap

- [ ] Add circle and line shape tools
- [ ] Implement undo/redo functionality
- [ ] Add text labels and annotations
- [ ] Export canvas as PNG/SVG
- [ ] Shape layering (bring forward/send back)
- [ ] Multiple canvas support
- [ ] Shape grouping and alignment tools
- [ ] Drawing tools (pen, highlighter)
- [ ] Templates and presets

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 👥 Authors

Built as part of GauntletAI Week 1 challenge.

## 🙏 Acknowledgments

- [Konva.js](https://konvajs.org/) - Canvas rendering library
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool

---

**Enjoy collaborating in real-time!** 🎨✨
