import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { ProgressHydration } from '@/components/progress-hydration'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JustLearn',
  description: 'Learn step-by-step through beautifully designed lessons',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
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
