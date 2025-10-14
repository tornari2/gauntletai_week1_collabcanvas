import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CanvasProvider } from './context/CanvasContext'
import { PresenceProvider } from './context/PresenceContext'
import { usePresenceManager } from './hooks/usePresence'
import LoginModal from './components/LoginModal'

function AppContent() {
  const { currentUser, userProfile, loading } = useAuth()
  const { setUserPresence, removeUserPresence } = usePresenceManager()

  // Initialize user presence when logged in
  useEffect(() => {
    if (currentUser && userProfile) {
      setUserPresence()
      
      // Cleanup presence on browser close
      const handleBeforeUnload = () => {
        removeUserPresence()
      }
      
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        removeUserPresence()
      }
    }
  }, [currentUser, userProfile, setUserPresence, removeUserPresence])

  if (loading) {
    return (
      <div className="app loading">
        <p>Loading...</p>
      </div>
    )
  }

  // Show login modal if not authenticated
  if (!currentUser) {
    return (
      <div className="app">
        <LoginModal />
      </div>
    )
  }

  // Show canvas placeholder if authenticated (will be replaced in PR 4+)
  return (
    <div className="app authenticated">
      <div className="canvas-placeholder">
        <h1>Welcome, {userProfile?.displayName || currentUser.email}!</h1>
        <p className="note">Canvas will appear here (PR 4+)</p>
        <div style={{ marginTop: '1rem' }}>
          <p>Your color: <span style={{ 
            display: 'inline-block',
            width: '20px',
            height: '20px',
            backgroundColor: userProfile?.colorHex,
            borderRadius: '50%',
            verticalAlign: 'middle',
            marginLeft: '8px'
          }}></span></p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <PresenceProvider>
        <CanvasProvider>
          <AppContent />
        </CanvasProvider>
      </PresenceProvider>
    </AuthProvider>
  )
}

export default App

