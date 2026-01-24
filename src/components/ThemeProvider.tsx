import { prisma } from '@/lib/prisma'
import { generateColorPalette } from '@/lib/colors'

export async function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
  const primaryColor = settings?.primaryColor || '#dc2626'
  const palette = generateColorPalette(primaryColor)
  
  // Generate CSS custom properties
  const cssVariables = `
    :root {
      --color-primary-50: ${palette['50']};
      --color-primary-100: ${palette['100']};
      --color-primary-200: ${palette['200']};
      --color-primary-300: ${palette['300']};
      --color-primary-400: ${palette['400']};
      --color-primary-500: ${palette['500']};
      --color-primary-600: ${palette['600']};
      --color-primary-700: ${palette['700']};
      --color-primary-800: ${palette['800']};
      --color-primary-900: ${palette['900']};
      --color-primary-950: ${palette['950']};
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      {children}
    </>
  )
}
