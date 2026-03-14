import { notFound } from 'next/navigation'
import { getUnifiedCourse } from '@/lib/content'
import { CourseSidebar } from '@/components/course-sidebar'
import { MobileSidebarTrigger } from '@/components/mobile-sidebar-trigger'

type Props = {
  params: Promise<{ courseSlug: string }>
  children: React.ReactNode
}

export default async function CourseLayout({ params, children }: Props) {
  const { courseSlug } = await params

  if (courseSlug !== 'python') {
    notFound()
  }

  const course = getUnifiedCourse()

  return (
    <div className="flex flex-1 overflow-hidden">
      <CourseSidebar courseSlug={courseSlug} sections={course.sections} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b">
          <MobileSidebarTrigger
            courseSlug={courseSlug}
            sections={course.sections}
            courseTitle={course.title}
          />
          <span className="text-sm text-muted-foreground truncate">
            {course.title}
          </span>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
