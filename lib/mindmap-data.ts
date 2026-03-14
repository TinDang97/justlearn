import fs from 'fs'
import path from 'path'
import type { Node, Edge } from '@xyflow/react'
import dagre from '@dagrejs/dagre'

const COURSES_DIR = path.join(process.cwd(), 'courses')

const NODE_WIDTH = 150
const NODE_HEIGHT = 40

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

export function layoutMindmapData(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    }
  })

  return { nodes: positionedNodes, edges }
}
