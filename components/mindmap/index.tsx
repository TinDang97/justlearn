'use client'

import dynamic from 'next/dynamic'
import type { MindmapData } from '@/lib/mindmap-data'
import { MindmapSkeleton } from './MindmapSkeleton'

const LessonMindmapClient = dynamic(
  () => import('./LessonMindmap').then((m) => m.LessonMindmap),
  { ssr: false, loading: () => <MindmapSkeleton /> }
)

type MindmapSectionProps = {
  data: MindmapData | null
}

export function MindmapSection({ data }: MindmapSectionProps) {
  if (!data) return null

  return <LessonMindmapClient nodes={data.nodes} edges={data.edges} />
}
