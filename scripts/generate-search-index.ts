import fs from 'fs'
import path from 'path'
import Fuse from 'fuse.js'
import { getAllCourses } from '../lib/content'

interface SearchItem {
  id: string
  title: string
  courseTitle: string
  href: string
}

const keys: (keyof SearchItem)[] = ['title', 'courseTitle']

function main() {
  const courses = getAllCourses()

  const lessons: SearchItem[] = courses.flatMap((course) =>
    course.lessons.map((lesson) => ({
      id: `${course.slug}/${lesson.slug}`,
      title: lesson.title,
      courseTitle: course.title,
      href: `/courses/${course.slug}/${lesson.slug}`,
    }))
  )

  const index = Fuse.createIndex(keys, lessons)

  const publicDir = path.join(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(
    path.join(publicDir, 'search-data.json'),
    JSON.stringify(lessons, null, 2)
  )
  fs.writeFileSync(
    path.join(publicDir, 'search-index.json'),
    JSON.stringify(index.toJSON(), null, 2)
  )

  console.log(`Generated search index for ${lessons.length} lessons`)
}

main()
