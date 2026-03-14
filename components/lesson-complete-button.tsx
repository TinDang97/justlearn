'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useProgressStore } from '@/lib/store/progress'

type LessonCompleteButtonProps = {
  courseSlug: string
  lessonSlug: string
}

export function LessonCompleteButton({ courseSlug, lessonSlug }: LessonCompleteButtonProps) {
  const isComplete = useProgressStore((s) => s.isComplete(courseSlug, lessonSlug))
  const markComplete = useProgressStore((s) => s.markComplete)
  const markIncomplete = useProgressStore((s) => s.markIncomplete)

  const handleClick = () => {
    if (isComplete) {
      markIncomplete(courseSlug, lessonSlug)
    } else {
      markComplete(courseSlug, lessonSlug)
    }
  }

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
  }

  if (isComplete) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Button variant="outline" onClick={handleClick} className="gap-2 text-green-600 dark:text-green-400 border-green-500 dark:border-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div {...motionProps} className="inline-flex">
      <Button variant="default" onClick={handleClick} className="gap-2">
        <Circle className="h-4 w-4" />
        Mark Complete
      </Button>
    </motion.div>
  )
}
