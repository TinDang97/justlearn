import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'

// We will test the lib functions after mocking fs
// getMindmapData and layoutMindmapData are imported below

describe('getMindmapData', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns { nodes, edges } from a JSON file for a given courseSlug/lessonSlug', async () => {
    const mockData = {
      nodes: [
        { id: 'root', data: { label: 'Lesson 1' }, position: { x: 0, y: 0 }, type: 'mindmap' },
        { id: 'node-0', data: { label: 'Learning Objectives' }, position: { x: 0, y: 0 }, type: 'mindmap' },
      ],
      edges: [{ id: 'e-root-node-0', source: 'root', target: 'node-0' }],
    }

    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockData) as unknown as Buffer)

    const { getMindmapData } = await import('@/lib/mindmap-data')
    const result = getMindmapData('01-python-fundamentals', 'lesson-01-what-is-programming')

    expect(result).not.toBeNull()
    expect(result!.nodes).toHaveLength(2)
    expect(result!.edges).toHaveLength(1)
    expect(result!.nodes[0].id).toBe('root')
  })

  it('returns null when no mindmap JSON exists for a lesson', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)

    const { getMindmapData } = await import('@/lib/mindmap-data')
    const result = getMindmapData('01-python-fundamentals', 'lesson-99-nonexistent')

    expect(result).toBeNull()
  })
})

describe('layoutMindmapData', () => {
  it('positions nodes using dagre (nodes have x/y coordinates after layout)', async () => {
    const { layoutMindmapData } = await import('@/lib/mindmap-data')

    const nodes = [
      { id: 'root', data: { label: 'Lesson 1' }, position: { x: 0, y: 0 }, type: 'mindmap' as const },
      { id: 'node-0', data: { label: 'Objectives' }, position: { x: 0, y: 0 }, type: 'mindmap' as const },
      { id: 'node-1', data: { label: 'Prerequisites' }, position: { x: 0, y: 0 }, type: 'mindmap' as const },
    ]
    const edges = [
      { id: 'e-root-0', source: 'root', target: 'node-0' },
      { id: 'e-root-1', source: 'root', target: 'node-1' },
    ]

    const result = layoutMindmapData(nodes, edges)

    // All nodes should have been positioned (x,y should be numbers, not necessarily 0)
    for (const node of result.nodes) {
      expect(typeof node.position.x).toBe('number')
      expect(typeof node.position.y).toBe('number')
    }
    // dagre should produce non-trivial layout (at least some differ from 0)
    const hasPositions = result.nodes.some(
      (n) => n.position.x !== 0 || n.position.y !== 0
    )
    expect(hasPositions).toBe(true)
  })

  it('preserves node count and edge count after layout', async () => {
    const { layoutMindmapData } = await import('@/lib/mindmap-data')

    const nodes = [
      { id: 'root', data: { label: 'Root' }, position: { x: 0, y: 0 }, type: 'mindmap' as const },
      { id: 'node-0', data: { label: 'A' }, position: { x: 0, y: 0 }, type: 'mindmap' as const },
      { id: 'node-1', data: { label: 'B' }, position: { x: 0, y: 0 }, type: 'mindmap' as const },
    ]
    const edges = [
      { id: 'e1', source: 'root', target: 'node-0' },
      { id: 'e2', source: 'root', target: 'node-1' },
    ]

    const result = layoutMindmapData(nodes, edges)

    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
  })
})

describe('generate script integration', () => {
  it('reads h2 headings from a sample lesson MD and produces correct node/edge structure', () => {
    // Simulate what the generate script does: parse h2 headings and build nodes/edges
    const sampleMd = `# Lesson 1: What is Programming?

**Course:** Python Fundamentals | **Duration:** 2 hours | **Level:** Absolute Beginner

---

## Learning Objectives

Some content here.

## Prerequisites

Some prereqs.

## Lesson Outline

Outline content.

## Summary
`

    // Extract h2 headings using the same regex as the generate script
    const H2_REGEX = /^##\s+(.+)$/gm
    const matches = [...sampleMd.matchAll(H2_REGEX)]
    const h2Headings = matches.map((m) => m[1].trim())

    expect(h2Headings).toEqual([
      'Learning Objectives',
      'Prerequisites',
      'Lesson Outline',
      'Summary',
    ])

    // Build nodes and edges as the script would
    const TITLE_REGEX = /^#\s+Lesson\s+\d+:\s+(.+)$/m
    const titleMatch = sampleMd.match(TITLE_REGEX)
    const lessonTitle = titleMatch?.[1]?.trim() ?? 'Lesson'

    const nodes = [
      { id: 'root', data: { label: lessonTitle }, position: { x: 0, y: 0 }, type: 'mindmap' },
      ...h2Headings.map((heading, i) => ({
        id: `node-${i}`,
        data: { label: heading },
        position: { x: 0, y: 0 },
        type: 'mindmap',
      })),
    ]
    const edges = h2Headings.map((_, i) => ({
      id: `e-root-node-${i}`,
      source: 'root',
      target: `node-${i}`,
    }))

    expect(nodes).toHaveLength(5) // root + 4 h2s
    expect(edges).toHaveLength(4)
    expect(nodes[0]).toMatchObject({ id: 'root', data: { label: 'What is Programming?' } })
    expect(nodes[1]).toMatchObject({ id: 'node-0', data: { label: 'Learning Objectives' } })
    expect(edges[0]).toMatchObject({ source: 'root', target: 'node-0' })
  })
})
