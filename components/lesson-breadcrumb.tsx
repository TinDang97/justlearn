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
