import { describe, it, expect } from 'vitest'
import { highlight } from '@/lib/search'
import React from 'react'

describe('highlight()', () => {
  it('returns plain text when no indices are provided', () => {
    const result = highlight('Hello World', [])
    expect(result).toBe('Hello World')
  })

  it('wraps a single range in a mark element', () => {
    const result = highlight('Hello World', [[0, 4]])
    // Result should be an array with a mark element and remainder
    expect(Array.isArray(result)).toBe(true)
    const nodes = result as React.ReactNode[]
    // First node should be a mark element wrapping "Hello"
    const markNode = nodes.find(
      (n) => React.isValidElement(n) && n.type === 'mark'
    )
    expect(markNode).toBeDefined()
    expect(React.isValidElement(markNode) && (markNode as React.ReactElement).props.children).toBe('Hello')
  })

  it('returns the full string as plain text when no match covers it', () => {
    const result = highlight('test', [])
    expect(result).toBe('test')
  })

  it('wraps multiple ranges independently', () => {
    const result = highlight('Hello Beautiful World', [[0, 4], [6, 13]])
    expect(Array.isArray(result)).toBe(true)
    const nodes = result as React.ReactNode[]
    const markNodes = nodes.filter(
      (n) => React.isValidElement(n) && n.type === 'mark'
    )
    expect(markNodes.length).toBe(2)
  })

  it('includes plain text segments between marks', () => {
    const result = highlight('Hello World', [[0, 4]])
    expect(Array.isArray(result)).toBe(true)
    const nodes = result as React.ReactNode[]
    // Should contain a plain text " World" after the mark
    const plainSegments = nodes.filter((n) => typeof n === 'string')
    expect(plainSegments.some((s) => (s as string).includes('World'))).toBe(true)
  })

  it('handles range at end of string', () => {
    const result = highlight('Hello World', [[6, 10]])
    expect(Array.isArray(result)).toBe(true)
    const nodes = result as React.ReactNode[]
    const markNode = nodes.find(
      (n) => React.isValidElement(n) && n.type === 'mark'
    )
    expect(markNode).toBeDefined()
    expect(React.isValidElement(markNode) && (markNode as React.ReactElement).props.children).toBe('World')
  })
})
