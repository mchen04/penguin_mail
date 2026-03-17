/**
 * Extended tests for ContactsContext covering update, delete, toggleFavorite,
 * group management, and error handling
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import { ContactsProvider, useContacts } from '../ContactsContext'
import { RepositoryProvider } from '../RepositoryContext'
import { createMockRepositories } from '@/test/mock-repositories'

const now = new Date()

const mockContacts = [
  { id: 'c-1', name: 'Alice Smith', email: 'alice@example.com', company: 'Acme', isFavorite: false, groups: ['g-1'], labels: [], createdAt: now, updatedAt: now },
  { id: 'c-2', name: 'Bob Jones', email: 'bob@example.com', company: 'Widgets', isFavorite: true, groups: [], labels: [], createdAt: now, updatedAt: now },
]

const mockGroups = [
  { id: 'g-1', name: 'Work', color: '#ff0000', contactIds: ['c-1'], createdAt: now, updatedAt: now },
]

function createWrapper() {
  const repos = createMockRepositories()
  repos.contacts.getAll = vi.fn().mockResolvedValue({ data: mockContacts, total: 2, page: 1, pageSize: 50, totalPages: 1 })
  repos.contactGroups.getAll = vi.fn().mockResolvedValue(mockGroups)
  repos.contacts.toggleFavorite = vi.fn().mockResolvedValue({
    success: true as const,
    data: { ...mockContacts[0], isFavorite: true },
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <RepositoryProvider repositories={repos}>
      <ContactsProvider>{children}</ContactsProvider>
    </RepositoryProvider>
  )

  return { repos, wrapper }
}

describe('ContactsContext - updateContact', () => {
  it('updateContact calls repository and updates state', async () => {
    const { wrapper, repos } = createWrapper()
    repos.contacts.update = vi.fn().mockResolvedValue({
      success: true as const,
      data: { ...mockContacts[0], name: 'Alice Updated' },
    })
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateContact('c-1', { name: 'Alice Updated' })
    })

    expect(repos.contacts.update).toHaveBeenCalledWith('c-1', { name: 'Alice Updated' })
  })
})

describe('ContactsContext - deleteContact', () => {
  it('deleteContact removes contact from state', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.contacts.length).toBe(2))

    await act(async () => {
      await result.current.deleteContact('c-1')
    })

    expect(result.current.contacts.length).toBe(1)
    expect(repos.contacts.delete).toHaveBeenCalledWith('c-1')
  })
})

describe('ContactsContext - toggleFavorite', () => {
  it('toggleFavorite updates isFavorite in state', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.contacts.length).toBe(2))

    await act(async () => {
      await result.current.toggleFavorite('c-1')
    })

    expect(repos.contacts.toggleFavorite).toHaveBeenCalledWith('c-1')
  })

  it('favoriteContacts only contains contacts with isFavorite=true', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Bob Jones has isFavorite=true in mockContacts
    expect(result.current.favoriteContacts.every(c => c.isFavorite)).toBe(true)
    expect(result.current.favoriteContacts).toHaveLength(1)
    expect(result.current.favoriteContacts[0].name).toBe('Bob Jones')
  })
})

describe('ContactsContext - Group management', () => {
  it('addGroup creates a new group', async () => {
    const { wrapper, repos } = createWrapper()
    repos.contactGroups.create = vi.fn().mockResolvedValue({
      success: true as const,
      data: { id: 'g-new', name: 'Friends', color: '#22c55e', contactIds: [], createdAt: now, updatedAt: now },
    })
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addGroup('Friends', '#22c55e')
    })

    expect(repos.contactGroups.create).toHaveBeenCalledWith('Friends', '#22c55e')
    expect(result.current.groups).toHaveLength(2)
  })

  it('updateGroup updates existing group', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.groups.length).toBe(1))

    await act(async () => {
      await result.current.updateGroup('g-1', { name: 'Work Updated' })
    })

    expect(repos.contactGroups.update).toHaveBeenCalledWith('g-1', { name: 'Work Updated' })
  })

  it('deleteGroup removes group from state', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.groups.length).toBe(1))

    await act(async () => {
      await result.current.deleteGroup('g-1')
    })

    expect(result.current.groups).toHaveLength(0)
    expect(repos.contactGroups.delete).toHaveBeenCalledWith('g-1')
  })

  it('getGroupById returns the correct group', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.groups.length).toBe(1))

    const group = result.current.getGroupById('g-1')
    expect(group?.name).toBe('Work')
  })

  it('getGroupById returns undefined for unknown id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const group = result.current.getGroupById('unknown')
    expect(group).toBeUndefined()
  })

  it('addContactToGroup dispatches correctly', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addContactToGroup('c-2', 'g-1')
    })

    expect(repos.contacts.addToGroup).toHaveBeenCalledWith('c-2', 'g-1')
  })

  it('removeContactFromGroup dispatches correctly', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.removeContactFromGroup('c-1', 'g-1')
    })

    expect(repos.contacts.removeFromGroup).toHaveBeenCalledWith('c-1', 'g-1')
  })
})

describe('ContactsContext - Filtering', () => {
  it('search and group filters combine correctly', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setSearch('alice')
      result.current.setSelectedGroup('g-1')
    })

    // Should show only Alice who is in g-1 and matches 'alice' search
    expect(result.current.filteredContacts.length).toBe(1)
    expect(result.current.filteredContacts[0].name).toBe('Alice Smith')
  })

  it('setSelectedGroup with null shows all contacts', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setSelectedGroup('g-1')
    })

    act(() => {
      result.current.setSelectedGroup(null)
    })

    expect(result.current.filteredContacts.length).toBe(2)
  })
})

describe('ContactsContext - Error handling', () => {
  it('sets error state when loading fails', async () => {
    const repos = createMockRepositories()
    repos.contacts.getAll = vi.fn().mockRejectedValue(new Error('Network error'))
    repos.contactGroups.getAll = vi.fn().mockRejectedValue(new Error('Network error'))

    const wrapper = ({ children }: { children: ReactNode }) => (
      <RepositoryProvider repositories={repos}>
        <ContactsProvider>{children}</ContactsProvider>
      </RepositoryProvider>
    )

    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeDefined()
  })
})
