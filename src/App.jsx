import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CanvasProvider } from './context/CanvasContext'
import { PresenceProvider } from './context/PresenceContext'
import { AIProvider, useAI } from './context/AIContext'
import { CanvasViewportProvider } from './context/CanvasViewportContext'
import { LegendProvider } from './context/LegendContext'
import { usePresenceManager } from './hooks/usePresence'
import LoginModal from './components/LoginModal'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import UserList from './components/UserList'
import CustomizationPanel from './components/CustomizationPanel'
import AIChatPanel from './components/AIChatPanel'
import './App.css'

function AppContent() {
  const { currentUser, userProfile, loading } = useAuth()
  const { setUserPresence, removeUserPresence } = usePresenceManager()
  const { togglePanel } = useAI()

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

  // Add keyboard shortcut to toggle AI panel with 'A' key
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only toggle if not typing in an input/textarea
      if (e.key === 'a' || e.key === 'A') {
        const isTyping = e.target.tagName === 'INPUT' || 
                        e.target.tagName === 'TEXTAREA' || 
                        e.target.isContentEditable
        
        if (!isTyping) {
          e.preventDefault()
          togglePanel()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [togglePanel])

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
      <Toolbar />
      <UserList />
      <CustomizationPanel />
      <AIChatPanel />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <PresenceProvider>
        <CanvasProvider>
          <CanvasViewportProvider>
            <LegendProvider>
              <AIProvider>
                <AppContent />
              </AIProvider>
            </LegendProvider>
          </CanvasViewportProvider>
        </CanvasProvider>
      </PresenceProvider>
    </AuthProvider>
  )
}

export default App

