import React from 'react';
import '../styles/Cursor.css';

/**
 * Cursor component for rendering remote user cursors
 * Displays a colored SVG arrow with username label
 */
function Cursor({ x, y, displayName, colorHex }) {
  // Fallback values if data is missing
  const finalColor = colorHex || '#666666';
  const finalName = displayName || 'User';
  
  return (
    <div 
      className="remote-cursor" 
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {/* SVG Arrow Icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cursor-arrow"
      >
        <path
          d="M5.65376 12.3673L0 0L14.8654 15.0293L8.89865 16.1194L5.65376 12.3673Z"
          fill={finalColor}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Username Label */}
      <div 
        className="cursor-label"
        style={{
          backgroundColor: finalColor,
        }}
      >
        {finalName}
      </div>
    </div>
  );
}

export default Cursor;

