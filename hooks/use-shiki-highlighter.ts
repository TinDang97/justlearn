'use client'

import type { Highlighter } from 'shiki'

// Module-level singleton — prevents re-initializing the highlighter on every render.
// Lazy-loaded on first call to highlightCode (not on hook mount).
let highlighterPromise: Promise<Highlighter> | null = null

function getOrCreateHighlighter(): Promise<Highlighter> {
  if (highlighterPromise === null) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['github-light', 'github-dark-dimmed'],
        langs: ['python', 'javascript', 'typescript', 'bash', 'json', 'text'],
      })
    )
  }
  return highlighterPromise
}

export interface ShikiHighlighter {
  highlightCode: (code: string, lang: string) => Promise<string>
}

/**
 * React hook providing syntax highlighting via shiki.
 *
 * - Lazy-loads the shiki highlighter singleton on first call (not on mount)
 * - Uses dual themes: github-light (light mode) and github-dark-dimmed (dark mode)
 * - Matches the themes used in lesson code blocks (next.config.mjs rehypePrettyCode config)
 * - Returns empty string while highlighter is loading (graceful degradation)
 */
export function useShikiHighlighter(): ShikiHighlighter {
  async function highlightCode(code: string, lang: string): Promise<string> {
    try {
      const highlighter = await getOrCreateHighlighter()
      return highlighter.codeToHtml(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark-dimmed' },
        defaultColor: false,
      })
    } catch {
      return ''
    }
  }

  return { highlightCode }
}
