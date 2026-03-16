import { describe, it, expect } from 'vitest'
import { COURSE_REGISTRY } from '@/lib/course-registry'

describe('COURSE_REGISTRY persona config', () => {
  it('python entry has a non-empty aiPersona.name', () => {
    expect(typeof COURSE_REGISTRY.python.aiPersona.name).toBe('string')
    expect(COURSE_REGISTRY.python.aiPersona.name.length).toBeGreaterThan(0)
  })

  it('data-engineering entry has a non-empty aiPersona.name', () => {
    expect(typeof COURSE_REGISTRY['data-engineering'].aiPersona.name).toBe('string')
    expect(COURSE_REGISTRY['data-engineering'].aiPersona.name.length).toBeGreaterThan(0)
  })

  it('python and data-engineering persona names differ', () => {
    expect(COURSE_REGISTRY.python.aiPersona.name).not.toBe(
      COURSE_REGISTRY['data-engineering'].aiPersona.name
    )
  })

  it('each course persona has a non-empty systemPrompt', () => {
    for (const entry of Object.values(COURSE_REGISTRY)) {
      expect(typeof entry.aiPersona.systemPrompt).toBe('string')
      expect(entry.aiPersona.systemPrompt.length).toBeGreaterThan(0)
    }
  })

  it('each course persona has a modelId string', () => {
    for (const entry of Object.values(COURSE_REGISTRY)) {
      expect(typeof entry.aiPersona.modelId).toBe('string')
      expect(entry.aiPersona.modelId.length).toBeGreaterThan(0)
    }
  })
})
