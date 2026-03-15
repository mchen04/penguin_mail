import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppProvider, useApp } from '../AppContext'

beforeEach(() => {
  localStorage.clear()
})

function wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}

describe('AppContext', () => {
  it('openCompose sets state to open with mode new', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    act(() => {
      result.current.openCompose()
    })

    expect(result.current.composeState).toBe('open')
    expect(result.current.composeData).toEqual({ mode: 'new' })
  })

  it('closeCompose sets state to closed and clears data', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    act(() => {
      result.current.openCompose()
    })
    expect(result.current.composeState).toBe('open')

    act(() => {
      result.current.closeCompose()
    })

    expect(result.current.composeState).toBe('closed')
    expect(result.current.composeData).toBeNull()
  })

  it('openSettings and closeSettings toggles settingsOpen', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    expect(result.current.settingsOpen).toBe(false)

    act(() => {
      result.current.openSettings()
    })
    expect(result.current.settingsOpen).toBe(true)

    act(() => {
      result.current.closeSettings()
    })
    expect(result.current.settingsOpen).toBe(false)
  })

  it('toggleTheme switches between light and dark', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
  })

  it('setView changes currentView, showMail and showContacts work as convenience methods', () => {
    const { result } = renderHook(() => useApp(), { wrapper })

    expect(result.current.currentView).toBe('mail')

    act(() => {
      result.current.setView('contacts')
    })
    expect(result.current.currentView).toBe('contacts')

    act(() => {
      result.current.showMail()
    })
    expect(result.current.currentView).toBe('mail')

    act(() => {
      result.current.showContacts()
    })
    expect(result.current.currentView).toBe('contacts')
  })

  it('useApp throws if used outside AppProvider', () => {
    expect(() => {
      renderHook(() => useApp())
    }).toThrow('useApp must be used within an AppProvider')
  })
})
