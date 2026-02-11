import type { CustomFolder, Label } from '@/types'
import type { IFolderRepository, ILabelRepository, RepositoryResponse } from './types'
import { apiClient } from '@/services/apiClient'

interface FolderAPI {
  id: string
  name: string
  color: string
  parentId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

interface LabelAPI {
  id: string
  name: string
  color: string
}

function toFolder(f: FolderAPI): CustomFolder {
  return {
    id: f.id,
    name: f.name,
    color: f.color,
    parentId: f.parentId,
    order: f.order,
    createdAt: new Date(f.createdAt),
    updatedAt: new Date(f.updatedAt),
  }
}

function toLabel(l: LabelAPI): Label {
  return {
    id: l.id,
    name: l.name,
    color: l.color,
  }
}

export class ApiFolderRepository implements IFolderRepository {
  async getAll(): Promise<CustomFolder[]> {
    const data = await apiClient.get<FolderAPI[]>('/folders/')
    return data.map(toFolder)
  }

  async getById(id: string): Promise<CustomFolder | null> {
    try {
      const data = await apiClient.get<FolderAPI>(`/folders/${id}`)
      return toFolder(data)
    } catch {
      return null
    }
  }

  async create(name: string, color: string, parentId?: string): Promise<RepositoryResponse<CustomFolder>> {
    try {
      const data = await apiClient.post<FolderAPI>('/folders/', {
        name,
        color,
        parentId: parentId ?? null,
      })
      return { success: true, data: toFolder(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async update(id: string, data: Partial<CustomFolder>): Promise<RepositoryResponse<CustomFolder>> {
    try {
      const body: Record<string, unknown> = {}
      if (data.name !== undefined) body.name = data.name
      if (data.color !== undefined) body.color = data.color

      const result = await apiClient.patch<FolderAPI>(`/folders/${id}`, body)
      return { success: true, data: toFolder(result) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.delete(`/folders/${id}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async reorder(folderId: string, newOrder: number): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post(`/folders/${folderId}/reorder`, undefined)
      // Pass newOrder as query param since the backend expects it
      await apiClient.get(`/folders/`) // refresh
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}

export class ApiLabelRepository implements ILabelRepository {
  async getAll(): Promise<Label[]> {
    const data = await apiClient.get<LabelAPI[]>('/labels/')
    return data.map(toLabel)
  }

  async getById(id: string): Promise<Label | null> {
    try {
      const data = await apiClient.get<LabelAPI>(`/labels/${id}`)
      return toLabel(data)
    } catch {
      return null
    }
  }

  async create(name: string, color: string): Promise<RepositoryResponse<Label>> {
    try {
      const data = await apiClient.post<LabelAPI>('/labels/', { name, color })
      return { success: true, data: toLabel(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async update(id: string, data: Partial<Label>): Promise<RepositoryResponse<Label>> {
    try {
      const body: Record<string, unknown> = {}
      if (data.name !== undefined) body.name = data.name
      if (data.color !== undefined) body.color = data.color

      const result = await apiClient.patch<LabelAPI>(`/labels/${id}`, body)
      return { success: true, data: toLabel(result) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.delete(`/labels/${id}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}
