/**
 * AI Service
 * Handles OpenAI API integration for canvas command parsing
 * Now uses secure backend API instead of exposing API key
 */

// Backend API endpoint for AI chat
// In development, use production API; in production, use relative path
const AI_CHAT_ENDPOINT = import.meta.env.DEV && import.meta.env.VITE_PRODUCTION_URL
  ? `${import.meta.env.VITE_PRODUCTION_URL}/api/ai-chat`
  : '/api/ai-chat';

console.log('AI_CHAT_ENDPOINT:', AI_CHAT_ENDPOINT);
console.log('import.meta.env.DEV:', import.meta.env.DEV);
console.log('import.meta.env.VITE_PRODUCTION_URL:', import.meta.env.VITE_PRODUCTION_URL);

/**
 * Parse user command using OpenAI (via secure backend API)
 * @param {string} userMessage - User's natural language command
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {object} context - Canvas context with selected shapes info
 * @returns {Promise<object>} - Parsed command with operations and message
 */
export async function parseCommand(userMessage, conversationHistory = [], context = {}) {
  try {
    console.log('Fetching from:', AI_CHAT_ENDPOINT);
    
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

    console.log('Response status:', response.status);

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to get error details
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If parsing error response fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
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
    'duplicate', 'copy', 'clone',
    'color', 'colour', 'change', 'customize', 'style', 
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'grey', 'brown',
    'border', 'stroke', 'line', 'thick', 'thin', 'dashed', 'dotted', 'solid',
    'opacity', 'transparent', 'opaque',
    'bold', 'italic', 'underline',
    'text', 'write', 'say', 'type', 'hello', 'message', 'label', 'title', 'heading',
    'poem', 'quote', 'story', 'note',
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

