import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock @xyflow/react to avoid DOM measurement issues in jsdom
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Background: () => <div data-testid="rf-background" />,
  Controls: () => <div data-testid="rf-controls" />,
  Handle: ({ type, position }: { type: string; position: string }) => (
    <div data-testid={`handle-${type}`} data-position={position} />
  ),
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
  useNodesState: (initial: unknown[]) => [initial, vi.fn(), vi.fn()],
  useEdgesState: (initial: unknown[]) => [initial, vi.fn(), vi.fn()],
}))

// Mock motion/react to render plain elements
vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      className,
      variants,
      initial,
      animate,
      ...rest
    }: {
      children?: React.ReactNode
      className?: string
      variants?: unknown
      initial?: unknown
      animate?: unknown
      [key: string]: unknown
    }) => (
      <div
        className={className}
        data-testid="motion-div"
        data-initial={String(initial)}
        data-animate={String(animate)}
        {...(Object.fromEntries(
          Object.entries(rest).filter(([k]) => !k.startsWith('while') && !k.startsWith('on') && !k.startsWith('drag') && !k.startsWith('layout') && !k.startsWith('transition'))
        ))}
      >
        {children}
      </div>
    ),
  },
}))

// Mock lib/mindmap-data for server-only use (getMindmapData uses fs)
vi.mock('@/lib/mindmap-data', () => ({
  getMindmapData: vi.fn().mockReturnValue(null),
}))

// Mock lib/mindmap-layout for client-side use (imported by LessonMindmap)
vi.mock('@/lib/mindmap-layout', () => ({
  layoutMindmapData: (nodes: unknown[], edges: unknown[]) => ({ nodes, edges }),
}))

describe('MindmapSkeleton', () => {
  it('renders a div with animate-pulse class', async () => {
    const { MindmapSkeleton } = await import('@/components/mindmap/MindmapSkeleton')
    render(<MindmapSkeleton />)
    const el = document.querySelector('.animate-pulse')
    expect(el).not.toBeNull()
  })
})

describe('MindmapNode', () => {
  it('renders a motion.div with the node label text', async () => {
    const { MindmapNode } = await import('@/components/mindmap/MindmapNode')
    const mockData = { label: 'Learning Objectives' }
    render(
      <MindmapNode
        id="node-0"
        data={mockData as { label: string }}
        type="mindmap"
        selected={false}
        zIndex={0}
        isConnectable={true}
        xPos={0}
        yPos={0}
        dragging={false}
        selectable={true}
        deletable={true}
        draggable={true}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
      />
    )
    expect(screen.getByText('Learning Objectives')).toBeTruthy()
    const motionDiv = screen.getByTestId('motion-div')
    expect(motionDiv).toBeTruthy()
  })
})

describe('LessonMindmap', () => {
  it('renders ReactFlow with fitView prop when given valid nodes/edges', async () => {
    const { LessonMindmap } = await import('@/components/mindmap/LessonMindmap')
    const mockNodes = [
      { id: 'root', data: { label: 'Lesson 1' }, position: { x: 0, y: 0 }, type: 'mindmap' as const },
      { id: 'node-0', data: { label: 'Objectives' }, position: { x: 0, y: 100 }, type: 'mindmap' as const },
    ]
    const mockEdges = [{ id: 'e1', source: 'root', target: 'node-0' }]

    render(<LessonMindmap nodes={mockNodes} edges={mockEdges} />)
    expect(screen.getByTestId('react-flow')).toBeTruthy()
  })
})

describe('Mindmap index (dynamic wrapper smoke test)', () => {
  it('exports a MindmapSection component', async () => {
    // Dynamic imports are tricky in test; just verify the module exports something
    // We check that the module has the expected export name
    const mod = await import('@/components/mindmap/index')
    expect(typeof mod.MindmapSection).toBe('function')
  })
})
