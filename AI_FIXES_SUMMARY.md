# AI Command Execution Fixes

## Issues Fixed

### 1. **Move Operation Errors**
**Problem**: When asking the AI to move a shape (e.g., "move the red square 100 pixels to the left"), it would fail with "cannot read properties of undefined" error.

**Root Cause**: 
- The move operation only supported absolute positioning, not relative movement
- It didn't handle multi-select properly

**Solution** (`commandExecutor.js` - `executeMoveOperation`):
- Added support for both `offset` (relative movement) and `position` (absolute movement)
- Added proper handling for both `selectedShapeId` (single selection) and `selectedShapeIds` (multi-selection)
- Added safety checks for undefined shapes with default values

### 2. **Resize Operation Affecting All Shapes**
**Problem**: When asking to "double the size of the login form", all shapes on the canvas would be doubled instead of just the targeted shapes.

**Root Cause**: 
- The `findShapesByDescription` function was too lenient and would match all shapes when given vague descriptions like "form" or "layout"
- The resize operation didn't properly distinguish between specific targets and "all shapes"

**Solution** (`shapeIntelligence.js` - `findShapesByDescription`):
- Added stricter matching for "all" and "everything" - now only matches exact phrases
- Added vague description detection - returns empty array for vague terms like "form", "layout", "group", "template" without specific color/type filters
- Improved "selected" keyword handling to return empty array (letting the calling context handle it)

**Solution** (`commandExecutor.js` - `executeResizeOperation`):
- Added proper handling for both single and multi-selection
- Added default values for shape dimensions to prevent undefined errors
- Added arrow scaling support

### 3. **Rotate and Delete Operations**
**Problem**: Similar to move/resize, these operations didn't properly handle multi-selection.

**Solution** (`commandExecutor.js`):
- Updated `executeRotateOperation` to support `selectedShapeIds`
- Updated `executeDeleteOperation` to support `selectedShapeIds`

## Technical Details

### Updated Functions

#### 1. `executeMoveOperation` (commandExecutor.js)
```javascript
// Now supports:
- offset: { x: number, y: number } // Relative movement
- position: { x: number, y: number } // Absolute positioning
- target: 'selected' | description string
- Handles both selectedShapeId and selectedShapeIds
```

#### 2. `executeResizeOperation` (commandExecutor.js)
```javascript
// Now supports:
- scale: number // Scale factor (e.g., 2 for double size)
- dimensions: { width, height, radius, radiusX, radiusY }
- Handles all shape types including arrows
- Adds default values to prevent undefined errors
```

#### 3. `findShapesByDescription` (shapeIntelligence.js)
```javascript
// Now includes:
- Strict "all" matching (exact phrases only)
- Vague description detection (returns [] for vague terms)
- Better "selected" handling
- More specific filtering logic
```

## How to Use

### Examples that now work correctly:

1. **Move shapes**:
   - "Move the red square 100 pixels to the left" ✅
   - "Move the selected shape to x: 300, y: 200" ✅
   
2. **Resize shapes**:
   - "Double the size of the blue circle" ✅
   - "Make the selected shapes 50% larger" ✅
   
3. **Target specific shapes**:
   - "Delete all red rectangles" ✅
   - "Rotate the red square 45 degrees" ✅

### What won't work (by design):

1. **Vague descriptions**:
   - "Double the size of the form" ❌ (too vague - use "Double the size of all blue rectangles" instead)
   - "Move the layout 50 pixels" ❌ (too vague - select shapes first or use color/type descriptors)

## Best Practices for AI Commands

1. **Be specific with colors or types**: "red square", "blue circles", "all rectangles"
2. **Use selection**: Select shapes first, then say "resize selected shapes"
3. **Use exact terms**: Instead of "form" or "layout", describe the specific shapes
4. **Relative movements**: "Move 100 pixels left/right/up/down"
5. **Absolute positioning**: "Move to x: 300, y: 200"

## Files Modified

1. `/src/utils/commandExecutor.js`
   - `executeMoveOperation` - Added offset support and multi-select
   - `executeResizeOperation` - Added multi-select and arrow support
   - `executeRotateOperation` - Added multi-select
   - `executeDeleteOperation` - Added multi-select

2. `/src/utils/shapeIntelligence.js`
   - `findShapesByDescription` - Improved matching logic and vague description handling

## Testing

To test these fixes:

1. **Create some shapes** with different colors
2. **Move test**: "Move the red square 100 pixels to the left"
3. **Resize test**: "Double the size of the blue circle" (should only affect blue circles)
4. **Multi-select test**: Select multiple shapes, then "Resize selected shapes by 150%"
5. **Complex scene test**: Create a login form and 9 squares, then "Double the size of all red squares" (should not affect the entire form)

## Known Limitations

1. Complex templates (like "login form") are still created as separate shapes without grouping metadata
2. The AI can only target shapes by:
   - Color (red, blue, green, etc.)
   - Type (rectangle, circle, diamond, text, arrow)
   - Selection state (selected shapes)
3. For complex manipulations, it's better to select shapes first, then use "selected" keyword

