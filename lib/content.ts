import fs from 'fs'
import path from 'path'
import { SECTION_MAP } from './section-map'

const COURSES_DIR = path.join(process.cwd(), 'courses')

export type LessonMeta = {
  slug: string
  courseSlug: string
  sourceCourseSlug: string
  sectionSlug: string
  title: string
  lessonNumber: number
  duration: string
  level: string
  prev: string | null
  next: string | null
}

export type Section = {
  slug: string
  title: string
  order: number
  lessons: LessonMeta[]
}

export type UnifiedCourse = {
  slug: 'python'
  title: string
  sections: Section[]
  allLessons: LessonMeta[]
}

export type Course = {
  slug: string
  title: string
  description: string
  level: string
  lessonCount: number
  lessons: LessonMeta[]
}

// Regex patterns for inline bold metadata in lesson files
const TITLE_REGEX = /^#\s+Lesson\s+\d+:\s+(.+)$/m
const META_REGEX = /\*\*Course:\*\*\s+([^|]+)\s*\|\s*\*\*Duration:\*\*\s+([^|]+)\s*\|\s*\*\*Level:\*\*\s+(.+)$/m

// Regex patterns for course README.md
// Try to capture title before " - " subtitle; fall back to full title
const COURSE_TITLE_NARROW_REGEX = /^#\s+Course\s+\d+:\s+(.+?)\s+-\s+/m
const COURSE_TITLE_BROAD_REGEX = /^#\s+Course\s+\d+:\s+(.+)$/m
const COURSE_LEVEL_REGEX = /\*\*Level:\*\*\s+([^\n|]+)/m
// Some courses use "Course Description", others use "Course Overview"
const COURSE_DESC_REGEX = /##\s+(?:Course Description|Course Overview)\s*\n+([^\n#]+)/

function parseLessonMeta(
  content: string,
  slug: string,
  courseSlug: string
): Omit<LessonMeta, 'prev' | 'next'> {
  const titleMatch = content.match(TITLE_REGEX)
  const metaMatch = content.match(META_REGEX)
  const lessonNumber = parseInt(slug.match(/lesson-(\d+)/)?.[1] ?? '0', 10)

  return {
    slug,
    courseSlug,
    sourceCourseSlug: courseSlug,
    sectionSlug: courseSlug,
    title: titleMatch?.[1]?.trim() ?? slug,
    lessonNumber,
    duration: metaMatch?.[2]?.trim() ?? 'Unknown',
    level: metaMatch?.[3]?.trim() ?? 'Unknown',
  }
}

export function getAllCourses(): Course[] {
  const courseDirs = fs
    .readdirSync(COURSES_DIR)
    .filter(
      (name) =>
        name !== 'README.md' &&
        fs.statSync(path.join(COURSES_DIR, name)).isDirectory()
    )
    .sort()

  return courseDirs.map((courseSlug) => {
    const courseDir = path.join(COURSES_DIR, courseSlug)
    const readmePath = path.join(courseDir, 'README.md')
    const readmeContent = fs.existsSync(readmePath)
      ? fs.readFileSync(readmePath, 'utf-8')
      : ''

    const lessonFiles = fs
      .readdirSync(courseDir)
      .filter((f) => f.startsWith('lesson-') && f.endsWith('.md'))
      .sort()

    const lessonsMeta = lessonFiles.map((file) => {
      const slug = file.replace('.md', '')
      const content = fs.readFileSync(path.join(courseDir, file), 'utf-8')
      return parseLessonMeta(content, slug, courseSlug)
    })

    // Add prev/next links
    const lessons: LessonMeta[] = lessonsMeta.map((lesson, i) => ({
      ...lesson,
      prev: i > 0 ? lessonsMeta[i - 1].slug : null,
      next: i < lessonsMeta.length - 1 ? lessonsMeta[i + 1].slug : null,
    }))

    const titleMatch =
      readmeContent.match(COURSE_TITLE_NARROW_REGEX) ??
      readmeContent.match(COURSE_TITLE_BROAD_REGEX)
    const levelMatch = readmeContent.match(COURSE_LEVEL_REGEX)
    const descMatch = readmeContent.match(COURSE_DESC_REGEX)

    return {
      slug: courseSlug,
      title: titleMatch?.[1]?.trim() ?? courseSlug,
      description: descMatch?.[1]?.trim() ?? '',
      level: levelMatch?.[1]?.trim() ?? 'All Levels',
      lessonCount: lessons.length,
      lessons,
    }
  })
}

export function getCourse(courseSlug: string): Course | undefined {
  return getAllCourses().find((c) => c.slug === courseSlug)
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string
): LessonMeta | undefined {
  return getCourse(courseSlug)?.lessons.find((l) => l.slug === lessonSlug)
}

export function getUnifiedCourse(): UnifiedCourse {
  const rawCourses = getAllCourses()

  const sections: Section[] = rawCourses
    .map((c) => ({
      slug: c.slug,
      title: SECTION_MAP[c.slug]?.title ?? c.title,
      order: SECTION_MAP[c.slug]?.order ?? 99,
      lessons: c.lessons.map((l) => ({
        ...l,
        courseSlug: 'python',
        sourceCourseSlug: c.slug,
        sectionSlug: c.slug,
      })),
    }))
    .sort((a, b) => a.order - b.order)

  const allFlat = sections.flatMap((s) => s.lessons)

  // Recompute prev/next globally across section boundaries
  const allLessons: LessonMeta[] = allFlat.map((l, i) => ({
    ...l,
    prev: i > 0 ? allFlat[i - 1].slug : null,
    next: i < allFlat.length - 1 ? allFlat[i + 1].slug : null,
  }))

  // Sync section lessons with global prev/next
  let offset = 0
  const linkedSections = sections.map((s) => {
    const sectionLessons = allLessons.slice(offset, offset + s.lessons.length)
    offset += s.lessons.length
    return { ...s, lessons: sectionLessons }
  })

  return {
    slug: 'python',
    title: 'Python Course',
    sections: linkedSections,
    allLessons,
  }
}
