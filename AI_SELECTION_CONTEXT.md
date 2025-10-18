# AI Selection Context Feature

## Overview

The AI agent now has awareness of which shapes are currently selected on the canvas. When you select shapes and give commands, the AI automatically knows you're referring to the selected shapes.

## How It Works

### 1. **Selection Context**
When you select one or more shapes on the canvas, the AI receives information about:
- Shape type (rectangle, circle, diamond, text, arrow)
- Shape color
- Shape dimensions
- Shape position
- Shape text content (for text shapes)

### 2. **Natural Language Understanding**
The AI understands the following references to selected shapes:

**Single shape references:**
- "this shape"
- "this"
- "it"
- "the shape"
- "the selected shape"
- "selected"

**Multiple shape references:**
- "these shapes"
- "them"
- "the shapes"
- "the selected shapes"

### 3. **Automatic Target Resolution**
When you use these references, the AI automatically sets `target: "selected"` in the operation, which means the command will only affect your selected shapes.

## Usage Examples

### Example 1: Move Selected Shape
```
1. Click on a green rectangle to select it
2. Say to AI: "move this to the center"
   → AI understands "this" = the green rectangle
   → Moves the green rectangle to center
```

### Example 2: Resize Selected Shape
```
1. Click on a blue circle
2. Say: "double the size"
   → AI knows you mean the blue circle
   → Doubles the blue circle's size
```

### Example 3: Rotate Selected Shape
```
1. Select a text element
2. Say: "rotate it 45 degrees"
   → AI rotates the selected text 45 degrees
```

### Example 4: Multi-Select Operations
```
1. Shift+click to select multiple rectangles
2. Say: "make them all red"
   → AI changes fill color of all selected rectangles
```

### Example 5: Move with Relative Position
```
1. Select a shape
2. Say: "move this 100 pixels to the right"
   → AI moves the selected shape 100 pixels right
```

## What the AI Sees

When you have a shape selected, the AI receives context like this:

```
The user currently has 1 shape(s) selected: 
green rectangle (200x150) at position (400, 300)

When the user refers to:
- "this shape", "this", "it", "the shape"
- "the selected shape", "selected"
- "these shapes", "them", "the shapes"

They are referring to the CURRENTLY SELECTED SHAPES listed above.
```

## Commands That Work With Selection

### ✅ Movement Commands
- "move it to the center"
- "move this to x: 500, y: 400"
- "shift it 50 pixels left"
- "move the shape up 100 pixels"

### ✅ Resize Commands
- "double the size"
- "make it twice as big"
- "resize this to 300x200"
- "make it 50% larger"
- "shrink it by half"

### ✅ Rotation Commands
- "rotate this 45 degrees"
- "turn it 90 degrees clockwise"
- "rotate the shape 180 degrees"

### ✅ Delete Commands
- "delete this"
- "remove it"
- "delete the selected shape"

### ✅ Color Changes (via resize operation)
- "make it red"
- "change the color to blue"
- "make this green"

## Technical Implementation

### Files Modified

1. **`src/utils/aiService.js`**
   - Added `context` parameter to `parseCommand` function
   - Builds dynamic context prompt with selected shapes info
   - Extracts color information from rgba values
   - Maps natural language references to "selected" target

2. **`src/context/AIContext.jsx`**
   - Collects selected shapes from CanvasContext
   - Passes selectedShapes to AI service
   - Supports both single selection and multi-selection

### Data Flow

```
1. User selects shape(s) on canvas
   ↓
2. Selection stored in CanvasContext (selectedShapeId or selectedShapeIds)
   ↓
3. User sends AI command
   ↓
4. AIContext retrieves selected shapes from CanvasContext
   ↓
5. Selected shapes info passed to parseCommand
   ↓
6. AI receives enhanced context with selection info
   ↓
7. AI generates operations with target: "selected"
   ↓
8. commandExecutor executes on selected shapes only
```

## Benefits

1. **Natural Workflow**: Select, then command - just like desktop applications
2. **Precision**: No need to describe color/type if shape is already selected
3. **Efficiency**: Faster commands - "move it left" vs "move the blue rectangle left"
4. **Multi-Select**: Works seamlessly with multi-selection
5. **Intuitive**: Uses natural pronouns like "it", "this", "them"

## Limitations

- The AI can only see shapes that are already selected
- If no shapes are selected, references like "this" or "it" will fail
- Color extraction from rgba is approximate for complex colors

## Best Practices

### ✅ DO:
- Select shapes first, then give commands
- Use simple references like "this" or "it"
- Use multi-select for batch operations
- Combine with specific commands for clarity

### ❌ DON'T:
- Say "it" when nothing is selected
- Mix selection references with other targets ("move it and the red circle")
- Expect AI to select shapes for you

## Example Workflow

**Creating and Modifying a Design:**

```
User: "Create a red square at the center"
AI: Creates red square

User: [Clicks to select the red square]
User: "make it 200x200"
AI: Resizes selected square to 200x200

User: "move it to the top left"
AI: Moves selected square to top left

User: "rotate this 45 degrees"
AI: Rotates selected square 45 degrees

User: "duplicate this 5 times horizontally"
AI: Creates 5 copies of the square spaced horizontally
```

## Future Enhancements

Potential improvements:
- Color change as a dedicated operation (not just via resize)
- Style changes (border, opacity)
- Group/ungroup operations
- Copy/paste operations
- Layer order commands (bring to front, send to back)

