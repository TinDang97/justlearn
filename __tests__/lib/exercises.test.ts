import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockReadFileSync = vi.fn()

vi.mock('fs', () => ({
  default: { readFileSync: (...args: unknown[]) => mockReadFileSync(...args) },
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}))

describe('getExercises', () => {
  beforeEach(() => {
    vi.resetModules()
    mockReadFileSync.mockReset()
  })

  it('returns parsed exercise data when file exists', async () => {
    const mockData = {
      exercises: [
        {
          id: 'ex1',
          title: 'Hello',
          description: 'Print hello',
          starterCode: '# code\n',
          expectedOutput: 'hello',
          hints: ['Use print()'],
        },
      ],
    }

    mockReadFileSync.mockReturnValue(JSON.stringify(mockData))

    const { getExercises } = await import('@/lib/exercises')
    const result = getExercises('01-python-fundamentals', 'lesson-01-what-is-programming')

    expect(result).toEqual(mockData)
    expect(result?.exercises).toHaveLength(1)
    expect(result?.exercises[0].title).toBe('Hello')
  })

  it('returns null when file does not exist', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT')
    })

    const { getExercises } = await import('@/lib/exercises')
    const result = getExercises('nonexistent', 'nonexistent')

    expect(result).toBeNull()
  })

  it('includes warmup data when present', async () => {
    const mockData = {
      exercises: [
        {
          id: 'ex1',
          title: 'Test',
          description: 'Test exercise',
          starterCode: '# code\n',
          expectedOutput: 'test',
        },
      ],
      warmup: {
        title: 'Quick Recall',
        description: 'From previous lesson',
        starterCode: '# warmup\n',
        expectedOutput: '42',
      },
    }

    mockReadFileSync.mockReturnValue(JSON.stringify(mockData))

    const { getExercises } = await import('@/lib/exercises')
    const result = getExercises('01-python-fundamentals', 'lesson-03-your-first-python-program')

    expect(result?.warmup).toBeDefined()
    expect(result?.warmup?.title).toBe('Quick Recall')
    expect(result?.warmup?.expectedOutput).toBe('42')
  })
})
