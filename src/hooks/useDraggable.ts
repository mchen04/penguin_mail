import { useState, useCallback, useRef, useEffect } from 'react'

// Window boundary constants for drag constraints
const BOUNDARY_PADDING = {
  /** Minimum visible width on right edge */
  right: 100,
  /** Minimum visible height on bottom edge */
  bottom: 50,
  /** Maximum left overflow before element is pulled back */
  leftOverflow: 200,
} as const

interface Position {
  x: number
  y: number
}

interface UseDraggableOptions {
  initialPosition?: Position
  boundToWindow?: boolean
}

interface UseDraggableReturn {
  position: Position
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  resetPosition: () => void
}

export function useDraggable({
  initialPosition = { x: 0, y: 0 },
  boundToWindow = true,
}: UseDraggableOptions = {}): UseDraggableReturn {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<Position>({ x: 0, y: 0 })
  const elementStart = useRef<Position>({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag on primary button
    if (e.button !== 0) return

    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    elementStart.current = { ...position }
  }, [position])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.current.x
    const deltaY = e.clientY - dragStart.current.y

    let newX = elementStart.current.x + deltaX
    let newY = elementStart.current.y + deltaY

    if (boundToWindow) {
      // Keep within viewport bounds
      const maxX = window.innerWidth - BOUNDARY_PADDING.right
      const maxY = window.innerHeight - BOUNDARY_PADDING.bottom
      const minX = -window.innerWidth + BOUNDARY_PADDING.leftOverflow
      newX = Math.max(minX, Math.min(maxX, newX))
      newY = Math.max(0, Math.min(maxY, newY))
    }

    setPosition({ x: newX, y: newY })
  }, [isDragging, boundToWindow])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const resetPosition = useCallback(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  return {
    position,
    isDragging,
    handleMouseDown,
    resetPosition,
  }
}
