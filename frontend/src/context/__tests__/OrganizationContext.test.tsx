/**
 * Tests for OrganizationContext covering labels and folders CRUD
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useOrganization, useLabels, useFolders } from '../OrganizationContext'
import { createWrapper } from '@/test/test-utils'
import { createMockRepositories } from '@/test/mock-repositories'

function makeWrapper() {
  return createWrapper(createMockRepositories())
}

describe('OrganizationContext - Labels', () => {
  it('starts with empty labels', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.labels).toEqual([])
  })

  it('addLabel creates a new label', async () => {
    const repos = createMockRepositories()
    repos.labels.create = vi.fn().mockResolvedValue({
      success: true as const,
      data: { id: 'l1', name: 'Work', color: '#3b82f6', contactIds: [], createdAt: new Date(), updatedAt: new Date() },
    })
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addLabel('Work', '#3b82f6')
    })

    expect(repos.labels.create).toHaveBeenCalledWith('Work', '#3b82f6')
    expect(result.current.labels).toHaveLength(1)
    expect(result.current.labels[0].name).toBe('Work')
  })

  it('updateLabel updates an existing label', async () => {
    const repos = createMockRepositories()
    repos.labels.getAll = vi.fn().mockResolvedValue([
      { id: 'l1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => expect(result.current.labels).toHaveLength(1))

    await act(async () => {
      await result.current.updateLabel('l1', { name: 'Updated' })
    })

    expect(repos.labels.update).toHaveBeenCalledWith('l1', { name: 'Updated' })
  })

  it('deleteLabel removes a label', async () => {
    const repos = createMockRepositories()
    repos.labels.getAll = vi.fn().mockResolvedValue([
      { id: 'l1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => expect(result.current.labels).toHaveLength(1))

    await act(async () => {
      await result.current.deleteLabel('l1')
    })

    expect(result.current.labels).toHaveLength(0)
    expect(repos.labels.delete).toHaveBeenCalledWith('l1')
  })

  it('getLabelById returns correct label', async () => {
    const repos = createMockRepositories()
    repos.labels.getAll = vi.fn().mockResolvedValue([
      { id: 'l1', name: 'Work', color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => expect(result.current.labels).toHaveLength(1))

    const label = result.current.getLabelById('l1')
    expect(label?.name).toBe('Work')
  })

  it('getLabelById returns undefined for unknown id', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const label = result.current.getLabelById('nonexistent')
    expect(label).toBeUndefined()
  })

  it('selectLabel sets selectedLabelId', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useOrganization(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.selectLabel('l1')
    })

    expect(result.current.selectedLabelId).toBe('l1')
  })

  it('selectLabel with null clears selectedLabelId', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useOrganization(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.selectLabel('l1')
    })

    act(() => {
      result.current.selectLabel(null)
    })

    expect(result.current.selectedLabelId).toBeNull()
  })
})

describe('OrganizationContext - Folders', () => {
  it('starts with empty folders', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.folders).toEqual([])
  })

  it('addFolder creates a new folder', async () => {
    const repos = createMockRepositories()
    repos.folders.create = vi.fn().mockResolvedValue({
      success: true as const,
      data: { id: 'f1', name: 'Work', color: '#3b82f6', parentId: null, order: 0, createdAt: new Date(), updatedAt: new Date() },
    })
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addFolder('Work', '#3b82f6')
    })

    expect(repos.folders.create).toHaveBeenCalledWith('Work', '#3b82f6', undefined)
    expect(result.current.folders).toHaveLength(1)
    expect(result.current.folders[0].name).toBe('Work')
  })

  it('addFolder with parentId creates a child folder', async () => {
    const repos = createMockRepositories()
    repos.folders.create = vi.fn().mockResolvedValue({
      success: true as const,
      data: { id: 'f2', name: 'Sub', color: '#3b82f6', parentId: 'f1', order: 0, createdAt: new Date(), updatedAt: new Date() },
    })
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addFolder('Sub', '#3b82f6', 'f1')
    })

    expect(repos.folders.create).toHaveBeenCalledWith('Sub', '#3b82f6', 'f1')
  })

  it('updateFolder updates an existing folder', async () => {
    const repos = createMockRepositories()
    repos.folders.getAll = vi.fn().mockResolvedValue([
      { id: 'f1', name: 'Work', color: '#3b82f6', parentId: null, order: 0, createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.folders).toHaveLength(1))

    await act(async () => {
      await result.current.updateFolder('f1', { name: 'Work Projects' })
    })

    expect(repos.folders.update).toHaveBeenCalledWith('f1', { name: 'Work Projects' })
  })

  it('deleteFolder removes a folder', async () => {
    const repos = createMockRepositories()
    repos.folders.getAll = vi.fn().mockResolvedValue([
      { id: 'f1', name: 'Work', color: '#3b82f6', parentId: null, order: 0, createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.folders).toHaveLength(1))

    await act(async () => {
      await result.current.deleteFolder('f1')
    })

    expect(result.current.folders).toHaveLength(0)
    expect(repos.folders.delete).toHaveBeenCalledWith('f1')
  })

  it('getRootFolders returns only top-level folders', async () => {
    const repos = createMockRepositories()
    repos.folders.getAll = vi.fn().mockResolvedValue([
      { id: 'f1', name: 'Root', color: '#3b82f6', parentId: null, order: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f2', name: 'Child', color: '#22c55e', parentId: 'f1', order: 0, createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.folders).toHaveLength(2))

    const rootFolders = result.current.getRootFolders()
    expect(rootFolders).toHaveLength(1)
    expect(rootFolders[0].name).toBe('Root')
  })

  it('getChildFolders returns folders with matching parentId', async () => {
    const repos = createMockRepositories()
    repos.folders.getAll = vi.fn().mockResolvedValue([
      { id: 'f1', name: 'Root', color: '#3b82f6', parentId: null, order: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f2', name: 'Child', color: '#22c55e', parentId: 'f1', order: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'f3', name: 'Child2', color: '#ef4444', parentId: 'f1', order: 1, createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.folders).toHaveLength(3))

    const children = result.current.getChildFolders('f1')
    expect(children).toHaveLength(2)
  })

  it('getFolderById returns correct folder', async () => {
    const repos = createMockRepositories()
    repos.folders.getAll = vi.fn().mockResolvedValue([
      { id: 'f1', name: 'Work', color: '#3b82f6', parentId: null, order: 0, createdAt: new Date(), updatedAt: new Date() },
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.folders).toHaveLength(1))

    const folder = result.current.getFolderById('f1')
    expect(folder?.name).toBe('Work')
  })

  it('getFolderById returns undefined for unknown id', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useFolders(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const folder = result.current.getFolderById('nonexistent')
    expect(folder).toBeUndefined()
  })
})

describe('OrganizationContext - Error handling', () => {
  it('sets error state when loading fails', async () => {
    const repos = createMockRepositories()
    repos.labels.getAll = vi.fn().mockRejectedValue(new Error('Network error'))
    repos.folders.getAll = vi.fn().mockRejectedValue(new Error('Network error'))
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useOrganization(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
  })
})

describe('OrganizationContext - useOrganization hook', () => {
  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useOrganization())
    }).toThrow('useOrganization must be used within an OrganizationProvider')
  })
})
