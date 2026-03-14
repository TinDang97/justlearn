// LessonBreadcrumb is fully course-agnostic: all values (courseSlug, courseTitle,
// sectionSlug, sectionTitle, lessonTitle) are passed as props from the call site.
// No python-specific hardcoding exists in this component.
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type LessonBreadcrumbProps = {
  courseSlug: string
  courseTitle: string
  lessonTitle: string
  sectionSlug: string
  sectionTitle: string
}

export function LessonBreadcrumb({
  courseSlug,
  courseTitle,
  lessonTitle,
  sectionSlug,
  sectionTitle,
}: LessonBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/courses/${courseSlug}`}>{courseTitle}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/courses/${courseSlug}#${sectionSlug}`}>{sectionTitle}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{lessonTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
