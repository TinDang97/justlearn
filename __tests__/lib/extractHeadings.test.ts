import { describe, it, expect } from 'vitest'
import { extractHeadings } from '@/lib/content'

describe('extractHeadings', () => {
  it('extracts h2 headings', () => {
    const result = extractHeadings('## Hello')
    expect(result).toEqual([{ id: 'hello', text: 'Hello', level: 2 }])
  })

  it('extracts h3 headings', () => {
    const result = extractHeadings('### World')
    expect(result).toEqual([{ id: 'world', text: 'World', level: 3 }])
  })

  it('extracts mixed h2 and h3 headings', () => {
    const result = extractHeadings('## Hello\n### World')
    expect(result).toEqual([
      { id: 'hello', text: 'Hello', level: 2 },
      { id: 'world', text: 'World', level: 3 },
    ])
  })

  it('handles headings with special chars: colons, parens, question marks', () => {
    const result = extractHeadings('## Part 1: What is Python? (30 minutes)')
    expect(result).toEqual([
      { id: 'part-1-what-is-python-30-minutes', text: 'Part 1: What is Python? (30 minutes)', level: 2 },
    ])
  })

  it('returns empty array when no h2/h3 headings', () => {
    const result = extractHeadings('No headings here\nJust text')
    expect(result).toEqual([])
  })

  it('ignores h1 headings', () => {
    const result = extractHeadings('# Top Level\n## Section')
    expect(result).toEqual([{ id: 'section', text: 'Section', level: 2 }])
  })

  it('ignores h4+ headings', () => {
    const result = extractHeadings('## Section\n#### Deep')
    expect(result).toEqual([{ id: 'section', text: 'Section', level: 2 }])
  })

  it('returns empty array for empty string', () => {
    expect(extractHeadings('')).toEqual([])
  })

  it('produces sequential slugs for duplicate heading text', () => {
    const result = extractHeadings('## Intro\n## Intro')
    expect(result[0].id).toBe('intro')
    expect(result[1].id).toBe('intro-1')
  })
})
