import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginModal.css';

function LoginModal() {
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    if (isSignup && !displayName) {
      setLocalError('Display name is required for signup');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      // Success - AuthContext will handle state update
    } catch (err) {
      // Parse Firebase error messages
      let errorMessage = err.message;
      
      if (errorMessage.includes('email-already-in-use')) {
        errorMessage = 'Email already in use. Please login or use a different email.';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = 'Invalid email address.';
      } else if (errorMessage.includes('weak-password')) {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (errorMessage.includes('user-not-found')) {
        errorMessage = 'No account found with this email. Please sign up.';
      } else if (errorMessage.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage.includes('too-many-requests')) {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setLocalError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <h1 className="login-modal-title">CollabCanvas</h1>
        <p className="login-modal-subtitle">
          Real-time collaborative canvas
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>

          {localError && (
            <div className="error-message">
              {localError}
            </div>
          )}

          {isSignup && (
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
            <small className="form-hint">Minimum 6 characters</small>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>

          <div className="toggle-mode">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={toggleMode}
                  className="toggle-button"
                  disabled={isSubmitting}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={toggleMode}
                  className="toggle-button"
                  disabled={isSubmitting}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;

