import React from 'react'
import { highlight } from '@/lib/search'

interface SearchHighlightProps {
  value: string
  indices: readonly [number, number][]
}

export function SearchHighlight({ value, indices }: SearchHighlightProps) {
  return React.createElement(React.Fragment, null, highlight(value, indices))
}
