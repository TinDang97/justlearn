'use client'

import { useEffect } from 'react'
import { useProgressStore } from '@/lib/store/progress'

export function ProgressHydration() {
  useEffect(() => {
    useProgressStore.persist.rehydrate()
  }, [])
  return null
}
