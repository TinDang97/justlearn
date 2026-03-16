'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles } from 'lucide-react'
import { useChatStore } from '@/lib/store/chat'

interface TextSelectionAskAIProps {
  containerRef: React.RefObject<HTMLElement | null>
}

interface ButtonPosition {
  top: number
  left: number
}

export function TextSelectionAskAI({ containerRef }: TextSelectionAskAIProps) {
  const [selectedText, setSelectedText] = useState<string>('')
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition | null>(null)

  const detectSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setSelectedText('')
      setButtonPosition(null)
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      setSelectedText('')
      setButtonPosition(null)
      return
    }

    // Verify the selection is within the container
    const container = containerRef.current
    if (!container) return

    const range = selection.getRangeAt(0)
    if (!container.contains(range.commonAncestorContainer)) {
      setSelectedText('')
      setButtonPosition(null)
      return
    }

    // getBoundingClientRect may not be available in all environments (e.g., tests)
    if (typeof range.getBoundingClientRect !== 'function') return
    const rect = range.getBoundingClientRect()
    setSelectedText(text)
    setButtonPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + rect.width / 2,
    })
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mouseup', detectSelection)
    document.addEventListener('selectionchange', detectSelection)

    return () => {
      container.removeEventListener('mouseup', detectSelection)
      document.removeEventListener('selectionchange', detectSelection)
    }
  }, [containerRef, detectSelection])

  function handleMouseDown(e: React.MouseEvent) {
    // Prevent clearing selection before click fires
    e.preventDefault()
  }

  function handleClick() {
    if (!selectedText) return
    useChatStore.getState().openPanelWithQuestion(`Explain this: ${selectedText}`)
    // Clear the button after clicking
    setSelectedText('')
    setButtonPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  if (!selectedText || !buttonPosition) return null

  return createPortal(
    <button
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      aria-label="Ask AI"
      className="rounded-full px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-lg flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
      style={{
        position: 'absolute',
        top: buttonPosition.top,
        left: buttonPosition.left,
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
    >
      <Sparkles className="size-3" />
      Ask AI
    </button>,
    document.body,
  )
}
