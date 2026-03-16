import fs from 'fs'
import path from 'path'
import { getUnifiedCourse } from './content'
import type { UnifiedCourse, LessonMeta, Section } from './content'

export type AIPersona = {
  name: string          // displayed in chat UI: "Alex" or "Sam"
  modelId: string       // WebLLM model ID — allows per-course override
  systemPrompt: string  // base persona instructions (tone, teaching style, scope)
}

export type CourseRegistryEntry = {
  slug: string
  title: string
  description: string
  color: string        // Tailwind bg class for catalog card accent, e.g. 'bg-blue-500'
  contentDir: string   // Relative to project root: 'courses/01-python-fundamentals', etc.
                       // For multi-section courses like python, this is the PARENT prefix
  aiPersona: AIPersona
}

export type CourseConfig = CourseRegistryEntry & {
  buildCourse: () => UnifiedCourse
}

function buildPythonCourse(): UnifiedCourse {
  return getUnifiedCourse()
}

function buildDECourse(): UnifiedCourse {
  const deDir = path.join(process.cwd(), 'courses', 'data-engineering')

  // If directory doesn't exist, return empty course
  if (!fs.existsSync(deDir)) {
    return {
      slug: 'data-engineering',
      title: 'Data Engineering',
      sections: [],
      allLessons: [],
    }
  }

  const entries = fs.readdirSync(deDir)
  const sectionDirs = entries
    .filter((name) => {
      const fullPath = path.join(deDir, name)
      return fs.statSync(fullPath).isDirectory()
    })
    .sort()

  const sections: Section[] = []
  const allFlat: LessonMeta[] = []

  for (let sectionIdx = 0; sectionIdx < sectionDirs.length; sectionIdx++) {
    const sectionSlug = sectionDirs[sectionIdx]
    const sectionDir = path.join(deDir, sectionSlug)

    const lessonFiles = fs
      .readdirSync(sectionDir)
      .filter((f) => f.startsWith('lesson-') && f.endsWith('.md'))
      .sort()

    if (lessonFiles.length === 0) continue

    const lessonsMeta: Omit<LessonMeta, 'prev' | 'next'>[] = lessonFiles.map((file) => {
      const lessonSlug = file.replace('.md', '')
      const content = fs.readFileSync(path.join(sectionDir, file), 'utf-8')
      const titleMatch = content.match(/^#\s+Lesson\s+\d+:\s+(.+)$/m)
      const metaMatch = content.match(
        /\*\*Course:\*\*\s+([^|]+)\s*\|\s*\*\*Duration:\*\*\s+([^|]+)\s*\|\s*\*\*Level:\*\*\s+(.+)$/m
      )
      const lessonNumber = parseInt(lessonSlug.match(/lesson-(\d+)/)?.[1] ?? '0', 10)

      return {
        slug: lessonSlug,
        courseSlug: 'data-engineering',
        sourceCourseSlug: `data-engineering/${sectionSlug}`,
        sectionSlug,
        title: titleMatch?.[1]?.trim() ?? lessonSlug,
        lessonNumber,
        duration: metaMatch?.[2]?.trim() ?? 'Unknown',
        level: metaMatch?.[3]?.trim() ?? 'Unknown',
      }
    })

    allFlat.push(...lessonsMeta.map((l) => ({ ...l, prev: null, next: null })))
  }

  // Recompute prev/next globally
  const allLessons: LessonMeta[] = allFlat.map((l, i) => ({
    ...l,
    prev: i > 0 ? allFlat[i - 1].slug : null,
    next: i < allFlat.length - 1 ? allFlat[i + 1].slug : null,
  }))

  // Rebuild sections with global prev/next
  let offset = 0
  const linkedSections: Section[] = []

  for (let sectionIdx = 0; sectionIdx < sectionDirs.length; sectionIdx++) {
    const sectionSlug = sectionDirs[sectionIdx]
    const sectionDir = path.join(deDir, sectionSlug)

    const lessonFiles = fs
      .readdirSync(sectionDir)
      .filter((f) => f.startsWith('lesson-') && f.endsWith('.md'))
      .sort()

    if (lessonFiles.length === 0) continue

    const sectionReadme = path.join(sectionDir, 'README.md')
    const readmeContent = fs.existsSync(sectionReadme)
      ? fs.readFileSync(sectionReadme, 'utf-8')
      : ''
    const titleMatch = readmeContent.match(/^#\s+(.+)$/m)

    const count = lessonFiles.length
    linkedSections.push({
      slug: sectionSlug,
      title: titleMatch?.[1]?.trim() ?? sectionSlug,
      order: sectionIdx + 1,
      lessons: allLessons.slice(offset, offset + count),
    })
    offset += count
  }

  return {
    slug: 'data-engineering',
    title: 'Data Engineering',
    sections: linkedSections,
    allLessons,
  }
}

export const COURSE_REGISTRY: Record<string, CourseConfig> = {
  python: {
    slug: 'python',
    title: 'Python Course',
    description: 'Master Python programming from fundamentals to advanced topics. 120+ lessons, 12 sections.',
    color: 'bg-blue-500',
    contentDir: 'courses',
    buildCourse: buildPythonCourse,
    aiPersona: {
      name: 'Alex',
      modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
      systemPrompt: `You are Alex, a friendly Python tutor for complete beginners. You explain concepts with simple everyday analogies and short runnable examples (max 10 lines of code). When a student makes an error, explain what went wrong in plain English before showing the fix. Never assume prior programming knowledge. Scope: only answer questions covered in the provided lesson excerpts. If a question falls outside this scope, say so clearly.`,
    },
  },
  'data-engineering': {
    slug: 'data-engineering',
    title: 'Data Engineering',
    description: 'Learn pandas, ETL pipelines, SQL, and real-world data workflows. 100+ lessons, 10 sections.',
    color: 'bg-emerald-500',
    contentDir: 'courses/data-engineering',
    buildCourse: buildDECourse,
    aiPersona: {
      name: 'Sam',
      modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
      systemPrompt: `You are Sam, a practical data engineering mentor with industry experience. You explain concepts through real-world pipeline and production scenarios. Assume the student knows Python fundamentals. Use technical precision — include exception handling, performance implications, and production considerations in your examples. Scope: only answer questions covered in the provided lesson excerpts. If a question falls outside this scope, say so clearly.`,
    },
  },
}

export function getCourseData(courseSlug: string): UnifiedCourse {
  const config = COURSE_REGISTRY[courseSlug]
  if (!config) {
    throw new Error(`Course '${courseSlug}' is not registered in COURSE_REGISTRY`)
  }
  return config.buildCourse()
}

export function getAllRegisteredCourses(): CourseRegistryEntry[] {
  return Object.values(COURSE_REGISTRY)
    .map(({ slug, title, description, color, contentDir, aiPersona }): CourseRegistryEntry => ({
      slug,
      title,
      description,
      color,
      contentDir,
      aiPersona,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}
