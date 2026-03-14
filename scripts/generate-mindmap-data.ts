import fs from 'fs'
import path from 'path'
import { getAllCourses } from '../lib/content'

const COURSES_DIR = path.join(process.cwd(), 'courses')
const H2_REGEX = /^##\s+(.+)$/gm
const TITLE_REGEX = /^#\s+Lesson\s+\d+:\s+(.+)$/m

function generateMindmapForLesson(
  courseSlug: string,
  lessonSlug: string
): void {
  const lessonPath = path.join(COURSES_DIR, courseSlug, `${lessonSlug}.md`)

  if (!fs.existsSync(lessonPath)) {
    console.warn(`  [warn] Lesson file not found: ${lessonPath}`)
    return
  }

  const content = fs.readFileSync(lessonPath, 'utf-8')

  const titleMatch = content.match(TITLE_REGEX)
  const lessonTitle = titleMatch?.[1]?.trim() ?? lessonSlug

  const h2Matches = [...content.matchAll(H2_REGEX)]
  const h2Headings = h2Matches.map((m) => m[1].trim())

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

  const mindmapsDir = path.join(COURSES_DIR, courseSlug, 'mindmaps')
  fs.mkdirSync(mindmapsDir, { recursive: true })

  const outputPath = path.join(mindmapsDir, `${lessonSlug}.json`)
  fs.writeFileSync(outputPath, JSON.stringify({ nodes, edges }, null, 2), 'utf-8')
}

function main(): void {
  const courses = getAllCourses()
  let total = 0

  for (const course of courses) {
    console.log(`Processing course: ${course.slug} (${course.lessons.length} lessons)`)
    for (const lesson of course.lessons) {
      generateMindmapForLesson(course.slug, lesson.slug)
      total++
    }
  }

  console.log(`\nGenerated mindmap data for ${total} lessons.`)
}

main()
