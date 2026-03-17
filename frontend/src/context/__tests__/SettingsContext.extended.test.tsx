/**
 * Extended tests for SettingsContext covering signatures, filters, blocked addresses,
 * keyboard shortcuts, vacation responder, and reset
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSettings } from '../SettingsContext'
import { createWrapper } from '@/test/test-utils'
import { createMockRepositories } from '@/test/mock-repositories'

function makeWrapper() {
  return createWrapper(createMockRepositories())
}

describe('SettingsContext - Signatures', () => {
  it('adds a signature', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.signatures).toBeDefined())

    act(() => {
      result.current.addSignature('Work', '<p>Best regards</p>')
    })

    expect(result.current.signatures).toHaveLength(1)
    expect(result.current.signatures[0].name).toBe('Work')
    expect(result.current.signatures[0].content).toBe('<p>Best regards</p>')
  })

  it('adds a default signature', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.signatures).toBeDefined())

    act(() => {
      result.current.addSignature('Primary', '<p>Hi</p>', true)
    })

    expect(result.current.signatures[0].isDefault).toBe(true)
  })

  it('updates a signature', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.signatures).toBeDefined())

    act(() => {
      result.current.addSignature('Work', '<p>Old</p>')
    })

    const id = result.current.signatures[0].id

    act(() => {
      result.current.updateSignature(id, { name: 'Updated' })
    })

    expect(result.current.signatures[0].name).toBe('Updated')
  })

  it('deletes a signature', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.signatures).toBeDefined())

    act(() => {
      result.current.addSignature('Work', '<p>Hi</p>')
    })

    const id = result.current.signatures[0].id

    act(() => {
      result.current.deleteSignature(id)
    })

    expect(result.current.signatures).toHaveLength(0)
  })

  it('sets a default signature', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.signatures).toBeDefined())

    act(() => {
      result.current.addSignature('Sig 1', '<p>Sig 1</p>')
      result.current.addSignature('Sig 2', '<p>Sig 2</p>')
    })

    const id2 = result.current.signatures[1].id

    act(() => {
      result.current.setDefaultSignature(id2)
    })

    const sig2 = result.current.signatures.find(s => s.id === id2)
    expect(sig2?.isDefault).toBe(true)
  })
})

describe('SettingsContext - Filters', () => {
  const filterData = {
    name: 'Test Filter',
    enabled: true,
    matchAll: true,
    conditions: [{ field: 'from' as const, operator: 'contains' as const, value: 'spam@' }],
    actions: [{ type: 'moveTo' as const, value: 'spam' }],
  }

  it('adds a filter', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.filters).toBeDefined())

    act(() => {
      result.current.addFilter(filterData)
    })

    expect(result.current.filters).toHaveLength(1)
    expect(result.current.filters[0].name).toBe('Test Filter')
  })

  it('updates a filter', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.filters).toBeDefined())

    act(() => {
      result.current.addFilter(filterData)
    })

    const id = result.current.filters[0].id

    act(() => {
      result.current.updateFilter(id, { name: 'Updated Filter' })
    })

    expect(result.current.filters[0].name).toBe('Updated Filter')
  })

  it('deletes a filter', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.filters).toBeDefined())

    act(() => {
      result.current.addFilter(filterData)
    })

    const id = result.current.filters[0].id

    act(() => {
      result.current.deleteFilter(id)
    })

    expect(result.current.filters).toHaveLength(0)
  })
})

describe('SettingsContext - Blocked addresses', () => {
  it('blocks an email address', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.blockedAddresses).toBeDefined())

    act(() => {
      result.current.blockAddress('spammer@evil.com')
    })

    expect(result.current.blockedAddresses).toContain('spammer@evil.com')
  })

  it('unblocks an email address', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.blockedAddresses).toBeDefined())

    act(() => {
      result.current.blockAddress('spammer@evil.com')
    })

    act(() => {
      result.current.unblockAddress('spammer@evil.com')
    })

    expect(result.current.blockedAddresses).not.toContain('spammer@evil.com')
  })

  it('isBlocked returns true for blocked address', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.blockedAddresses).toBeDefined())

    act(() => {
      result.current.blockAddress('blocked@test.com')
    })

    expect(result.current.isBlocked('blocked@test.com')).toBe(true)
  })

  it('isBlocked returns false for non-blocked address', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.blockedAddresses).toBeDefined())

    expect(result.current.isBlocked('notblocked@test.com')).toBe(false)
  })
})

describe('SettingsContext - Vacation responder', () => {
  it('updates vacation responder', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.vacationResponder).toBeDefined())

    act(() => {
      result.current.updateVacationResponder({ enabled: true, subject: 'Out of office' })
    })

    expect(result.current.vacationResponder.enabled).toBe(true)
    expect(result.current.vacationResponder.subject).toBe('Out of office')
  })
})

describe('SettingsContext - Keyboard shortcuts', () => {
  it('getShortcut returns undefined for unknown shortcut', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.keyboardShortcuts).toBeDefined())

    const shortcut = result.current.getShortcut('unknown-id')
    expect(shortcut).toBeUndefined()
  })

  it('updateKeyboardShortcut updates a shortcut', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => {
      expect(result.current.keyboardShortcuts.length).toBeGreaterThan(0)
    })

    const firstShortcut = result.current.keyboardShortcuts[0]
    const originalEnabled = firstShortcut.enabled

    act(() => {
      result.current.updateKeyboardShortcut(firstShortcut.id, { enabled: !originalEnabled })
    })

    const updated = result.current.keyboardShortcuts[0]
    expect(updated.enabled).toBe(!originalEnabled)
  })
})

describe('SettingsContext - Appearance', () => {
  it('setTheme updates theme', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.theme).toBeDefined())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
  })

  it('setDensity updates density', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.density).toBeDefined())

    act(() => {
      result.current.setDensity('compact')
    })

    expect(result.current.density).toBe('compact')
  })

  it('setFontSize updates font size', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.fontSize).toBeDefined())

    act(() => {
      result.current.setFontSize('large')
    })

    expect(result.current.fontSize).toBe('large')
  })
})

describe('SettingsContext - Notifications', () => {
  it('updateNotifications changes settings', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.notifications).toBeDefined())

    act(() => {
      result.current.updateNotifications({ desktopNotifications: true })
    })

    expect(result.current.notifications.desktopNotifications).toBe(true)
  })
})

describe('SettingsContext - Inbox behavior', () => {
  it('setConversationView toggles conversation view', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.conversationView).toBeDefined())

    const original = result.current.conversationView

    act(() => {
      result.current.setConversationView(!original)
    })

    expect(result.current.conversationView).toBe(!original)
  })

  it('setReadingPanePosition updates reading pane', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.readingPanePosition).toBeDefined())

    act(() => {
      result.current.setReadingPanePosition('bottom')
    })

    expect(result.current.readingPanePosition).toBe('bottom')
  })
})

describe('SettingsContext - Reset', () => {
  it('resetSettings calls repository reset', async () => {
    const repos = createMockRepositories()
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useSettings(), { wrapper })

    await waitFor(() => expect(result.current.signatures).toBeDefined())

    // Add a signature first
    act(() => {
      result.current.addSignature('Temp', '<p>Temp</p>')
    })

    expect(result.current.signatures).toHaveLength(1)

    await act(async () => {
      await result.current.resetSettings()
    })

    expect(repos.settings.reset).toHaveBeenCalled()
  })
})
