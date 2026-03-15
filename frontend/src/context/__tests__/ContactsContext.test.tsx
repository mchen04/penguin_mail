import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import { ContactsProvider, useContacts } from '../ContactsContext'
import { RepositoryProvider } from '../RepositoryContext'
import { createMockRepositories } from '@/test/mock-repositories'

const now = new Date()

const mockContacts = [
  { id: 'c-1', name: 'Alice Smith', email: 'alice@example.com', company: 'Acme', isFavorite: true, groups: ['g-1'], createdAt: now, updatedAt: now },
  { id: 'c-2', name: 'Bob Jones', email: 'bob@example.com', company: 'Widgets Inc', isFavorite: false, groups: [], createdAt: now, updatedAt: now },
  { id: 'c-3', name: 'Charlie Brown', email: 'charlie@example.com', company: 'Acme', isFavorite: false, groups: ['g-1'], createdAt: now, updatedAt: now },
]

const mockGroups = [
  { id: 'g-1', name: 'Work', color: '#ff0000', contactIds: ['c-1', 'c-3'], createdAt: now, updatedAt: now },
  { id: 'g-2', name: 'Family', color: '#00ff00', contactIds: [], createdAt: now, updatedAt: now },
]

function createWrapper() {
  const repos = createMockRepositories()
  repos.contacts.getAll = vi.fn().mockResolvedValue({ data: mockContacts, total: 3, page: 1, pageSize: 50, totalPages: 1 })
  repos.contactGroups.getAll = vi.fn().mockResolvedValue(mockGroups)
  repos.contacts.create = vi.fn().mockResolvedValue({
    success: true as const,
    data: { id: 'c-new', name: 'Dave Wilson', email: 'dave@example.com', isFavorite: false, groups: [], createdAt: now, updatedAt: now },
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <RepositoryProvider repositories={repos}>
      <ContactsProvider>{children}</ContactsProvider>
    </RepositoryProvider>
  )

  return { repos, wrapper }
}

describe('ContactsContext', () => {
  it('loads contacts and groups on mount', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(repos.contacts.getAll).toHaveBeenCalled()
    expect(repos.contactGroups.getAll).toHaveBeenCalled()
    expect(result.current.contacts.length).toBe(3)
    expect(result.current.groups.length).toBe(2)
  })

  it('setSearch filters contacts by name or email', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.setSearch('alice')
    })

    expect(result.current.filteredContacts.length).toBe(1)
    expect(result.current.filteredContacts[0].name).toBe('Alice Smith')

    act(() => {
      result.current.setSearch('example.com')
    })
    expect(result.current.filteredContacts.length).toBe(3)

    act(() => {
      result.current.setSearch('')
    })
    expect(result.current.filteredContacts.length).toBe(3)
  })

  it('setSelectedGroup filters contacts by group', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.setSelectedGroup('g-1')
    })

    const filtered = result.current.filteredContacts
    expect(filtered.length).toBe(2)
    expect(filtered.map((c) => c.name).sort()).toEqual(['Alice Smith', 'Charlie Brown'])
  })

  it('addContact calls repository and adds to state', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const newContact = { name: 'Dave Wilson', email: 'dave@example.com' }

    await act(async () => {
      await result.current.addContact(newContact)
    })

    expect(repos.contacts.create).toHaveBeenCalledWith(newContact)
    expect(result.current.contacts.length).toBe(4)
  })

  it('useContacts throws outside provider', () => {
    expect(() => {
      renderHook(() => useContacts())
    }).toThrow('useContacts must be used within a ContactsProvider')
  })
})
