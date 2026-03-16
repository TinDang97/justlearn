import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { ProgressHydration } from '@/components/progress-hydration'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JustLearn — Learn Programming and Data Skills',
  description: 'Learn step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI assistance.',
  icons: {
    icon: [
      { url: '/brand/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Blocking script: reads localStorage BEFORE React hydrates — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var resolved = theme === 'system' || !theme ? system : theme;
                  document.documentElement.classList.add(resolved);
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProgressHydration />
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
