import fs from 'fs'
import path from 'path'
import Fuse from 'fuse.js'
import { getAllRegisteredCourses, getCourseData } from '../lib/course-registry'
import { COURSE_REGISTRY } from '../lib/course-registry'

interface SearchItem {
  id: string
  title: string
  courseTitle: string
  href: string
  description: string
}

const keys: (keyof SearchItem)[] = ['title', 'courseTitle', 'description']

function main() {
  const registeredCourses = getAllRegisteredCourses()

  const lessons: SearchItem[] = registeredCourses.flatMap((entry) => {
    const course = getCourseData(entry.slug)
    const registry = COURSE_REGISTRY[entry.slug]
    return course.allLessons.map((lesson) => ({
      id: `${entry.slug}/${lesson.slug}`,
      title: lesson.title,
      courseTitle: course.title,
      href: `/courses/${entry.slug}/${lesson.slug}`,
      description: registry?.description.slice(0, 160) ?? '',
    }))
  })

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
