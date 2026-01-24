import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ============================================
        // CUSTOMIZE YOUR BRAND COLORS HERE
        // ============================================
        // The 'primary' color is used for buttons, links, and accents
        // The default is red (#dc2626), but you can change it to any color
        // 
        // Popular alternatives:
        // - Blue:    600: '#2563eb'
        // - Purple:  600: '#9333ea'
        // - Green:   600: '#16a34a'
        // - Orange:  600: '#ea580c'
        // - Pink:    600: '#db2777'
        // 
        // Use a tool like https://uicolors.app to generate a full palette
        // ============================================
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',  // Main brand color
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Accent colors for dark backgrounds (header, footer, sidebar)
        accent: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
    },
  },
  plugins: [],
}
export default config
