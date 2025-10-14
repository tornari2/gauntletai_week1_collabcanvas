/**
 * Generates a consistent, deterministic color from a username
 * Uses an improved hash function to convert username to hue value
 * Better distribution for similar strings (student1, student2, etc.)
 * 
 * @param {string} username - The username to generate a color for
 * @returns {string} - HSL color string (e.g., "hsl(120, 70%, 60%)")
 */
export function generateColorFromUsername(username) {
  if (!username) {
    return 'hsl(0, 70%, 60%)'; // Default red
  }

  // Improved hash function with better distribution
  // Using DJB2 hash algorithm for better spread
  let hash = 5381;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) + hash) + username.charCodeAt(i); // hash * 33 + char
  }
  
  // Add additional mixing for better distribution
  hash = Math.abs(hash);
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = (hash >> 16) ^ hash;

  // Convert hash to hue value (0-360)
  // Skip yellow range (40-70) as it's hard to see on white backgrounds
  const hue = hash % 330; // Use 330 instead of 360 to skip some yellows
  const adjustedHue = hue < 40 ? hue : hue + 30; // Skip 40-70 range

  // Return HSL color with good saturation and lightness for visibility
  return `hsl(${adjustedHue}, 70%, 60%)`;
}

/**
 * Converts HSL color string to hex color string
 * 
 * @param {string} hslString - HSL color string (e.g., "hsl(120, 70%, 60%)")
 * @returns {string} - Hex color string (e.g., "#7ACC7A")
 */
export function hslToHex(hslString) {
  // Parse HSL values
  const hslMatch = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!hslMatch) {
    return '#000000';
  }

  const h = parseInt(hslMatch[1]);
  const s = parseInt(hslMatch[2]) / 100;
  const l = parseInt(hslMatch[3]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (value) => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Gets user color as hex string from username
 * 
 * @param {string} username - The username
 * @returns {string} - Hex color string
 */
export function getUserColorHex(username) {
  const hsl = generateColorFromUsername(username);
  return hslToHex(hsl);
}

