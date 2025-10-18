import React, { createContext, useContext, useState, useCallback } from 'react';
import { parseCommand, isCommand, isAPIKeyConfigured } from '../utils/aiService';
import { executeOperations } from '../utils/commandExecutor';
import { useCanvas } from './CanvasContext';
import { useAuth } from './AuthContext';

const AIContext = createContext();

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

export function AIProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [error, setError] = useState(null);

  const canvasContext = useCanvas();
  const { currentUser } = useAuth();

  /**
   * Send a message to the AI and process the response
   */
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    // Check if API key is configured
    if (!isAPIKeyConfigured()) {
      const errorMsg = {
        role: 'assistant',
        content: 'OpenAI API key is not configured. Please add your API key to the .env.local file.',
        timestamp: Date.now(),
        error: true,
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Add user message to chat
    const userMsg = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsProcessing(true);
    setError(null);

    try {
      // Detect if this is a command or a question
      const isCommandMessage = isCommand(userMessage);

      if (isCommandMessage) {
        // Build context with selected shapes information
        const selectedShapes = [];
        
        // Get selected shapes (both single and multi-select)
        if (canvasContext.selectedShapeIds && canvasContext.selectedShapeIds.length > 0) {
          selectedShapes.push(
            ...canvasContext.shapes.filter(s => canvasContext.selectedShapeIds.includes(s.id))
          );
        } else if (canvasContext.selectedShapeId) {
          const selectedShape = canvasContext.shapes.find(s => s.id === canvasContext.selectedShapeId);
          if (selectedShape) {
            selectedShapes.push(selectedShape);
          }
        }
        
        const aiContext = {
          selectedShapes,
          canvasWidth: 1920,
          canvasHeight: 1080,
        };
        
        // Parse command with AI
        const aiResponse = await parseCommand(userMessage, messages, aiContext);

        if (aiResponse.success && aiResponse.operations.length > 0) {
          // Execute operations
          const executionResult = await executeOperations(
            aiResponse.operations,
            canvasContext,
            currentUser
          );

          // Prepare response message
          let responseContent = aiResponse.message;

          if (executionResult.errors.length > 0) {
            responseContent += `\n\nNote: Some operations had issues: ${executionResult.errors.join(', ')}`;
          }

          if (executionResult.createdShapes.length > 0) {
            responseContent += `\n\nCreated ${executionResult.createdShapes.length} shape(s).`;
          }

          if (executionResult.modifiedShapes.length > 0) {
            responseContent += `\n\nModified ${executionResult.modifiedShapes.length} shape(s).`;
          }

          // Add AI response to chat
          const aiMsg = {
            role: 'assistant',
            content: responseContent,
            timestamp: Date.now(),
            operations: aiResponse.operations,
            results: executionResult,
          };
          setMessages(prev => [...prev, aiMsg]);
        } else {
          // AI couldn't parse the command
          const errorMsg = {
            role: 'assistant',
            content: aiResponse.message || 'Sorry, I couldn\'t understand that command. Can you try rephrasing it?',
            timestamp: Date.now(),
            error: true,
          };
          setMessages(prev => [...prev, errorMsg]);
        }
      } else {
        // Handle as conversational message
        const aiMsg = {
          role: 'assistant',
          content: `I understand you said "${userMessage}". I'm designed to help you create and manipulate shapes on the canvas. Try commands like:
          
• "Create a red circle at the center"
• "Make a 3x3 grid of blue squares"
• "Create a login form"
• "Move the red rectangle to position 500, 300"

What would you like me to create?`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Error processing AI message:', error);
      
      const errorMsg = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: Date.now(),
        error: true,
      };
      setMessages(prev => [...prev, errorMsg]);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, canvasContext, currentUser]);

  /**
   * Clear chat history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Toggle panel open/closed
   */
  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  /**
   * Open the panel
   */
  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  /**
   * Close the panel
   */
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const value = {
    messages,
    isProcessing,
    isPanelOpen,
    error,
    sendMessage,
    clearMessages,
    togglePanel,
    openPanel,
    closePanel,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

