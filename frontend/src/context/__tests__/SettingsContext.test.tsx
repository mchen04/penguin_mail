import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import { SettingsProvider, useSettings } from '../SettingsContext'
import { RepositoryProvider } from '../RepositoryContext'
import { createMockRepositories } from '@/test/mock-repositories'
import { createDefaultSettings } from '@/types/settings'

const mockSettings = {
  ...createDefaultSettings(),
  appearance: { theme: 'light' as const, density: 'default' as const, fontSize: 'medium' as const },
  signatures: [
    { id: 'sig-1', name: 'Default', content: 'Best regards', isDefault: true },
  ],
}

function createWrapper() {
  const repos = createMockRepositories()
  repos.settings.get = vi.fn().mockResolvedValue(mockSettings)
  repos.settings.update = vi.fn().mockResolvedValue({ success: true as const, data: mockSettings })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <RepositoryProvider repositories={repos}>
      <SettingsProvider>{children}</SettingsProvider>
    </RepositoryProvider>
  )

  return { repos, wrapper }
}

describe('SettingsContext', () => {
  it('loads settings from repository on mount', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(repos.settings.get).toHaveBeenCalled()
    expect(result.current.theme).toBe('light')
    expect(result.current.density).toBe('default')
  })

  it('setTheme updates theme', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
  })

  it('getShortcut returns shortcut by id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const shortcut = result.current.getShortcut('compose')
    expect(shortcut).toBeDefined()
    expect(shortcut?.key).toBe('c')
    expect(shortcut?.action).toBe('Compose new email')

    const missing = result.current.getShortcut('nonexistent')
    expect(missing).toBeUndefined()
  })

  it('addSignature adds to signatures array', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialCount = result.current.signatures.length

    act(() => {
      result.current.addSignature('Work Sig', 'Thanks, John')
    })

    expect(result.current.signatures.length).toBe(initialCount + 1)
    const newSig = result.current.signatures[result.current.signatures.length - 1]
    expect(newSig.name).toBe('Work Sig')
    expect(newSig.content).toBe('Thanks, John')
    expect(newSig.isDefault).toBe(false)
  })

  it('useSettings throws outside provider', () => {
    expect(() => {
      renderHook(() => useSettings())
    }).toThrow('useSettings must be used within a SettingsProvider')
  })
})
