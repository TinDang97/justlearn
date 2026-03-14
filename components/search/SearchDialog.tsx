'use client'

import { useState, useEffect, useRef } from 'react'
import Fuse, { type FuseResult } from 'fuse.js'
import Link from 'next/link'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { SearchHighlight } from './SearchHighlight'

interface SearchItem {
  id: string
  title: string
  courseTitle: string
  href: string
  description: string
}

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([])
  const [loading, setLoading] = useState(false)
  // Use ref to avoid stale closures and prevent multiple loads
  const fuseRef = useRef<Fuse<SearchItem> | null>(null)
  const loadingRef = useRef(false)

  // Load search index lazily when dialog opens
  async function loadIndex() {
    if (fuseRef.current || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const [dataRes, indexRes] = await Promise.all([
        fetch('/search-data.json'),
        fetch('/search-index.json'),
      ])
      const data: SearchItem[] = await dataRes.json()
      const indexData = await indexRes.json()
      const parsedIndex = Fuse.parseIndex<SearchItem>(indexData)
      fuseRef.current = new Fuse(data, {
        keys: ['title', 'courseTitle', 'description'],
        threshold: 0.4,
        includeMatches: true,
        minMatchCharLength: 2,
      }, parsedIndex)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load index on dialog open
  useEffect(() => {
    if (open) {
      loadIndex()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Run search when query changes (after index is loaded)
  useEffect(() => {
    if (!fuseRef.current || query.length < 2) {
      setResults([])
      return
    }
    const searchResults = fuseRef.current.search(query, { limit: 10 })
    setResults(searchResults)
  }, [query, loading]) // depend on loading so we re-run after index loads

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setQuery('')
      setResults([])
    }
  }

  function handleResultClick() {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground"
          aria-label="Search lessons"
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px]">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-lg gap-0">
        <div className="flex items-center border-b px-3">
          <Search className="size-4 mr-2 shrink-0 text-muted-foreground" />
          <input
            className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search lessons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search query"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {loading && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Loading search index...
            </p>
          )}
          {!loading && query.length < 2 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </p>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No lessons found for &ldquo;{query}&rdquo;
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul role="listbox">
              {results.map((result) => {
                const titleMatch = result.matches?.find((m) => m.key === 'title')
                const titleIndices = (titleMatch?.indices ?? []) as [number, number][]
                return (
                  <li key={result.item.id}>
                    <Link
                      href={result.item.href}
                      onClick={handleResultClick}
                      className="flex flex-col gap-0.5 rounded-md px-2 py-2 hover:bg-accent"
                    >
                      <span className="text-xs text-muted-foreground">
                        {result.item.courseTitle}
                      </span>
                      <span className="text-sm font-medium">
                        <SearchHighlight
                          value={result.item.title}
                          indices={titleIndices}
                        />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
