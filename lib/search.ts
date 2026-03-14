import React from 'react'

/**
 * highlight — wraps matched character ranges in <mark> elements.
 *
 * @param value   — the original string
 * @param indices — array of [start, end] inclusive pairs from Fuse.js match indices
 * @returns React.ReactNode: plain string when no indices, array of strings/marks otherwise
 */
export function highlight(
  value: string,
  indices: readonly [number, number][]
): React.ReactNode {
  if (!indices || indices.length === 0) {
    return value
  }

  const nodes: React.ReactNode[] = []
  let cursor = 0

  for (let i = 0; i < indices.length; i++) {
    const [start, end] = indices[i]

    // Plain text before this match
    if (cursor < start) {
      nodes.push(value.slice(cursor, start))
    }

    // Highlighted match
    nodes.push(
      React.createElement(
        'mark',
        {
          key: `mark-${i}`,
          className: 'bg-yellow-200 dark:bg-yellow-800 rounded-sm',
        },
        value.slice(start, end + 1)
      )
    )

    cursor = end + 1
  }

  // Remaining plain text after last match
  if (cursor < value.length) {
    nodes.push(value.slice(cursor))
  }

  return nodes
}
