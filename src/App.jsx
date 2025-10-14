import React, { useState, useEffect } from 'react'
import { auth } from './utils/firebase'
import { onAuthStateChanged } from 'firebase/auth'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="app loading">
        <p>Loading...</p>
      </div>
    )
  }

  // Show login modal if not authenticated (will be implemented in PR 2)
  if (!user) {
    return (
      <div className="app">
        <div className="login-placeholder">
          <h1>CollabCanvas MVP</h1>
          <p>Login modal will appear here (PR 2)</p>
          <p className="note">Auth system ready, UI coming next</p>
        </div>
      </div>
    )
  }

  // Show canvas if authenticated (will be implemented in PR 4+)
  return (
    <div className="app authenticated">
      <div className="canvas-placeholder">
        <h1>Welcome, {user.email}!</h1>
        <p>Canvas will appear here (PR 4+)</p>
        <p className="note">You are authenticated and ready to collaborate</p>
      </div>
    </div>
  )
}

export default App

