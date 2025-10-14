# Troubleshooting PR4 Canvas

## If you see a blank white screen:

### Step 1: Are you logged in?
- Open http://localhost:5177/
- Do you see a **login form** or a **white canvas**?
- If you see the login form: **Sign up or log in first**
- The canvas only appears AFTER authentication

### Step 2: Hard refresh the browser
1. Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows/Linux)
2. Or open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### Step 3: Check browser console
1. Open DevTools: **F12** or **Cmd+Option+I** (Mac)
2. Click the **Console** tab
3. Look for any red error messages
4. Share any errors you see

### Step 4: Check what's rendering
1. In DevTools, click the **Elements** or **Inspector** tab
2. Look for `<div class="canvas-container">`
3. Does it have any children?
4. Do you see:
   - A debug panel div?
   - "Initializing canvas..." text?
   - A `<canvas>` element?

### Step 5: Check React component
Open the Console and type:
```javascript
document.querySelector('.canvas-container')
```
This should return an element. If it returns `null`, the Canvas component isn't rendering.

## Common Issues:

### Issue 1: Still on Login Screen
**Solution:** You need to create an account or log in first. The canvas only shows after authentication.

### Issue 2: "Initializing canvas..." message
This means the container dimensions are 0x0. This could happen if:
- The CSS isn't loading properly
- The container has no height

**Solution:** Check if `.canvas-container` has height in the Elements inspector.

### Issue 3: Hot reload didn't work
**Solution:** Save all files and do a hard refresh (Cmd+Shift+R)

### Issue 4: JavaScript error
**Solution:** Check console for errors. Most likely a missing import or syntax error.

