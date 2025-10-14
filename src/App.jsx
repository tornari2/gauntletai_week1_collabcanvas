import React from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginModal from './components/LoginModal'

function AppContent() {
  const { currentUser, userProfile, loading } = useAuth()

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
      <AppContent />
    </AuthProvider>
  )
}

export default App

