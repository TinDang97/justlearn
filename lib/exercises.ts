import fs from 'fs'
import path from 'path'

export type Exercise = {
  id: string
  title: string
  description: string
  starterCode: string
  expectedOutput?: string
  hints?: string[]
}

export type WarmUp = {
  title: string
  description: string
  starterCode: string
  expectedOutput?: string
}

export type LessonExercises = {
  exercises: Exercise[]
  warmup?: WarmUp
}

const COURSES_DIR = path.join(process.cwd(), 'courses')

export function getExercises(courseSlug: string, lessonSlug: string): LessonExercises | null {
  const filePath = path.join(COURSES_DIR, courseSlug, 'exercises', `${lessonSlug}.json`)
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as LessonExercises
  } catch {
    return null
  }
}
