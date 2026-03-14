import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllCourses } from '@/lib/content'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Python Beginner Courses',
  description:
    'Learn Python from scratch with 12 structured courses covering fundamentals, data types, control flow, functions, OOP, file handling, and more.',
}

export default function CoursesPage() {
  const courses = getAllCourses()

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Python Beginner Courses</h1>
      <p className="text-muted-foreground mb-8">
        {courses.length} courses · {courses.reduce((acc, c) => acc + c.lessonCount, 0)} lessons
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link key={course.slug} href={`/courses/${course.slug}`} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary">{course.level}</Badge>
                  <Badge variant="outline">{course.lessonCount} lessons</Badge>
                </div>
                <CardTitle className="text-lg leading-snug">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">{course.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
