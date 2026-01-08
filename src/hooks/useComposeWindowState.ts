import { useState, useCallback, useEffect } from 'react'
import { COMPOSE_WINDOW, STORAGE_KEYS } from '@/constants'

interface Size {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

interface UseComposeWindowStateReturn {
  size: Size
  position: Position
  setSize: (size: Size) => void
  setPosition: (position: Position) => void
  resetToDefaults: () => void
}

function getDefaultPosition(): Position {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 }
  }
  return {
    x: window.innerWidth - COMPOSE_WINDOW.DEFAULT_WIDTH - COMPOSE_WINDOW.DEFAULT_RIGHT,
    y: window.innerHeight - COMPOSE_WINDOW.DEFAULT_HEIGHT - COMPOSE_WINDOW.DEFAULT_BOTTOM,
  }
}

function getDefaultSize(): Size {
  return {
    width: COMPOSE_WINDOW.DEFAULT_WIDTH,
    height: COMPOSE_WINDOW.DEFAULT_HEIGHT,
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return JSON.parse(saved) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

export function useComposeWindowState(): UseComposeWindowStateReturn {
  const [size, setSizeState] = useState<Size>(() =>
    loadFromStorage(STORAGE_KEYS.COMPOSE_SIZE, getDefaultSize())
  )

  const [position, setPositionState] = useState<Position>(() =>
    loadFromStorage(STORAGE_KEYS.COMPOSE_POSITION, getDefaultPosition())
  )

  // Ensure position is valid on mount (window may have resized)
  useEffect(() => {
    const defaultPos = getDefaultPosition()
    const currentPos = loadFromStorage(STORAGE_KEYS.COMPOSE_POSITION, defaultPos)

    // Clamp position to be within viewport
    const maxX = window.innerWidth - COMPOSE_WINDOW.MIN_WIDTH
    const maxY = window.innerHeight - COMPOSE_WINDOW.MIN_HEIGHT

    const clampedX = Math.max(0, Math.min(currentPos.x, maxX))
    const clampedY = Math.max(0, Math.min(currentPos.y, maxY))

    if (clampedX !== currentPos.x || clampedY !== currentPos.y) {
      setPositionState({ x: clampedX, y: clampedY })
    }
  }, [])

  const setSize = useCallback((newSize: Size) => {
    setSizeState(newSize)
    localStorage.setItem(STORAGE_KEYS.COMPOSE_SIZE, JSON.stringify(newSize))
  }, [])

  const setPosition = useCallback((newPosition: Position) => {
    setPositionState(newPosition)
    localStorage.setItem(STORAGE_KEYS.COMPOSE_POSITION, JSON.stringify(newPosition))
  }, [])

  const resetToDefaults = useCallback(() => {
    const defaultSize = getDefaultSize()
    const defaultPosition = getDefaultPosition()
    setSizeState(defaultSize)
    setPositionState(defaultPosition)
    localStorage.removeItem(STORAGE_KEYS.COMPOSE_SIZE)
    localStorage.removeItem(STORAGE_KEYS.COMPOSE_POSITION)
  }, [])

  return { size, position, setSize, setPosition, resetToDefaults }
}
