import fs from 'fs'
import path from 'path'
import type { Node, Edge } from '@xyflow/react'

// Re-export the layout function from the client-safe module so server code
// can import from one place, and tests continue to work without changes.
export { layoutMindmapData } from './mindmap-layout'

const COURSES_DIR = path.join(process.cwd(), 'courses')

export type MindmapData = {
  nodes: Node[]
  edges: Edge[]
}

export function getMindmapData(
  courseSlug: string,
  lessonSlug: string
): MindmapData | null {
  const filePath = path.join(
    COURSES_DIR,
    courseSlug,
    'mindmaps',
    `${lessonSlug}.json`
  )

  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as MindmapData
  } catch {
    return null
  }
}
