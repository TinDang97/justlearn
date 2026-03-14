import type { Metadata } from 'next'
import { HeroSection } from '@/components/homepage/hero-section'
import { CourseCatalog } from '@/components/homepage/course-catalog'

export const metadata: Metadata = {
  title: 'JustLearn — Learn Programming and Data Skills',
  description:
    'Free structured courses in Python and Data Engineering. Learn with interactive practice, mindmaps, and AI-powered assistance.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <CourseCatalog />
      </div>
    </>
  )
}
