import type { Settings } from '@/types'
import type { ISettingsRepository, RepositoryResponse } from './types'
import { apiClient } from '@/services/apiClient'

interface SettingsAPI {
  appearance: {
    theme: string
    density: string
    fontSize: string
  }
  notifications: {
    emailNotifications: boolean
    desktopNotifications: boolean
    soundEnabled: boolean
    notifyOnNewEmail: boolean
    notifyOnMention: boolean
  }
  inboxBehavior: {
    defaultReplyBehavior: string
    sendBehavior: string
    conversationView: boolean
    readingPanePosition: string
    autoAdvance: string
    markAsReadDelay: number
  }
  language: {
    language: string
    timezone: string
    dateFormat: string
    timeFormat: string
  }
  signatures: Array<{
    id: string
    name: string
    content: string
    isDefault: boolean
  }>
  vacationResponder: {
    enabled: boolean
    subject: string
    message: string
    startDate: string | null
    endDate: string | null
    sendToContacts: boolean
    sendToEveryone: boolean
  }
  keyboardShortcuts: Array<{
    id: string
    action: string
    key: string
    modifiers: string[]
    enabled: boolean
  }>
  filters: Array<{
    id: string
    name: string
    enabled: boolean
    conditions: Array<{ field: string; operator: string; value: string }>
    matchAll: boolean
    actions: Array<{ type: string; value?: string }>
    createdAt: string
    updatedAt: string
  }>
  blockedAddresses: Array<{
    id: string
    email: string
    createdAt: string
  }>
}

function toSettings(s: SettingsAPI): Settings {
  return {
    appearance: s.appearance as Settings['appearance'],
    notifications: s.notifications as Settings['notifications'],
    inboxBehavior: s.inboxBehavior as Settings['inboxBehavior'],
    language: s.language as Settings['language'],
    signatures: s.signatures,
    vacationResponder: {
      ...s.vacationResponder,
      startDate: s.vacationResponder.startDate ? new Date(s.vacationResponder.startDate) : null,
      endDate: s.vacationResponder.endDate ? new Date(s.vacationResponder.endDate) : null,
    },
    keyboardShortcuts: s.keyboardShortcuts.map(k => ({
      ...k,
      modifiers: k.modifiers as Settings['keyboardShortcuts'][0]['modifiers'],
    })),
    filters: s.filters.map(f => ({
      ...f,
      conditions: f.conditions as Settings['filters'][0]['conditions'],
      actions: f.actions as Settings['filters'][0]['actions'],
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    })),
    blockedAddresses: s.blockedAddresses.map(b => ({
      ...b,
      createdAt: new Date(b.createdAt),
    })),
  }
}

export class ApiSettingsRepository implements ISettingsRepository {
  async get(): Promise<Settings> {
    const data = await apiClient.get<SettingsAPI>('/settings/')
    return toSettings(data)
  }

  async update(settings: Partial<Settings>): Promise<RepositoryResponse<Settings>> {
    try {
      const body: Record<string, unknown> = {}
      if (settings.appearance) body.appearance = settings.appearance
      if (settings.notifications) body.notifications = settings.notifications
      if (settings.inboxBehavior) body.inboxBehavior = settings.inboxBehavior
      if (settings.language) body.language = settings.language
      if (settings.vacationResponder) {
        body.vacationResponder = {
          ...settings.vacationResponder,
          startDate: settings.vacationResponder.startDate?.toISOString() ?? null,
          endDate: settings.vacationResponder.endDate?.toISOString() ?? null,
        }
      }

      const data = await apiClient.patch<SettingsAPI>('/settings/', body)
      return { success: true, data: toSettings(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async reset(): Promise<RepositoryResponse<Settings>> {
    try {
      const data = await apiClient.post<SettingsAPI>('/settings/reset')
      return { success: true, data: toSettings(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async updateAppearance(settings: Partial<Settings['appearance']>): Promise<RepositoryResponse<Settings>> {
    return this.update({ appearance: settings as Settings['appearance'] })
  }

  async updateNotifications(settings: Partial<Settings['notifications']>): Promise<RepositoryResponse<Settings>> {
    return this.update({ notifications: settings as Settings['notifications'] })
  }

  async updateInboxBehavior(settings: Partial<Settings['inboxBehavior']>): Promise<RepositoryResponse<Settings>> {
    return this.update({ inboxBehavior: settings as Settings['inboxBehavior'] })
  }

  async updateLanguage(settings: Partial<Settings['language']>): Promise<RepositoryResponse<Settings>> {
    return this.update({ language: settings as Settings['language'] })
  }

  async addSignature(name: string, content: string, isDefault?: boolean): Promise<RepositoryResponse<Settings>> {
    try {
      const data = await apiClient.post<SettingsAPI>('/settings/signatures', {
        name,
        content,
        isDefault: isDefault ?? false,
      })
      return { success: true, data: toSettings(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async updateSignature(
    id: string,
    data: { name?: string; content?: string; isDefault?: boolean },
  ): Promise<RepositoryResponse<Settings>> {
    try {
      const result = await apiClient.patch<SettingsAPI>(`/settings/signatures/${id}`, data)
      return { success: true, data: toSettings(result) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async deleteSignature(id: string): Promise<RepositoryResponse<Settings>> {
    try {
      await apiClient.delete(`/settings/signatures/${id}`)
      // Refetch settings since delete only returns success
      const settings = await this.get()
      return { success: true, data: settings }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async addFilter(
    filter: Omit<Settings['filters'][0], 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RepositoryResponse<Settings>> {
    try {
      const data = await apiClient.post<SettingsAPI>('/settings/filters', filter)
      return { success: true, data: toSettings(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async updateFilter(
    id: string,
    data: Partial<Settings['filters'][0]>,
  ): Promise<RepositoryResponse<Settings>> {
    try {
      const result = await apiClient.patch<SettingsAPI>(`/settings/filters/${id}`, data)
      return { success: true, data: toSettings(result) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async deleteFilter(id: string): Promise<RepositoryResponse<Settings>> {
    try {
      await apiClient.delete(`/settings/filters/${id}`)
      const settings = await this.get()
      return { success: true, data: settings }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async blockAddress(email: string): Promise<RepositoryResponse<Settings>> {
    try {
      const data = await apiClient.post<SettingsAPI>('/settings/blocked-addresses', { email })
      return { success: true, data: toSettings(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async unblockAddress(email: string): Promise<RepositoryResponse<Settings>> {
    try {
      await apiClient.delete(`/settings/blocked-addresses/${encodeURIComponent(email)}`)
      const settings = await this.get()
      return { success: true, data: settings }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}
