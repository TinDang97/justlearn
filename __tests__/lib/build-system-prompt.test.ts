import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/build-system-prompt'
import type { LessonContext, RetrievedChunk } from '@/lib/build-system-prompt'
import type { AIPersona } from '@/lib/course-registry'

const mockPersona: AIPersona = {
  name: 'Alex',
  modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
  systemPrompt: 'You are Alex, a friendly Python tutor for complete beginners.',
}

const mockLessonContext: LessonContext = {
  title: 'Introduction to Python',
  sectionTitle: '01-python-fundamentals',
  courseSlug: 'python',
}

const mockChunks: RetrievedChunk[] = [
  { text: 'Chunk one text content', heading: 'Variables', lessonTitle: 'Introduction to Python' },
  { text: 'Chunk two text content', heading: 'Data Types', lessonTitle: 'Introduction to Python' },
  { text: 'Chunk three text content', heading: 'Functions', lessonTitle: 'Introduction to Python' },
  { text: 'Chunk four text content', heading: 'Loops', lessonTitle: 'Introduction to Python' },
]

describe('buildSystemPrompt', () => {
  it('output contains persona systemPrompt text', () => {
    const result = buildSystemPrompt(mockPersona, mockLessonContext, [])
    expect(result).toContain(mockPersona.systemPrompt)
  })

  it('output contains lessonContext.title', () => {
    const result = buildSystemPrompt(mockPersona, mockLessonContext, [])
    expect(result).toContain(mockLessonContext.title)
  })

  it('output contains "Relevant course content:" section when ragChunks provided', () => {
    const result = buildSystemPrompt(mockPersona, mockLessonContext, mockChunks)
    expect(result).toContain('Relevant course content:')
  })

  it('output does NOT contain "Relevant course content:" when ragChunks is empty array', () => {
    const result = buildSystemPrompt(mockPersona, mockLessonContext, [])
    expect(result).not.toContain('Relevant course content:')
  })

  it('safety prefix ("CRITICAL RULES") appears before persona systemPrompt in output', () => {
    const result = buildSystemPrompt(mockPersona, mockLessonContext, [])
    const safetyIndex = result.indexOf('CRITICAL RULES')
    const personaIndex = result.indexOf(mockPersona.systemPrompt)
    expect(safetyIndex).toBeGreaterThanOrEqual(0)
    expect(personaIndex).toBeGreaterThan(safetyIndex)
  })

  it('only first 3 chunks are included even if more are passed', () => {
    const result = buildSystemPrompt(mockPersona, mockLessonContext, mockChunks)
    // 4 chunks passed — only first 3 should appear
    expect(result).toContain('Chunk one text content')
    expect(result).toContain('Chunk two text content')
    expect(result).toContain('Chunk three text content')
    expect(result).not.toContain('Chunk four text content')
  })

  it('output contains chunk text content from provided chunks', () => {
    const singleChunk: RetrievedChunk[] = [
      { text: 'Unique chunk text for testing', heading: 'Test', lessonTitle: 'Test Lesson' },
    ]
    const result = buildSystemPrompt(mockPersona, mockLessonContext, singleChunk)
    expect(result).toContain('Unique chunk text for testing')
  })
})
