import { getAllRegisteredCourses, getCourseData } from '@/lib/content'
import { CourseCatalogCard } from './course-catalog-card'

export function CourseCatalog() {
  const courses = getAllRegisteredCourses()
  const courseCardData = courses.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    color: entry.color,
    totalLessons: getCourseData(entry.slug).allLessons.length,
  }))

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Available Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courseCardData.map((card) => (
          <CourseCatalogCard key={card.slug} {...card} />
        ))}
      </div>
    </div>
  )
}
