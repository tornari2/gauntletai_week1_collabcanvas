/**
 * AI Service
 * Handles OpenAI API integration for canvas command parsing
 * Now uses secure backend API instead of exposing API key
 */

// Backend API endpoint for AI chat
const AI_CHAT_ENDPOINT = '/api/ai-chat';

/**
 * Parse user command using OpenAI (via secure backend API)
 * @param {string} userMessage - User's natural language command
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {object} context - Canvas context with selected shapes info
 * @returns {Promise<object>} - Parsed command with operations and message
 */
export async function parseCommand(userMessage, conversationHistory = [], context = {}) {
  try {
    // Call backend API instead of OpenAI directly
    const response = await fetch(AI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory,
        context,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process command');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error parsing command with AI:', error);
    
    // Return error response
    return {
      success: false,
      error: error.message,
      operations: [],
      message: `Sorry, I encountered an error: ${error.message}`,
    };
  }
}

/**
 * Detect if a message is a command or a question
 * @param {string} message - User's message
 * @returns {boolean} - True if it's likely a command
 */
export function isCommand(message) {
  const commandKeywords = [
    'create', 'make', 'add', 'draw', 'build',
    'move', 'shift', 'drag',
    'resize', 'scale', 'grow', 'shrink', 'bigger', 'smaller',
    'rotate', 'turn', 'spin',
    'delete', 'remove', 'clear',
    'grid', 'arrange', 'space', 'align',
    'form', 'button', 'card', 'navigation', 'nav',
  ];
  
  const lowerMessage = message.toLowerCase();
  return commandKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Validate API key configuration
 * @returns {boolean} - True if API key is configured (always true for backend setup)
 */
export function isAPIKeyConfigured() {
  // With the backend approach, the API key is always "configured" from the frontend's perspective
  // The backend will handle the actual API key validation
  return true;
}

