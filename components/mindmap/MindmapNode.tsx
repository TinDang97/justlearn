'use client'

import { Handle, Position } from '@xyflow/react'
import { motion } from 'motion/react'
import type { Node, NodeProps } from '@xyflow/react'

export type MindmapNodeData = {
  label: string
}

export type MindmapNode = Node<MindmapNodeData, 'mindmap'>

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

export function MindmapNode({ data }: NodeProps<MindmapNode>) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <motion.div
        variants={nodeVariants}
        className="rounded border bg-card px-3 py-1 text-sm shadow-sm"
      >
        {data.label}
      </motion.div>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}
