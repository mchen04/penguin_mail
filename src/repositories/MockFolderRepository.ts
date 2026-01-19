/**
 * Mock Folder and Label Repositories
 * Implements IFolderRepository and ILabelRepository with localStorage persistence
 */

import type { CustomFolder, Label } from '@/types'
import type { IFolderRepository, ILabelRepository, RepositoryResponse } from './types'
import { storage, STORAGE_KEYS, generateId } from '@/services/storage'

export class MockFolderRepository implements IFolderRepository {
  private async getFolders(): Promise<CustomFolder[]> {
    const folders = await storage.get<CustomFolder[]>(STORAGE_KEYS.CUSTOM_FOLDERS)
    return folders ?? []
  }

  private async saveFolders(folders: CustomFolder[]): Promise<void> {
    await storage.set(STORAGE_KEYS.CUSTOM_FOLDERS, folders)
  }

  // Note: accountId parameter reserved for future multi-account folder filtering
  async getAll(accountId?: string): Promise<CustomFolder[]> {
    void accountId // Unused but part of interface
    const folders = await this.getFolders()
    return folders.sort((a, b) => a.order - b.order)
  }

  async getById(id: string): Promise<CustomFolder | null> {
    const folders = await this.getFolders()
    return folders.find((f) => f.id === id) ?? null
  }

  async create(name: string, color: string, parentId?: string): Promise<RepositoryResponse<CustomFolder>> {
    try {
      const folders = await this.getFolders()
      const now = new Date()

      // Get the next order number
      const maxOrder = folders.reduce((max, f) => Math.max(max, f.order), -1)

      const newFolder: CustomFolder = {
        id: generateId(),
        name,
        color,
        parentId: parentId ?? null,
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      }

      folders.push(newFolder)
      await this.saveFolders(folders)

      return { data: newFolder, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create folder',
      }
    }
  }

  async update(id: string, data: Partial<CustomFolder>): Promise<RepositoryResponse<CustomFolder>> {
    try {
      const folders = await this.getFolders()
      const index = folders.findIndex((f) => f.id === id)

      if (index === -1) {
        return { success: false, error: 'Folder not found' }
      }

      const updated: CustomFolder = {
        ...folders[index],
        ...data,
        updatedAt: new Date(),
      }
      folders[index] = updated
      await this.saveFolders(folders)

      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update folder',
      }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      const folders = await this.getFolders()

      // Also delete child folders
      const idsToDelete = new Set<string>([id])
      let hasMore = true

      while (hasMore) {
        hasMore = false
        for (const folder of folders) {
          if (folder.parentId && idsToDelete.has(folder.parentId) && !idsToDelete.has(folder.id)) {
            idsToDelete.add(folder.id)
            hasMore = true
          }
        }
      }

      const filtered = folders.filter((f) => !idsToDelete.has(f.id))
      await this.saveFolders(filtered)

      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete folder',
      }
    }
  }

  async reorder(folderId: string, newOrder: number): Promise<RepositoryResponse<void>> {
    try {
      const folders = await this.getFolders()
      const folder = folders.find((f) => f.id === folderId)

      if (!folder) {
        return { data: undefined, success: false, error: 'Folder not found' }
      }

      const oldOrder = folder.order

      // Adjust orders of other folders
      const updated = folders.map((f) => {
        if (f.id === folderId) {
          return { ...f, order: newOrder, updatedAt: new Date() }
        }

        if (oldOrder < newOrder) {
          // Moving down: decrease order of items between old and new positions
          if (f.order > oldOrder && f.order <= newOrder) {
            return { ...f, order: f.order - 1 }
          }
        } else if (oldOrder > newOrder) {
          // Moving up: increase order of items between new and old positions
          if (f.order >= newOrder && f.order < oldOrder) {
            return { ...f, order: f.order + 1 }
          }
        }

        return f
      })

      await this.saveFolders(updated)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder folder',
      }
    }
  }
}

export class MockLabelRepository implements ILabelRepository {
  private async getLabels(): Promise<Label[]> {
    const labels = await storage.get<Label[]>(STORAGE_KEYS.LABELS)
    return labels ?? []
  }

  private async saveLabels(labels: Label[]): Promise<void> {
    await storage.set(STORAGE_KEYS.LABELS, labels)
  }

  async getAll(): Promise<Label[]> {
    return this.getLabels()
  }

  async getById(id: string): Promise<Label | null> {
    const labels = await this.getLabels()
    return labels.find((l) => l.id === id) ?? null
  }

  async create(name: string, color: string): Promise<RepositoryResponse<Label>> {
    try {
      const labels = await this.getLabels()

      const newLabel: Label = {
        id: generateId(),
        name,
        color,
      }

      labels.push(newLabel)
      await this.saveLabels(labels)

      return { data: newLabel, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create label',
      }
    }
  }

  async update(id: string, data: Partial<Label>): Promise<RepositoryResponse<Label>> {
    try {
      const labels = await this.getLabels()
      const index = labels.findIndex((l) => l.id === id)

      if (index === -1) {
        return { success: false, error: 'Label not found' }
      }

      const updated: Label = { ...labels[index], ...data }
      labels[index] = updated
      await this.saveLabels(labels)

      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update label',
      }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      const labels = await this.getLabels()
      const filtered = labels.filter((l) => l.id !== id)
      await this.saveLabels(filtered)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete label',
      }
    }
  }
}
