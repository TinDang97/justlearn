import { describe, it, expect } from 'vitest'

type HeaderEntry = { key: string; value: string }
type HeaderRule = { source: string; headers: HeaderEntry[] }

// Import the default export (withMDX-wrapped config) from next.config.mjs.
// The headers() function is preserved through the withMDX wrapper.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextConfig = (await import('../../next.config.mjs')) as { default: { headers: () => Promise<HeaderRule[]> } }
const config = nextConfig.default

describe('next.config.mjs COEP/COOP headers', () => {
  it('headers() return array contains a rule with source "/(.*)"', async () => {
    const headers = await config.headers()
    const rule = headers.find((h) => h.source === '/(.*)')
    expect(rule).toBeDefined()
  })

  it('COEP/COOP rule includes Cross-Origin-Embedder-Policy with value "credentialless"', async () => {
    const headers = await config.headers()
    const rule = headers.find((h) => h.source === '/(.*)')
    const coep = rule?.headers?.find((header) => header.key === 'Cross-Origin-Embedder-Policy')
    expect(coep).toEqual({ key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' })
  })

  it('COEP/COOP rule includes Cross-Origin-Opener-Policy with value "same-origin"', async () => {
    const headers = await config.headers()
    const rule = headers.find((h) => h.source === '/(.*)')
    const coop = rule?.headers?.find((header) => header.key === 'Cross-Origin-Opener-Policy')
    expect(coop).toEqual({ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' })
  })

  it('COEP/COOP rule is the FIRST element (index 0) in the returned array', async () => {
    const headers = await config.headers()
    expect(headers[0].source).toBe('/(.*)')
    expect(
      headers[0].headers.find((h) => h.key === 'Cross-Origin-Embedder-Policy')
    ).toBeDefined()
  })
})
