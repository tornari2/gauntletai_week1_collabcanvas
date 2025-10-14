import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CanvasProvider } from './context/CanvasContext'
import { PresenceProvider } from './context/PresenceContext'
import { usePresenceManager } from './hooks/usePresence'
import LoginModal from './components/LoginModal'
import Canvas from './components/Canvas'
import './App.css'

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

  // Show canvas if authenticated
  return (
    <div className="app authenticated">
      <Canvas />
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

