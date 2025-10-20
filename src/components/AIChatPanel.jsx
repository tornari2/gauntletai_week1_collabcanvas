import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import '../styles/AIChatPanel.css';

function AIChatPanel() {
  const { messages, isProcessing, isPanelOpen, togglePanel, sendMessage, clearMessages } = useAI();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleClose = () => {
    clearMessages();
    togglePanel();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isPanelOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPanelOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const exampleCommands = [
    "Write an inspirational quote",
    "Create a red circle at the center",
    "Make a 3x3 grid of blue squares",
    "Make a login form",
  ];

  const handleExampleClick = (command) => {
    setInputValue(command);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`ai-chat-panel ${isPanelOpen ? 'open' : ''}`}>
      {/* Chat Panel */}
      {isPanelOpen && (
        <div className="ai-chat-container">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <span className="ai-icon">🤖</span>
              <span>AI Canvas Assistant</span>
            </div>
            <button 
              className="ai-close-btn"
              onClick={handleClose}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.length === 0 ? (
              <div className="ai-welcome">
                <h3>👋 Welcome!</h3>
                <p>I can help you create and manipulate shapes on the canvas using natural language.</p>
                
                <div className="ai-examples">
                  <p className="ai-examples-title">Try these commands:</p>
                  {exampleCommands.map((command, index) => (
                    <button
                      key={index}
                      className="ai-example-btn"
                      onClick={() => handleExampleClick(command)}
                    >
                      {command}
                    </button>
                  ))}
                </div>

                <div className="ai-capabilities" style={{marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px'}}>
                  <p className="ai-capabilities-title">💡 Tips:</p>
                  <ul>
                    <li>📌 <strong>To modify existing shapes:</strong> Select them on the canvas first, then tell me what to change</li>
                    <li>🔄 <strong>Start a new chat:</strong> Close this window (click ✕) to clear the conversation history</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`ai-message ${message.role} ${message.error ? 'error' : ''}`}
                  >
                    <div className="ai-message-header">
                      <span className="ai-message-role">
                        {message.role === 'user' ? '👤 You' : '🤖 AI'}
                      </span>
                      <span className="ai-message-time">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div className="ai-message-content">
                      {message.content}
                    </div>
                    {message.results && (
                      <div className="ai-message-results">
                        {message.results.createdShapes.length > 0 && (
                          <span className="ai-result-badge success">
                            ✓ Created {message.results.createdShapes.length} shape(s)
                          </span>
                        )}
                        {message.results.modifiedShapes.length > 0 && (
                          <span className="ai-result-badge info">
                            ✎ Modified {message.results.modifiedShapes.length} shape(s)
                          </span>
                        )}
                        {message.results.errors.length > 0 && (
                          <span className="ai-result-badge error">
                            ⚠ {message.results.errors.length} error(s)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {/* Loading indicator */}
            {isProcessing && (
              <div className="ai-message assistant loading">
                <div className="ai-message-header">
                  <span className="ai-message-role">🤖 AI</span>
                </div>
                <div className="ai-message-content">
                  <div className="ai-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form className="ai-chat-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command... (e.g., 'Create a red circle')"
              disabled={isProcessing}
              className="ai-input-field"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className="ai-send-btn"
              title="Send"
            >
              {isProcessing ? '⏳' : '➤'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AIChatPanel;

