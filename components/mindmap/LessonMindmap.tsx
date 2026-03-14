'use client'

import { useMemo } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from '@xyflow/react'
import type { Node, Edge, NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'motion/react'
import { MindmapNode } from './MindmapNode'
import { layoutMindmapData } from '@/lib/mindmap-layout'

const nodeTypes: NodeTypes = { mindmap: MindmapNode as NodeTypes[string] }

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

type LessonMindmapProps = {
  nodes: Node[]
  edges: Edge[]
}

export function LessonMindmap({ nodes: initialNodes, edges: initialEdges }: LessonMindmapProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => layoutMindmapData(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  )

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ width: '100%', height: 400 }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        zoomOnScroll
        panOnDrag
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </motion.div>
  )
}
