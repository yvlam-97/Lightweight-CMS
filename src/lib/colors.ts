// Color utility functions to generate color shades from a hex color

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '')
  
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) { r = c; g = x; b = 0 }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0 }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Generate a full color palette from a single hex color
export function generateColorPalette(hex: string): Record<string, string> {
  const { h, s } = hexToHSL(hex)
  
  // Generate shades with varying lightness
  const shades: Record<number, number> = {
    50: 97,
    100: 94,
    200: 86,
    300: 76,
    400: 62,
    500: 50,
    600: 42,  // Base color lightness (adjusted to match input)
    700: 35,
    800: 28,
    900: 22,
    950: 12,
  }

  const palette: Record<string, string> = {}
  
  for (const [shade, lightness] of Object.entries(shades)) {
    // Adjust saturation slightly for different shades
    const adjustedSaturation = shade === '50' || shade === '100' 
      ? Math.min(100, s + 10) 
      : s
    palette[shade] = hslToHex(h, adjustedSaturation, lightness)
  }

  return palette
}

// Generate CSS variables string from a hex color
export function generateCSSVariables(hex: string): string {
  const palette = generateColorPalette(hex)
  
  return Object.entries(palette)
    .map(([shade, color]) => `--color-primary-${shade}: ${color};`)
    .join('\n    ')
}

// Predefined color themes for easy selection
export const colorPresets = [
  { name: 'Red', hex: '#dc2626' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Yellow', hex: '#ca8a04' },
  { name: 'Lime', hex: '#65a30d' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Sky', hex: '#0284c7' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Fuchsia', hex: '#c026d3' },
  { name: 'Pink', hex: '#db2777' },
  { name: 'Rose', hex: '#e11d48' },
]
