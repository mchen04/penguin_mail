/**
 * Mock repository factory for tests.
 * Returns stubs for every repository interface so RepositoryProvider
 * can be rendered without hitting the network.
 */
import type { IRepositories } from '@/repositories/types'
import { vi } from 'vitest'

const emptyPaginated = { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }
const ok = <T>(data: T) => Promise.resolve({ success: true as const, data })
const okVoid = () => ok<void>(undefined)

export function createMockRepositories(): IRepositories {
  return {
    emails: {
      getById: vi.fn().mockResolvedValue(null),
      getByFolder: vi.fn().mockResolvedValue(emptyPaginated),
      getByThread: vi.fn().mockResolvedValue([]),
      search: vi.fn().mockResolvedValue(emptyPaginated),
      getUnreadCount: vi.fn().mockResolvedValue(0),
      getFolderCount: vi.fn().mockResolvedValue(0),
      getStarred: vi.fn().mockResolvedValue(emptyPaginated),
      create: vi.fn().mockImplementation(() => ok({ id: 'mock-email', folder: 'sent', labels: [] })),
      update: vi.fn().mockImplementation(() => ok({ id: 'mock-email' })),
      updateMany: vi.fn().mockImplementation(() => ok([])),
      delete: vi.fn().mockImplementation(okVoid),
      deleteMany: vi.fn().mockImplementation(okVoid),
      deletePermanently: vi.fn().mockImplementation(okVoid),
      deletePermanentlyMany: vi.fn().mockImplementation(okVoid),
      moveToFolder: vi.fn().mockImplementation(okVoid),
      archive: vi.fn().mockImplementation(okVoid),
      markAsSpam: vi.fn().mockImplementation(okVoid),
      saveDraft: vi.fn().mockImplementation(() => ok({ id: 'mock-draft', folder: 'drafts', labels: [] })),
      markAsRead: vi.fn().mockImplementation(okVoid),
      markAsUnread: vi.fn().mockImplementation(okVoid),
      toggleStar: vi.fn().mockImplementation(okVoid),
      addLabels: vi.fn().mockImplementation(okVoid),
      removeLabels: vi.fn().mockImplementation(okVoid),
    },
    folders: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(() => ok({ id: 'mock-folder' })),
      update: vi.fn().mockImplementation(() => ok({ id: 'mock-folder' })),
      delete: vi.fn().mockImplementation(okVoid),
      reorder: vi.fn().mockImplementation(okVoid),
    },
    labels: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(() => ok({ id: 'mock-label' })),
      update: vi.fn().mockImplementation(() => ok({ id: 'mock-label' })),
      delete: vi.fn().mockImplementation(okVoid),
    },
    accounts: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      getDefault: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(() => ok({ id: 'mock-account' })),
      update: vi.fn().mockImplementation(() => ok({ id: 'mock-account' })),
      delete: vi.fn().mockImplementation(okVoid),
      setDefault: vi.fn().mockImplementation(okVoid),
    },
    contacts: {
      getAll: vi.fn().mockResolvedValue(emptyPaginated),
      getById: vi.fn().mockResolvedValue(null),
      getByEmail: vi.fn().mockResolvedValue(null),
      search: vi.fn().mockResolvedValue(emptyPaginated),
      getFavorites: vi.fn().mockResolvedValue([]),
      getByGroup: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(() => ok({ id: 'mock-contact' })),
      update: vi.fn().mockImplementation(() => ok({ id: 'mock-contact' })),
      delete: vi.fn().mockImplementation(okVoid),
      toggleFavorite: vi.fn().mockImplementation(() => ok({ id: 'mock-contact' })),
      addToGroup: vi.fn().mockImplementation(okVoid),
      removeFromGroup: vi.fn().mockImplementation(okVoid),
    },
    contactGroups: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(() => ok({ id: 'mock-group' })),
      update: vi.fn().mockImplementation(() => ok({ id: 'mock-group' })),
      delete: vi.fn().mockImplementation(okVoid),
    },
    settings: {
      get: vi.fn().mockResolvedValue({
        appearance: { theme: 'system', density: 'default', fontSize: 14 },
        notifications: { enabled: true, sound: true, desktop: false },
        inboxBehavior: { conversationView: true, autoAdvance: 'next', undoSendDelay: 5 },
        language: { language: 'en', timeZone: 'America/Los_Angeles', dateFormat: 'MM/DD/YYYY', timeFormat: '12h' },
        signatures: [],
        filters: [],
        blockedAddresses: [],
      }),
      update: vi.fn().mockImplementation(() => ok({})),
      reset: vi.fn().mockImplementation(() => ok({})),
      updateAppearance: vi.fn().mockImplementation(() => ok({})),
      updateNotifications: vi.fn().mockImplementation(() => ok({})),
      updateInboxBehavior: vi.fn().mockImplementation(() => ok({})),
      updateLanguage: vi.fn().mockImplementation(() => ok({})),
      addSignature: vi.fn().mockImplementation(() => ok({})),
      updateSignature: vi.fn().mockImplementation(() => ok({})),
      deleteSignature: vi.fn().mockImplementation(() => ok({})),
      addFilter: vi.fn().mockImplementation(() => ok({})),
      updateFilter: vi.fn().mockImplementation(() => ok({})),
      deleteFilter: vi.fn().mockImplementation(() => ok({})),
      blockAddress: vi.fn().mockImplementation(() => ok({})),
      unblockAddress: vi.fn().mockImplementation(() => ok({})),
    },
  }
}
