import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock shiki module
const mockCodeToHtml = vi.fn().mockReturnValue('<pre class="shiki"><code>highlighted</code></pre>')
const mockHighlighter = { codeToHtml: mockCodeToHtml }
const mockCreateHighlighter = vi.fn().mockResolvedValue(mockHighlighter)

vi.mock('shiki', () => ({
  createHighlighter: mockCreateHighlighter,
}))

describe('useShikiHighlighter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateHighlighter.mockResolvedValue(mockHighlighter)
    mockCodeToHtml.mockReturnValue('<pre class="shiki"><code>highlighted</code></pre>')
    // Reset the module-level singleton between tests
    vi.resetModules()
  })

  it('highlightCode returns highlighted HTML string', async () => {
    const { useShikiHighlighter } = await import('@/hooks/use-shiki-highlighter')
    const { highlightCode } = useShikiHighlighter()
    const result = await highlightCode('print("hello")', 'python')
    expect(result).toBe('<pre class="shiki"><code>highlighted</code></pre>')
  })

  it('highlightCode calls createHighlighter with correct themes and languages', async () => {
    const { useShikiHighlighter } = await import('@/hooks/use-shiki-highlighter')
    const { highlightCode } = useShikiHighlighter()
    await highlightCode('const x = 1', 'javascript')
    expect(mockCreateHighlighter).toHaveBeenCalledWith(
      expect.objectContaining({
        themes: expect.arrayContaining(['github-light', 'github-dark-dimmed']),
        langs: expect.arrayContaining(['python', 'javascript']),
      })
    )
  })

  it('multiple calls reuse the same highlighter (createHighlighter called once)', async () => {
    const { useShikiHighlighter } = await import('@/hooks/use-shiki-highlighter')
    const { highlightCode } = useShikiHighlighter()
    await highlightCode('print("hello")', 'python')
    await highlightCode('const x = 1', 'javascript')
    await highlightCode('echo "test"', 'bash')
    expect(mockCreateHighlighter).toHaveBeenCalledTimes(1)
  })

  it('calls codeToHtml with dual themes config and defaultColor: false', async () => {
    const { useShikiHighlighter } = await import('@/hooks/use-shiki-highlighter')
    const { highlightCode } = useShikiHighlighter()
    await highlightCode('x = 1', 'python')
    expect(mockCodeToHtml).toHaveBeenCalledWith(
      'x = 1',
      expect.objectContaining({
        lang: 'python',
        themes: { light: 'github-light', dark: 'github-dark-dimmed' },
        defaultColor: false,
      })
    )
  })
})
