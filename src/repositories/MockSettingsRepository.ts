/**
 * Mock Settings Repository
 * Implements ISettingsRepository with localStorage persistence
 */

import type { Settings } from '@/types'
import { createDefaultSettings } from '@/types'
import type { ISettingsRepository, RepositoryResponse } from './types'
import { storage, STORAGE_KEYS, generateId } from '@/services/storage'

export class MockSettingsRepository implements ISettingsRepository {
  private async getSettings(): Promise<Settings> {
    const settings = await storage.get<Settings>(STORAGE_KEYS.SETTINGS)
    return settings ?? createDefaultSettings()
  }

  private async saveSettings(settings: Settings): Promise<void> {
    await storage.set(STORAGE_KEYS.SETTINGS, settings)
  }

  async get(): Promise<Settings> {
    return this.getSettings()
  }

  async update(newSettings: Partial<Settings>): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()
      const updated = { ...current, ...newSettings }
      await this.saveSettings(updated)
      return { data: updated, success: true }
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }
    }
  }

  async reset(): Promise<RepositoryResponse<Settings>> {
    try {
      const defaultSettings = createDefaultSettings()
      await this.saveSettings(defaultSettings)
      return { data: defaultSettings, success: true }
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset settings',
      }
    }
  }

  async updateAppearance(
    appearance: Partial<Settings['appearance']>
  ): Promise<RepositoryResponse<Settings>> {
    const current = await this.getSettings()
    return this.update({
      appearance: { ...current.appearance, ...appearance },
    })
  }

  async updateNotifications(
    notifications: Partial<Settings['notifications']>
  ): Promise<RepositoryResponse<Settings>> {
    const current = await this.getSettings()
    return this.update({
      notifications: { ...current.notifications, ...notifications },
    })
  }

  async updateInboxBehavior(
    inboxBehavior: Partial<Settings['inboxBehavior']>
  ): Promise<RepositoryResponse<Settings>> {
    const current = await this.getSettings()
    return this.update({
      inboxBehavior: { ...current.inboxBehavior, ...inboxBehavior },
    })
  }

  async updateLanguage(
    language: Partial<Settings['language']>
  ): Promise<RepositoryResponse<Settings>> {
    const current = await this.getSettings()
    return this.update({
      language: { ...current.language, ...language },
    })
  }

  async addSignature(
    name: string,
    content: string,
    isDefault = false
  ): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()

      const newSignature = {
        id: generateId(),
        name,
        content,
        isDefault,
      }

      // If this is the default, unset others
      let signatures = current.signatures
      if (isDefault) {
        signatures = signatures.map((s) => ({ ...s, isDefault: false }))
      }

      // If this is the first signature, make it default
      if (signatures.length === 0) {
        newSignature.isDefault = true
      }

      signatures.push(newSignature)

      return this.update({ signatures })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add signature',
      }
    }
  }

  async updateSignature(
    id: string,
    data: { name?: string; content?: string; isDefault?: boolean }
  ): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()

      let signatures = current.signatures.map((s) => {
        if (s.id === id) {
          return { ...s, ...data }
        }
        return s
      })

      // If setting as default, unset others
      if (data.isDefault) {
        signatures = signatures.map((s) => ({
          ...s,
          isDefault: s.id === id,
        }))
      }

      return this.update({ signatures })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update signature',
      }
    }
  }

  async deleteSignature(id: string): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()
      const signatures = current.signatures.filter((s) => s.id !== id)

      // If we deleted the default, make the first one default
      if (!signatures.some((s) => s.isDefault) && signatures.length > 0) {
        signatures[0] = { ...signatures[0], isDefault: true }
      }

      return this.update({ signatures })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete signature',
      }
    }
  }

  async addFilter(
    filter: Omit<Settings['filters'][0], 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()
      const now = new Date()

      const newFilter = {
        ...filter,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }

      const filters = [...current.filters, newFilter]
      return this.update({ filters })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add filter',
      }
    }
  }

  async updateFilter(
    id: string,
    data: Partial<Settings['filters'][0]>
  ): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()

      const filters = current.filters.map((f) => {
        if (f.id === id) {
          return { ...f, ...data, updatedAt: new Date() }
        }
        return f
      })

      return this.update({ filters })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update filter',
      }
    }
  }

  async deleteFilter(id: string): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()
      const filters = current.filters.filter((f) => f.id !== id)
      return this.update({ filters })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete filter',
      }
    }
  }

  async blockAddress(email: string): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()

      // Check if already blocked
      if (current.blockedAddresses.some((b) => b.email.toLowerCase() === email.toLowerCase())) {
        return { data: current, success: true }
      }

      const blockedAddresses = [
        ...current.blockedAddresses,
        {
          id: generateId(),
          email: email.toLowerCase(),
          createdAt: new Date(),
        },
      ]

      return this.update({ blockedAddresses })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to block address',
      }
    }
  }

  async unblockAddress(email: string): Promise<RepositoryResponse<Settings>> {
    try {
      const current = await this.getSettings()
      const blockedAddresses = current.blockedAddresses.filter(
        (b) => b.email.toLowerCase() !== email.toLowerCase()
      )
      return this.update({ blockedAddresses })
    } catch (error) {
      return {
        data: null as unknown as Settings,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unblock address',
      }
    }
  }
}
