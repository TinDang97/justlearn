import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { useMDXComponents } from '@/mdx-components'

// Mock CopyButton so we can verify it renders without clipboard API
vi.mock('@/components/copy-button', () => ({
  CopyButton: ({ code }: { code: string }) => (
    <button data-testid="copy-button" data-code={code}>
      Copy
    </button>
  ),
}))

afterEach(() => {
  cleanup()
})

function renderPreOverride(
  props: React.ComponentProps<'pre'> & { raw?: string } = {}
) {
  const { pre: PreOverride } = useMDXComponents()
  if (!PreOverride) throw new Error('pre override not found')

  // Simulate code child with data-language attribute
  const { 'data-language': dataLanguage, raw, children, ...rest } = props as {
    'data-language'?: string
    raw?: string
    children?: React.ReactNode
  } & Record<string, unknown>

  const codeChild = React.createElement(
    'code',
    { 'data-language': dataLanguage },
    children ?? 'const x = 1'
  )

  return render(
    React.createElement(
      PreOverride as React.ComponentType<Record<string, unknown>>,
      { raw, ...rest },
      codeChild
    )
  )
}

describe('pre override — language badge', () => {
  it('renders language badge with correct text from data-language', () => {
    renderPreOverride({ 'data-language': 'python' } as Record<string, unknown>)
    expect(screen.getByText('python')).toBeInTheDocument()
  })

  it('defaults to "code" badge when data-language is missing', () => {
    renderPreOverride()
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('renders language badge uppercased or as text in header bar', () => {
    renderPreOverride({ 'data-language': 'typescript' } as Record<string, unknown>)
    // The badge text should be present (rendered as-is or uppercase)
    const badge = screen.getByText(/typescript/i)
    expect(badge).toBeInTheDocument()
  })

  it('renders CopyButton when raw prop is provided', () => {
    renderPreOverride({
      raw: 'print("hello")',
      'data-language': 'python',
    } as Record<string, unknown>)
    expect(screen.getByTestId('copy-button')).toBeInTheDocument()
  })

  it('does not render CopyButton when raw prop is absent', () => {
    renderPreOverride({ 'data-language': 'python' } as Record<string, unknown>)
    expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument()
  })

  it('passes raw code string to CopyButton', () => {
    const code = 'x = 42'
    renderPreOverride({
      raw: code,
      'data-language': 'python',
    } as Record<string, unknown>)
    const copyBtn = screen.getByTestId('copy-button')
    expect(copyBtn).toHaveAttribute('data-code', code)
  })
})
