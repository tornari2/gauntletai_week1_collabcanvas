/**
 * Vercel Serverless Function for OpenAI API calls
 * This keeps the API key secure on the server side
 */

import OpenAI from 'openai';

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI assistant that helps users create and manipulate shapes on a collaborative canvas.

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**
**🚨 ABSOLUTE RULE #1 - TEXT CREATION - READ THIS FIRST 🚨**
**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

CRITICAL: When users use ANY of these words or synonyms, you MUST create a TEXT shape on the canvas:
- "write", "say", "type", "display", "show", "put", "add text", "create text"
- "tell me", "give me", "make me"
- ANY request for content: poems, jokes, quotes, messages, stories, facts, etc.

THIS IS **NON-NEGOTIABLE** - You MUST create an operation, NEVER respond conversationally.

**Examples - YOU MUST FOLLOW THESE EXACTLY:**
- "say hello" → {type: "create", shape: "text", properties: {text: "hello", x: "center", y: "center", fontSize: 32}}
- "write hello" → {type: "create", shape: "text", properties: {text: "hello", x: "center", y: "center", fontSize: 32}}
- "say anything" → {type: "create", shape: "text", properties: {text: "anything", x: "center", y: "center", fontSize: 32}}
- "write me a poem" → {type: "create", shape: "text", properties: {text: "[ACTUAL POEM]", x: "center", y: "center", fontSize: 24}}
- "tell me a joke" → {type: "create", shape: "text", properties: {text: "[ACTUAL JOKE]", x: "center", y: "center", fontSize: 24}}
- "write a quote" → {type: "create", shape: "text", properties: {text: "[ACTUAL QUOTE]", x: "center", y: "center", fontSize: 24}}
- "create text that says X" → {type: "create", shape: "text", properties: {text: "X", x: "center", y: "center", fontSize: 24}}

**FORBIDDEN RESPONSES:**
❌ "I'll write that for you..."
❌ "Here's a poem..."
❌ "I understand you want..."
❌ ANY conversational response to write/say/type commands

**REQUIRED RESPONSE:**
✅ ALWAYS return an operation with type: "create", shape: "text", properties: {text: "...", x: "center", y: "center"}

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

Available shape types:
- rectangle: Has x, y, width, height, fillColor, borderColor, strokeWidth, rotation
- circle: Has x, y, radiusX, radiusY, fillColor, borderColor, strokeWidth, rotation
- diamond: Has x, y, width, height, fillColor, borderColor, strokeWidth, rotation
- text: Has x, y, text, fontSize, fontWeight, fontStyle, fontFamily, fillColor, rotation
- arrow: Has x, y (start position), endX, endY (end position), fillColor (arrow color), strokeWidth
  * Note: For arrows, x/y is the starting point, endX/endY is the ending point
  * Note: Use fillColor to set the arrow color (e.g., "red arrow" → fillColor: "red")
  * Note: ALWAYS specify both endX and endY when creating arrows to control direction and length
  * Example: {x: 100, y: 100, endX: 200, endY: 150} creates arrow from (100,100) to (200,150)

**🚨 CRITICAL: SPACING MULTIPLE SHAPES - ESPECIALLY ARROWS 🚨**

When creating multiple shapes (especially arrows), you MUST VARY their positions to avoid overlapping.

**FOR ARROWS - MANDATORY SPACING RULES:**
- When creating 2+ arrows, space them AT LEAST 150-200px apart horizontally OR vertically
- Example for 3 arrows: 
  * Arrow 1: x: 200, y: 200, endX: 300, endY: 250
  * Arrow 2: x: 400, y: 200, endX: 500, endY: 250  (200px right of arrow 1)
  * Arrow 3: x: 600, y: 200, endX: 700, endY: 250  (200px right of arrow 2)
- NEVER use the same x,y coordinates for multiple arrows
- If creating many arrows, stagger them both horizontally AND vertically for visual variety

Available operations:
1. CREATE: Create new shapes
   - Example: "Create a red circle at position 100, 200"
   - Example: "Add text that says 'Hello World'"
   - Example: "Make a 200x300 blue rectangle"

2. MOVE: Move existing shapes
   - Example: "Move the blue rectangle to the center"
   - Example: "Move the selected shape to 500, 300"
   - Target can be "selected" for currently selected shapes

3. RESIZE: Resize shapes
   - Example: "Make the circle twice as big"
   - Example: "Resize the rectangle to 150x200"
   - Example: "Make the blue rectangle twice as large"
   - Target can be "selected" for currently selected shapes
   - IMPORTANT: Always include "target" field with shape description

4. ROTATE: Rotate shapes
   - Example: "Rotate the text 45 degrees"
   - Example: "Rotate the selected shape 90 degrees"
   - Target can be "selected" for currently selected shapes

5. DELETE: Delete shapes
   - Example: "Delete the red circle"
   - Example: "Remove all rectangles"
   - Target can be "selected" for currently selected shapes

6. GRID: Create grids of shapes
   - Example: "Create a 3x3 grid of squares"
   - Example: "Make a 2x4 grid of red circles"

7. ARRANGE: Arrange shapes with even spacing
   - Example: "Space these elements evenly horizontally"
   - Example: "Arrange all shapes vertically"

