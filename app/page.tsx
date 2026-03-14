import type { Metadata } from 'next'
import { getUnifiedCourse } from '@/lib/content'
import { HeroSection } from '@/components/homepage/hero-section'
import { SectionCardsGrid } from '@/components/homepage/section-cards-grid'

export const metadata: Metadata = {
  title: 'JustLearn — Learn Python from Zero to Confident',
  description:
    'A free, structured Python course that takes you from "what is code?" to building real programs. No prerequisites. No overwhelm. Just learn.',
}

export default function HomePage() {
  const course = getUnifiedCourse()

  return (
    <>
      <HeroSection courseSlug={course.slug} />
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <SectionCardsGrid sections={course.sections} courseSlug={course.slug} />
      </div>
    </>
  )
}
