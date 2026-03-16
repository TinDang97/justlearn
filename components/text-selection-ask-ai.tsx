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

  const handleMouseUp = useCallback(() => {
    // Small delay to let browser finalize selection
    requestAnimationFrame(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelectedText('')
        setButtonPosition(null)
        return
      }

      const text = selection.toString().trim()
      if (!text || text.length < 3) {
        setSelectedText('')
        setButtonPosition(null)
        return
      }

      // Verify the selection is within the container
      const container = containerRef.current
      if (!container) return

      const range = selection.getRangeAt(0)
      if (!container.contains(range.startContainer)) {
        setSelectedText('')
        setButtonPosition(null)
        return
      }

      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return

      setSelectedText(text)
      setButtonPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
      })
    })
  }, [containerRef])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // If clicking outside the floating button, clear selection state
    const target = e.target as HTMLElement
    if (target.closest('[data-ask-ai-button]')) return
    setSelectedText('')
    setButtonPosition(null)
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleMouseUp, handleMouseDown])

  function handleButtonMouseDown(e: React.MouseEvent) {
    e.preventDefault()
  }

  function handleClick() {
    if (!selectedText) return
    useChatStore.getState().openPanelWithQuestion(`Explain this: ${selectedText}`)
    setSelectedText('')
    setButtonPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  if (!selectedText || !buttonPosition) return null

  return createPortal(
    <button
      data-ask-ai-button
      onMouseDown={handleButtonMouseDown}
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
