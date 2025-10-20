/**
 * Vercel Serverless Function for OpenAI API calls
 * This keeps the API key secure on the server side
 */

import OpenAI from 'openai';

// ============================================================================
// CORE SYSTEM PROMPT
// ============================================================================

const CORE_RULES = `⚠️ YOU MUST ONLY OUTPUT JSON OPERATIONS. NEVER WRITE CONVERSATIONAL TEXT. ⚠️

IF USER SAYS "write/create/say [anything]":
→ OUTPUT: {"operations": [{"type": "create", "shape": "text", "properties": {"text": "[CONTENT]", "x": "center", "y": "center", "fontSize": 24}}], "message": "Created on canvas."}

FORBIDDEN: "I can't...", "I'm here to help...", "Here's a...", "Let me...", or ANY conversational text.
ONLY OUTPUT: JSON operations for canvas shapes.`;

const TEXT_CREATION_EXAMPLES = `
EXACT RESPONSE EXAMPLES:

"write a short poem" → {"operations": [{"type": "create", "shape": "text", "properties": {"text": "Roses are red,\\nViolets are blue,\\nCanvas is art,\\nMade just for you.", "x": "center", "y": "center", "fontSize": 24}}], "message": "Created poem on canvas."}

"say hello" → {"operations": [{"type": "create", "shape": "text", "properties": {"text": "hello", "x": "center", "y": "center", "fontSize": 32}}], "message": "Created text on canvas."}

"tell me a joke" → {"operations": [{"type": "create", "shape": "text", "properties": {"text": "Why did the canvas go to therapy?\\nIt had too many issues to frame!", "x": "center", "y": "center", "fontSize": 24}}], "message": "Created joke on canvas."}`;

const SHAPE_TYPES = `
Shape types:
- rectangle: x, y, width, height, fillColor, borderColor, strokeWidth, rotation
- circle: x, y, radiusX, radiusY, fillColor, borderColor, strokeWidth, rotation
- diamond: x, y, width, height, fillColor, borderColor, strokeWidth, rotation
- text: x, y, text, fontSize, fontWeight, fontStyle, fontFamily, fillColor, rotation
- arrow: x, y, endX, endY, fillColor, strokeWidth (fillColor sets arrow color)`;

const OPERATIONS = `
Operations:
1. CREATE: {type: "create", shape: "rectangle|circle|diamond|text|arrow", properties: {...}}
2. MOVE: {type: "move", target: "selected", x: number, y: number}
3. RESIZE: {type: "resize", target: "selected", width: number, height: number}
4. ROTATE: {type: "rotate", target: "selected", angle: number}
5. DELETE: {type: "delete", target: "selected"}
6. DUPLICATE: {type: "duplicate", target: "selected"}
7. CUSTOMIZE: {type: "customize", target: "selected", fillColor/borderColor/strokeWidth/borderStyle/fillOpacity/...}
8. GRID: {type: "grid", shape: "...", rows: number, cols: number, spacing: number}
9. ARRANGE: {type: "arrange", target: "selected", direction: "horizontal|vertical", spacing: number}
10. COMPLEX: {type: "complex", template: "login-form|navigation-bar|card-layout|button-group"}

Position keywords: "center", "middle", "top-left", "top-right", "bottom-left", "bottom-right", or numeric x/y
If shapes selected: ALWAYS use target: "selected" for move/resize/rotate/delete/duplicate/customize/arrange`;

const SPACING_RULES = `
SPACING RULES (especially for arrows):
- Space multiple shapes 150-200px apart horizontally/vertically
- NEVER use same x,y for multiple shapes
- Example: 3 arrows → x: 200, x: 400, x: 600 (200px apart)`;

const FINAL_REMINDER = `
🚨 FINAL REMINDER 🚨
IF USER SAYS: "write/create a poem" → OUTPUT JSON with actual poem in text property
FORBIDDEN: "I understand...", "I can't...", "Please select...", ANY conversational response
ONLY: JSON operations`;

const SYSTEM_PROMPT = `${CORE_RULES}

${TEXT_CREATION_EXAMPLES}

${SHAPE_TYPES}

${OPERATIONS}

${SPACING_RULES}

${FINAL_REMINDER}`;

// ============================================================================
// CONTEXT BUILDERS
// ============================================================================

function buildSelectedShapesContext(selectedShapes) {
  if (!selectedShapes || selectedShapes.length === 0) return '';
  
  const descriptions = selectedShapes.map(shape => {
    let desc = shape.type;
    
    // Add color if available
    if (shape.fillColor) {
      const colorMatch = shape.fillColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (colorMatch) {
        const [_, r, g, b] = colorMatch.map(Number);
        let color = 'gray';
        if (r > 200 && g < 100 && b < 100) color = 'red';
        else if (r < 100 && g > 200 && b < 100) color = 'green';
        else if (r < 100 && g < 100 && b > 200) color = 'blue';
        else if (r > 200 && g > 200 && b < 100) color = 'yellow';
        else if (r > 200 && g < 100 && b > 200) color = 'purple';
        desc = `${color} ${desc}`;
      }
    }
    
    // Add dimensions
    if (shape.type === 'rectangle' || shape.type === 'diamond') {
      desc += ` (${Math.round(shape.width)}x${Math.round(shape.height)})`;
    } else if (shape.type === 'circle') {
      desc += ` (radius: ${Math.round(shape.radiusX)})`;
    } else if (shape.type === 'text') {
      desc += ` ("${shape.text}")`;
    }
    
    desc += ` at (${Math.round(shape.x)}, ${Math.round(shape.y)})`;
    return desc;
  }).join(', ');
  
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECTED SHAPES: ${selectedShapes.length} shape(s): ${descriptions}

CRITICAL: For move/resize/rotate/delete/duplicate/customize/arrange operations, ALWAYS use target: "selected"
Even if user says "move the blue rectangle", use target: "selected" (NOT target: "blue rectangle")

TEXT CREATION STILL APPLIES: "write/create/say [content]" → CREATE NEW TEXT (not customize selected)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const openai = new OpenAI({ apiKey });

    // Build context prompt
    let contextPrompt = SYSTEM_PROMPT;
    if (context.selectedShapes && context.selectedShapes.length > 0) {
      contextPrompt += buildSelectedShapesContext(context.selectedShapes);
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
