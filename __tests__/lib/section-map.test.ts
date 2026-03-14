import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { SECTION_MAP } from '@/lib/section-map'

describe('SECTION_MAP', () => {
  it('has exactly 12 entries', () => {
    expect(Object.keys(SECTION_MAP)).toHaveLength(12)
  })

  it('orders are 1 through 12 with no gaps', () => {
    const orders = Object.values(SECTION_MAP).map((v) => v.order).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('every key matches an actual courses/ directory slug', () => {
    const coursesDir = path.join(process.cwd(), 'courses')
    const actualDirs = fs
      .readdirSync(coursesDir)
      .filter(
        (name) =>
          name !== 'README.md' &&
          fs.statSync(path.join(coursesDir, name)).isDirectory()
      )
    for (const key of Object.keys(SECTION_MAP)) {
      expect(actualDirs).toContain(key)
    }
  })

  it('each entry has a non-empty title string', () => {
    for (const [, value] of Object.entries(SECTION_MAP)) {
      expect(typeof value.title).toBe('string')
      expect(value.title.length).toBeGreaterThan(0)
    }
  })
})