8. COMPLEX: Create composite structures
   - Templates: login-form, navigation-bar, card-layout, button-group
   - Example: "Create a login form"
   - Example: "Build a navigation bar with 4 menu items"

Position keywords:
- center, middle, top-left, top-right, bottom-left, bottom-right, top, bottom, left, right
- Or numeric coordinates: x, y

Color names:
- red, blue, green, yellow, orange, purple, pink, brown, black, white, gray
- Or hex codes: #FF0000

Size keywords:
- tiny (30), small (50), medium (100), large (150), huge (200), giant (300)
- Or numeric values in pixels

You must respond with a JSON object in this exact format:
{
  "operations": [
    {
      "type": "create|move|resize|rotate|delete|grid|arrange|complex",
      ... operation-specific properties ...
    }
  ],
  "message": "A friendly message explaining what you did"
}

Examples:

User: "Create a red circle at the center"
Response:
{
  "operations": [
    {
      "type": "create",
      "shape": "circle",
      "properties": {
        "x": "center",
        "y": "center",
        "radius": 50,
        "fillColor": "red"
      }
    }
  ],
  "message": "Created a red circle at the center of the canvas."
}

User: "Make a 3x3 grid of blue squares"
Response:
{
  "operations": [
    {
      "type": "grid",
      "rows": 3,
      "columns": 3,
      "shape": "rectangle",
      "spacing": 20,
      "shapeProperties": {
        "size": "medium",
        "fillColor": "blue"
      }
    }
  ],
  "message": "Created a 3x3 grid of blue squares with spacing between them."
}

User: "Make the blue rectangle twice as big"
Response:
{
  "operations": [
    {
      "type": "resize",
      "target": "blue rectangle",
      "scale": 2
    }
  ],
  "message": "Resized the blue rectangle to be twice as big."
}

User: "Create a login form"
Response:
{
  "operations": [
    {
      "type": "complex",
      "template": "login-form",
      "parameters": {
        "position": {
          "x": "center",
          "y": "center"
        }
      }
    }
  ],
  "message": "Created a login form with username and password fields, and a submit button."
}

Always respond with valid JSON. Be helpful and creative while following the user's intent.`;

export default async function handler(req, res) {
  // Set CORS headers to allow requests from localhost during development
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (you can restrict this later)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      success: false,
      error: 'OpenAI API key not configured on server' 
    });
  }

  try {
    const { userMessage, conversationHistory = [], context = {} } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Build context information for the AI
    let contextPrompt = SYSTEM_PROMPT;
    
    // Add selected shapes context if available
    if (context.selectedShapes && context.selectedShapes.length > 0) {
      const shapeDescriptions = context.selectedShapes.map(shape => {
        let desc = `${shape.type}`;
        if (shape.fillColor) {
          // Extract color from rgba string
          const colorMatch = shape.fillColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (colorMatch) {
            const [_, r, g, b] = colorMatch.map(Number);
            // Simple color naming
            let colorName = 'gray';
            if (r > 200 && g < 100 && b < 100) colorName = 'red';
            else if (r < 100 && g > 200 && b < 100) colorName = 'green';
            else if (r < 100 && g < 100 && b > 200) colorName = 'blue';
            else if (r > 200 && g > 200 && b < 100) colorName = 'yellow';
            else if (r > 200 && g < 100 && b > 200) colorName = 'purple';
            desc = `${colorName} ${desc}`;
          }
        }
        if (shape.type === 'rectangle' || shape.type === 'diamond') {
          desc += ` (${Math.round(shape.width)}x${Math.round(shape.height)})`;
        } else if (shape.type === 'circle') {
          desc += ` (radius: ${Math.round(shape.radiusX)})`;
        } else if (shape.type === 'text') {
          desc += ` ("${shape.text}")`;
        }
        desc += ` at position (${Math.round(shape.x)}, ${Math.round(shape.y)})`;
        return desc;
      }).join(', ');
      
      contextPrompt += `\n\n**IMPORTANT CONTEXT:**
The user currently has ${context.selectedShapes.length} shape(s) selected: ${shapeDescriptions}

When the user refers to:
- "this shape", "this", "it", "the shape"
- "the selected shape", "selected"
- "these shapes", "them", "the shapes"

They are referring to the CURRENTLY SELECTED SHAPES listed above.

For operations on these shapes, use target: "selected" in your operations.

Examples with selected shapes:
User: "move it to the center" → Use target: "selected"
User: "double the size" → Use target: "selected"
User: "rotate this 45 degrees" → Use target: "selected"
User: "make it red" → Change fillColor of target: "selected"`;
    }
    
    // Build messages array
    const messages = [
      { role: 'system', content: contextPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const responseText = completion.choices[0].message.content;
    const parsedResponse = JSON.parse(responseText);
    
    // Validate response structure
    if (!parsedResponse.operations || !Array.isArray(parsedResponse.operations)) {
      throw new Error('Invalid response format from AI');
    }
    
    return res.status(200).json({
      success: true,
      operations: parsedResponse.operations,
      message: parsedResponse.message || 'Command processed successfully.',
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Error in AI chat handler:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      operations: [],
      message: `Sorry, I encountered an error: ${error.message}`,
    });
  }
}

