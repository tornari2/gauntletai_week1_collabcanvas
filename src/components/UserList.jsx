import React from 'react';
import { usePresence } from '../context/PresenceContext';
import { useAuth } from '../context/AuthContext';
import '../styles/UserList.css';

/**
 * UserList component displays online users with colored dots
 * Shows current user with "(you)" label and includes logout button
 */
function UserList() {
  const { onlineUsers } = usePresence();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Online Users</h3>
        <span className="user-count">{onlineUsers.length}</span>
      </div>
      
      <div className="user-list-items">
        {onlineUsers.length === 0 ? (
          <div className="no-users">No users online</div>
        ) : (
          onlineUsers.map((user) => (
            <div key={user.userId} className="user-item">
              <div 
                className="user-color-dot" 
                style={{ backgroundColor: user.colorHex }}
              />
              <span className="user-name">
                {user.displayName}
                {user.userId === currentUser?.uid && (
                  <span className="user-you"> (you)</span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
      
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default UserList;

