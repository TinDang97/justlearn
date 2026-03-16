import { describe, it, expect } from 'vitest'
import {
  extractCourseSlug,
  extractSectionSlug,
  extractLessonSlug,
  extractLessonTitle,
  stripMdxComponents,
  chunkByHeadings,
} from '@/scripts/generate-rag-index'

describe('extractCourseSlug', () => {
  it("returns 'data-engineering' for DE file paths", () => {
    expect(extractCourseSlug('courses/data-engineering/01-intro/lesson-01.md')).toBe(
      'data-engineering'
    )
  })

  it("returns 'python' for Python file paths", () => {
    expect(extractCourseSlug('courses/01-python-fundamentals/lesson-01.md')).toBe('python')
  })
})

describe('extractSectionSlug', () => {
  it('returns section slug for data-engineering path', () => {
    expect(
      extractSectionSlug(
        'courses/data-engineering/01-intro-data-engineering/lesson-01.md',
        'data-engineering'
      )
    ).toBe('01-intro-data-engineering')
  })

  it('returns section slug for python path', () => {
    expect(
      extractSectionSlug('courses/01-python-fundamentals/lesson-01.md', 'python')
    ).toBe('01-python-fundamentals')
  })
})

describe('extractLessonTitle', () => {
  it('returns the lesson title from H1 heading', () => {
    const raw = '# Lesson 1: Introduction to Python\n\nSome content'
    expect(extractLessonTitle(raw)).toBe('Introduction to Python')
  })

  it("returns 'Unknown Lesson' when no H1 heading found", () => {
    expect(extractLessonTitle('No heading here')).toBe('Unknown Lesson')
  })
})

describe('stripMdxComponents', () => {
  it('removes self-closing PracticeBlock tags', () => {
    const input = 'Some text\n<PracticeBlock id="1" />\nMore text'
    const result = stripMdxComponents(input)
    expect(result).not.toContain('<PracticeBlock')
    expect(result).toContain('Some text')
    expect(result).toContain('More text')
  })

  it('removes PracticeBlock with children', () => {
    const input =
      'Before\n<PracticeBlock id="1">\nSome practice content\n</PracticeBlock>\nAfter'
    const result = stripMdxComponents(input)
    expect(result).not.toContain('<PracticeBlock')
    expect(result).not.toContain('</PracticeBlock>')
    expect(result).toContain('Before')
    expect(result).toContain('After')
  })

  it('removes MDX import statements', () => {
    const input = "import { PracticeBlock } from '../components/PracticeBlock'\n\nSome content"
    const result = stripMdxComponents(input)
    expect(result).not.toContain('import { PracticeBlock }')
    expect(result).toContain('Some content')
  })

  it('preserves normal markdown content', () => {
    const input = '## Section Title\n\nThis is normal **markdown** content with `code`.'
    const result = stripMdxComponents(input)
    expect(result).toBe(input)
  })
})

describe('chunkByHeadings', () => {
  it('splits on H2/H3 boundaries', () => {
    const raw = `# Lesson 1: Intro

## Section One

Content for section one that is long enough to pass the 80 char minimum threshold for inclusion.

## Section Two

Content for section two that is also long enough to pass the 80 char minimum threshold.`
    const chunks = chunkByHeadings(raw, 'python', '01-python-fundamentals', 'lesson-01', 'Intro')
    expect(chunks.length).toBeGreaterThanOrEqual(2)
  })

  it('prepends metadata prefix to chunk text', () => {
    const raw = `# Lesson 1: Intro

## Variables

Variables in Python are used to store data values. They are like containers that hold information for later use in programs and scripts.`
    const chunks = chunkByHeadings(raw, 'python', '01-python-fundamentals', 'lesson-01', 'Intro')
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0].text).toContain('[Python Course > 01-python-fundamentals > Intro:')
  })

  it('skips chunks with body shorter than 80 chars', () => {
    const raw = `# Lesson 1: Intro

## Short

Too short.

## Long Section

This section has enough content to pass the minimum body length threshold of 80 characters for inclusion in the RAG index.`
    const chunks = chunkByHeadings(raw, 'python', '01-python-fundamentals', 'lesson-01', 'Intro')
    const shortChunk = chunks.find((c) => c.heading === 'Short')
    expect(shortChunk).toBeUndefined()
  })

  it('uses lessonTitle as heading for content before first heading', () => {
    const raw = `# Lesson 1: My Lesson Title

This is intro content before any headings. It needs to be long enough to pass the 80 character minimum body length threshold to be included in the index.

## First Heading

Content here that is also long enough to be included in the RAG index for this lesson.`
    const chunks = chunkByHeadings(
      raw,
      'python',
      '01-python-fundamentals',
      'lesson-01',
      'My Lesson Title'
    )
    // The intro content before the first H2 should use lessonTitle as its heading
    const introChunk = chunks.find((c) => c.heading === 'My Lesson Title')
    expect(introChunk).toBeDefined()
  })
})
