import type {
  Contact,
  ContactGroup,
  ContactCreateInput,
  ContactUpdateInput,
} from '@/types'
import type {
  IContactRepository,
  IContactGroupRepository,
  RepositoryResponse,
  PaginationOptions,
  PaginatedResponse,
} from './types'
import { apiClient } from '@/services/apiClient'

interface ContactAPI {
  id: string
  email: string
  name: string
  avatar: string
  phone: string
  company: string
  notes: string
  isFavorite: boolean
  groups: string[]
  createdAt: string
  updatedAt: string
}

interface ContactGroupAPI {
  id: string
  name: string
  color: string
  contactIds: string[]
  createdAt: string
  updatedAt: string
}

interface PaginatedContactAPI {
  data: ContactAPI[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function toContact(c: ContactAPI): Contact {
  return {
    id: c.id,
    email: c.email,
    name: c.name,
    avatar: c.avatar || undefined,
    phone: c.phone || undefined,
    company: c.company || undefined,
    notes: c.notes || undefined,
    isFavorite: c.isFavorite,
    groups: c.groups,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }
}

function toContactGroup(g: ContactGroupAPI): ContactGroup {
  return {
    id: g.id,
    name: g.name,
    color: g.color,
    contactIds: g.contactIds,
    createdAt: new Date(g.createdAt),
    updatedAt: new Date(g.updatedAt),
  }
}

export class ApiContactRepository implements IContactRepository {
  async getAll(pagination?: PaginationOptions): Promise<PaginatedResponse<Contact>> {
    const data = await apiClient.get<PaginatedContactAPI>('/contacts/', {
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    })
    return {
      data: data.data.map(toContact),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    }
  }

  async getById(id: string): Promise<Contact | null> {
    try {
      const data = await apiClient.get<ContactAPI>(`/contacts/${id}`)
      return toContact(data)
    } catch {
      return null
    }
  }

  async getByEmail(email: string): Promise<Contact | null> {
    try {
      const data = await apiClient.get<ContactAPI>(`/contacts/by-email/${encodeURIComponent(email)}`)
      return toContact(data)
    } catch {
      return null
    }
  }

  async search(query: string, pagination?: PaginationOptions): Promise<PaginatedResponse<Contact>> {
    const data = await apiClient.get<PaginatedContactAPI>('/contacts/search', {
      q: query,
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    })
    return {
      data: data.data.map(toContact),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    }
  }

  async getFavorites(): Promise<Contact[]> {
    const data = await apiClient.get<ContactAPI[]>('/contacts/favorites')
    return data.map(toContact)
  }

  async getByGroup(groupId: string): Promise<Contact[]> {
    const data = await apiClient.get<ContactAPI[]>(`/contacts/by-group/${groupId}`)
    return data.map(toContact)
  }

  async create(input: ContactCreateInput): Promise<RepositoryResponse<Contact>> {
    try {
      const data = await apiClient.post<ContactAPI>('/contacts/', {
        email: input.email,
        name: input.name,
        avatar: input.avatar ?? '',
        phone: input.phone ?? '',
        company: input.company ?? '',
        notes: input.notes ?? '',
        groups: input.groups ?? [],
      })
      return { success: true, data: toContact(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async update(id: string, input: ContactUpdateInput): Promise<RepositoryResponse<Contact>> {
    try {
      const body: Record<string, unknown> = {}
      if (input.email !== undefined) body.email = input.email
      if (input.name !== undefined) body.name = input.name
      if (input.avatar !== undefined) body.avatar = input.avatar
      if (input.phone !== undefined) body.phone = input.phone
      if (input.company !== undefined) body.company = input.company
      if (input.notes !== undefined) body.notes = input.notes
      if (input.isFavorite !== undefined) body.isFavorite = input.isFavorite
      if (input.groups !== undefined) body.groups = input.groups

      const data = await apiClient.patch<ContactAPI>(`/contacts/${id}`, body)
      return { success: true, data: toContact(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.delete(`/contacts/${id}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async toggleFavorite(id: string): Promise<RepositoryResponse<Contact>> {
    try {
      const data = await apiClient.post<ContactAPI>(`/contacts/${id}/toggle-favorite`)
      return { success: true, data: toContact(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async addToGroup(contactId: string, groupId: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post(`/contacts/${contactId}/add-to-group/${groupId}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async removeFromGroup(contactId: string, groupId: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post(`/contacts/${contactId}/remove-from-group/${groupId}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}

export class ApiContactGroupRepository implements IContactGroupRepository {
  async getAll(): Promise<ContactGroup[]> {
    const data = await apiClient.get<ContactGroupAPI[]>('/contact-groups/')
    return data.map(toContactGroup)
  }

  async getById(id: string): Promise<ContactGroup | null> {
    try {
      const data = await apiClient.get<ContactGroupAPI>(`/contact-groups/${id}`)
      return toContactGroup(data)
    } catch {
      return null
    }
  }

  async create(name: string, color: string): Promise<RepositoryResponse<ContactGroup>> {
    try {
      const data = await apiClient.post<ContactGroupAPI>('/contact-groups/', { name, color })
      return { success: true, data: toContactGroup(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async update(id: string, data: Partial<ContactGroup>): Promise<RepositoryResponse<ContactGroup>> {
    try {
      const body: Record<string, unknown> = {}
      if (data.name !== undefined) body.name = data.name
      if (data.color !== undefined) body.color = data.color

      const result = await apiClient.patch<ContactGroupAPI>(`/contact-groups/${id}`, body)
      return { success: true, data: toContactGroup(result) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.delete(`/contact-groups/${id}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}
