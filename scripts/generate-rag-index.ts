// scripts/generate-rag-index.ts
// Build-time RAG chunking and embedding pipeline.
// Mirrors scripts/generate-search-index.ts pattern.
// Run via: pnpm generate:rag

import { pipeline } from '@huggingface/transformers'
import { glob } from 'glob'
import fs from 'fs'
import path from 'path'

interface RagChunk {
  id: string          // unique: `${courseSlug}::${lessonSlug}::${chunkIndex}`
  courseSlug: string  // 'python' | 'data-engineering'
  sectionSlug: string // section directory name
  lessonSlug: string  // lesson file slug
  lessonTitle: string // from first H1 in file
  heading: string     // H2/H3 text that introduced this chunk
  text: string        // metadata-prefixed chunk text (what was embedded)
  embedding: number[] // Float32 as JSON number[] — 384 dimensions
}

export function extractCourseSlug(filePath: string): string {
  // courses/data-engineering/01-intro/lesson-01.md → 'data-engineering'
  // courses/ai-code-agents/01-introduction/lesson-01.md → 'ai-code-agents'
  // courses/01-python-fundamentals/lesson-01.md → 'python'
  const normalized = filePath.replace(/\\/g, '/')
  if (normalized.includes('/data-engineering/')) return 'data-engineering'
  if (normalized.includes('/ai-code-agents/')) return 'ai-code-agents'
  return 'python'
}

export function extractSectionSlug(filePath: string, courseSlug: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  if (courseSlug === 'data-engineering') {
    // courses/data-engineering/01-intro-data-engineering/lesson-01.md
    const match = normalized.match(/data-engineering\/([^/]+)\/lesson-/)
    return match?.[1] ?? 'unknown'
  }
  if (courseSlug === 'ai-code-agents') {
    // courses/ai-code-agents/01-introduction/lesson-01.md
    const match = normalized.match(/ai-code-agents\/([^/]+)\/lesson-/)
    return match?.[1] ?? 'unknown'
  }
  // courses/01-python-fundamentals/lesson-01.md
  const match = normalized.match(/courses\/([^/]+)\/lesson-/)
  return match?.[1] ?? 'unknown'
}

export function extractLessonSlug(filePath: string): string {
  return path.basename(filePath, '.md')
}

export function extractLessonTitle(raw: string): string {
  const match = raw.match(/^#\s+Lesson\s+\d+:\s+(.+)$/m)
  return match?.[1]?.trim() ?? 'Unknown Lesson'
}

export function stripMdxComponents(raw: string): string {
  return raw
    .replace(/<PracticeBlock[\s\S]*?\/>/g, '[interactive code exercise]')
    .replace(/<PracticeBlock[\s\S]*?<\/PracticeBlock>/g, '[interactive code exercise]')
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]/gm, '')
}

export function chunkByHeadings(
  raw: string,
  courseSlug: string,
  sectionSlug: string,
  _lessonSlug: string,
  lessonTitle: string
): Array<{ heading: string; text: string }> {
  const clean = stripMdxComponents(raw)
  // Split at heading boundaries (H1, H2, H3)
  const sections = clean.split(/^(?=#{1,3} )/m).filter((s) => s.trim().length > 0)
  const chunks: Array<{ heading: string; text: string }> = []
  const courseLabels: Record<string, string> = {
    'python': 'Python Course',
    'data-engineering': 'Data Engineering',
    'ai-code-agents': 'AI Code Agents',
  }
  const courseLabel = courseLabels[courseSlug] ?? courseSlug

  for (const section of sections) {
    const headingMatch = section.match(/^(#{1,3})\s+(.+)/)
    const headingLevel = headingMatch?.[1] ?? ''
    const headingText = headingMatch?.[2]?.trim()
    // Use lessonTitle for H1 headings (the "intro" section) and for content with no heading
    const heading = headingLevel === '#' || !headingText ? lessonTitle : headingText
    const body = section.replace(/^#{1,3}\s+.+\n?/, '').trim()
    if (body.length < 80) continue // skip near-empty sections
    const metaPrefix = `[${courseLabel} > ${sectionSlug} > ${lessonTitle}: ${heading}]`
    chunks.push({ heading, text: `${metaPrefix}\n\n${body}` })
  }

  return chunks
}

async function main(): Promise<void> {
  console.log('Generating RAG index...')

  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    dtype: 'q8', // quantized — faster build, negligible quality loss for retrieval
  })

  // Glob all lesson markdown files — both courses
  const mdFiles = (await glob('courses/**/*.md', { cwd: process.cwd() }))
    .filter((f) => path.basename(f).startsWith('lesson-'))
    .sort()

  console.log(`Found ${mdFiles.length} lesson files`)

  const allChunks: RagChunk[] = []

  for (const relFile of mdFiles) {
    const absFile = path.join(process.cwd(), relFile)
    const raw = fs.readFileSync(absFile, 'utf-8')
    const courseSlug = extractCourseSlug(relFile)
    const sectionSlug = extractSectionSlug(relFile, courseSlug)
    const lessonSlug = extractLessonSlug(relFile)
    const lessonTitle = extractLessonTitle(raw)

    const chunks = chunkByHeadings(raw, courseSlug, sectionSlug, lessonSlug, lessonTitle)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output: any = await extractor(chunk.text, { pooling: 'mean', normalize: true })
      allChunks.push({
        id: `${courseSlug}::${lessonSlug}::${i}`,
        courseSlug,
        sectionSlug,
        lessonSlug,
        lessonTitle,
        heading: chunk.heading,
        text: chunk.text,
        embedding: Array.from(output.data as Float32Array),
      })
    }
  }

  const outputPath = path.join(process.cwd(), 'public', 'data', 'rag-chunks.json')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(allChunks))

  console.log(
    `Generated ${allChunks.length} RAG chunks from ${mdFiles.length} lessons → public/data/rag-chunks.json`
  )
}

// Only run main() when executed directly (not when imported for testing)
const isMainModule = process.argv[1]?.endsWith('generate-rag-index.ts')
if (isMainModule) {
  main().catch((err) => {
    console.error('RAG index generation failed:', err)
    process.exit(1)
  })
}
