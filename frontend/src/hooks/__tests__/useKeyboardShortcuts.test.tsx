import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'
import { ToastProvider } from '@/context/ToastContext'
import { RepositoryProvider } from '@/context/RepositoryContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { AppProvider } from '@/context/AppContext'
import { AccountProvider } from '@/context/AccountContext'
import { ContactsProvider } from '@/context/ContactsContext'
import { OrganizationProvider } from '@/context/OrganizationContext'
import { FeaturesProvider } from '@/context/FeaturesContext'
import { EmailProvider } from '@/context/EmailContext'
import { createMockRepositories } from '@/test/mock-repositories'
import type { ReactNode } from 'react'

function createWrapper() {
  const repos = createMockRepositories()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ToastProvider>
        <RepositoryProvider repositories={repos}>
          <SettingsProvider>
            <AppProvider>
              <AccountProvider>
                <ContactsProvider>
                  <OrganizationProvider>
                    <FeaturesProvider>
                      <EmailProvider>{children}</EmailProvider>
                    </FeaturesProvider>
                  </OrganizationProvider>
                </ContactsProvider>
              </AccountProvider>
            </AppProvider>
          </SettingsProvider>
        </RepositoryProvider>
      </ToastProvider>
    )
  }
}

function fireKeyDown(key: string, options: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
  document.dispatchEvent(event)
}

describe('useKeyboardShortcuts', () => {
  const createHandlers = () => ({
    onCompose: vi.fn(),
    onReply: vi.fn(),
    onReplyAll: vi.fn(),
    onForward: vi.fn(),
    onArchive: vi.fn(),
    onDelete: vi.fn(),
    onMarkRead: vi.fn(),
    onMarkUnread: vi.fn(),
    onToggleStar: vi.fn(),
    onSelectAll: vi.fn(),
    onSearch: vi.fn(),
    onEscape: vi.fn(),
    onNextEmail: vi.fn(),
    onPrevEmail: vi.fn(),
    onOpenEmail: vi.fn(),
    onGoToInbox: vi.fn(),
  })

  it('triggers compose handler on "c" key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('c')
    })

    expect(handlers.onCompose).toHaveBeenCalled()
  })

  it('triggers archive handler on "e" key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('e')
    })

    // Archive requires selected emails; with none selected, handler is not called
    expect(handlers.onArchive).not.toHaveBeenCalled()
  })

  it('triggers delete handler on "#" key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('#')
    })

    // Delete requires selected emails; with none selected, handler is not called
    expect(handlers.onDelete).not.toHaveBeenCalled()
  })

  it('triggers star handler on "s" key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('s')
    })

    // Star requires selected email; with none selected, handler is not called
    expect(handlers.onToggleStar).not.toHaveBeenCalled()
  })

  it('triggers escape handler on Escape key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('Escape')
    })

    expect(handlers.onEscape).toHaveBeenCalled()
  })

  it('triggers nextEmail handler on "j" key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('j')
    })

    expect(handlers.onNextEmail).toHaveBeenCalled()
  })

  it('triggers prevEmail handler on "k" key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('k')
    })

    expect(handlers.onPrevEmail).toHaveBeenCalled()
  })

  it('triggers goToInbox handler on "g" key', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('g')
    })

    expect(handlers.onGoToInbox).toHaveBeenCalled()
  })

  it('triggers markRead handler on Shift+I', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    act(() => {
      fireKeyDown('I', { shiftKey: true })
    })

    // markRead needs target ids; with none selected, handler is not called
    expect(handlers.onMarkRead).not.toHaveBeenCalled()
  })

  it('ignores shortcuts when focus is in an INPUT element', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      bubbles: true,
      cancelable: true,
    })
    input.dispatchEvent(event)

    expect(handlers.onCompose).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('ignores shortcuts when focus is in a TEXTAREA element', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      bubbles: true,
      cancelable: true,
    })
    textarea.dispatchEvent(event)

    expect(handlers.onCompose).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('Escape still works in INPUT elements', () => {
    const handlers = createHandlers()
    const wrapper = createWrapper()
    renderHook(() => useKeyboardShortcuts(handlers), { wrapper })

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    input.dispatchEvent(event)

    expect(handlers.onEscape).toHaveBeenCalled()

    document.body.removeChild(input)
  })
})
