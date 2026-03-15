import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FeaturesProvider, useFeatures } from '../FeaturesContext'

beforeEach(() => {
  localStorage.clear()
})

function wrapper({ children }: { children: ReactNode }) {
  return <FeaturesProvider>{children}</FeaturesProvider>
}

describe('FeaturesContext', () => {
  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useFeatures())
    }).toThrow('useFeatures must be used within a FeaturesProvider')
  })

  it('starts with empty arrays after loading', async () => {
    const { result } = renderHook(() => useFeatures(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.savedSearches).toEqual([])
    expect(result.current.templates).toEqual([])
  })

  describe('saved searches', () => {
    it('adds a saved search', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => {
        result.current.addSavedSearch('My Search', { text: 'hello world' })
      })

      expect(result.current.savedSearches).toHaveLength(1)
      expect(result.current.savedSearches[0].name).toBe('My Search')
    })

    it('deletes a saved search', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => {
        result.current.addSavedSearch('To be deleted', { text: 'delete me' })
      })
      expect(result.current.savedSearches).toHaveLength(1)

      act(() => {
        result.current.deleteSavedSearch(result.current.savedSearches[0].id)
      })
      expect(result.current.savedSearches).toHaveLength(0)
    })

    it('updates a saved search', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => {
        result.current.addSavedSearch('Original Name', { text: 'original' })
      })
      const id = result.current.savedSearches[0].id

      act(() => {
        result.current.updateSavedSearch(id, { name: 'Updated Name' })
      })
      expect(result.current.savedSearches[0].name).toBe('Updated Name')
    })

    it('persists saved searches across provider remounts', async () => {
      const { result: result1 } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result1.current.isLoading).toBe(false))

      act(() => {
        result1.current.addSavedSearch('Persisted Search', { text: 'persist me' })
      })

      // Wait for the persistence effect to write to localStorage
      await waitFor(() => {
        const stored = localStorage.getItem('penguin_mail_saved_searches')
        expect(stored).not.toBeNull()
      })

      // New provider instance should load the persisted data
      const { result: result2 } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result2.current.isLoading).toBe(false))

      expect(result2.current.savedSearches).toHaveLength(1)
      expect(result2.current.savedSearches[0].name).toBe('Persisted Search')
    })
  })

  describe('templates', () => {
    it('adds a template', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => {
        result.current.addTemplate('Welcome Email', 'Welcome!', '<p>Hello there!</p>')
      })

      expect(result.current.templates).toHaveLength(1)
      expect(result.current.templates[0].name).toBe('Welcome Email')
      expect(result.current.templates[0].subject).toBe('Welcome!')
      expect(result.current.templates[0].body).toBe('<p>Hello there!</p>')
    })

    it('deletes a template', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => {
        result.current.addTemplate('To be deleted', 'Subject', 'Body')
      })
      expect(result.current.templates).toHaveLength(1)

      act(() => {
        result.current.deleteTemplate(result.current.templates[0].id)
      })
      expect(result.current.templates).toHaveLength(0)
    })

    it('updates a template', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => {
        result.current.addTemplate('Old Name', 'Old Subject', 'Old Body')
      })
      const id = result.current.templates[0].id

      act(() => {
        result.current.updateTemplate(id, { name: 'New Name', subject: 'New Subject' })
      })
      expect(result.current.templates[0].name).toBe('New Name')
      expect(result.current.templates[0].subject).toBe('New Subject')
    })

    it('persists templates across provider remounts', async () => {
      const { result: result1 } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result1.current.isLoading).toBe(false))

      act(() => {
        result1.current.addTemplate('Persisted Template', 'Subject', 'Body')
      })

      await waitFor(() => {
        const stored = localStorage.getItem('penguin_mail_email_templates')
        expect(stored).not.toBeNull()
      })

      const { result: result2 } = renderHook(() => useFeatures(), { wrapper })
      await waitFor(() => expect(result2.current.isLoading).toBe(false))

      expect(result2.current.templates).toHaveLength(1)
      expect(result2.current.templates[0].name).toBe('Persisted Template')
    })
  })
})
