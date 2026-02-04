/**
 * Mock Contact Repository
 * Implements IContactRepository with localStorage persistence
 */

import type { Contact, ContactGroup, ContactCreateInput, ContactUpdateInput } from '@/types'
import type {
  IContactRepository,
  IContactGroupRepository,
  RepositoryResponse,
  PaginationOptions,
  PaginatedResponse,
} from './types'
import { storage, STORAGE_KEYS, generateId } from '@/services/storage'

export class MockContactRepository implements IContactRepository {
  private async getContacts(): Promise<Contact[]> {
    const contacts = await storage.get<Contact[]>(STORAGE_KEYS.CONTACTS)
    return contacts ?? []
  }

  private async saveContacts(contacts: Contact[]): Promise<void> {
    await storage.set(STORAGE_KEYS.CONTACTS, contacts)
  }

  private paginate(contacts: Contact[], pagination?: PaginationOptions): PaginatedResponse<Contact> {
    if (!pagination) {
      return {
        data: contacts,
        total: contacts.length,
        page: 1,
        pageSize: contacts.length,
        totalPages: 1,
      }
    }

    const { page, pageSize } = pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = contacts.slice(start, end)
    const totalPages = Math.ceil(contacts.length / pageSize)

    return {
      data,
      total: contacts.length,
      page,
      pageSize,
      totalPages,
    }
  }

  async getAll(pagination?: PaginationOptions): Promise<PaginatedResponse<Contact>> {
    const contacts = await this.getContacts()
    const sorted = contacts.sort((a, b) => a.name.localeCompare(b.name))
    return this.paginate(sorted, pagination)
  }

  async getById(id: string): Promise<Contact | null> {
    const contacts = await this.getContacts()
    return contacts.find((c) => c.id === id) ?? null
  }

  async getByEmail(email: string): Promise<Contact | null> {
    const contacts = await this.getContacts()
    return contacts.find((c) => c.email.toLowerCase() === email.toLowerCase()) ?? null
  }

  async search(query: string, pagination?: PaginationOptions): Promise<PaginatedResponse<Contact>> {
    const contacts = await this.getContacts()
    const lowerQuery = query.toLowerCase()

    const filtered = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery) ||
        c.company?.toLowerCase().includes(lowerQuery)
    )

    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name))
    return this.paginate(sorted, pagination)
  }

  async getFavorites(): Promise<Contact[]> {
    const contacts = await this.getContacts()
    return contacts.filter((c) => c.isFavorite).sort((a, b) => a.name.localeCompare(b.name))
  }

  async getByGroup(groupId: string): Promise<Contact[]> {
    const contacts = await this.getContacts()
    return contacts.filter((c) => c.groups.includes(groupId)).sort((a, b) => a.name.localeCompare(b.name))
  }

  async create(input: ContactCreateInput): Promise<RepositoryResponse<Contact>> {
    try {
      const contacts = await this.getContacts()
      const now = new Date()

      const newContact: Contact = {
        id: generateId(),
        email: input.email,
        name: input.name,
        avatar: input.avatar,
        phone: input.phone,
        company: input.company,
        notes: input.notes,
        isFavorite: false,
        groups: input.groups ?? [],
        createdAt: now,
        updatedAt: now,
      }

      contacts.push(newContact)
      await this.saveContacts(contacts)

      return { data: newContact, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact',
      }
    }
  }

  async update(id: string, input: ContactUpdateInput): Promise<RepositoryResponse<Contact>> {
    try {
      const contacts = await this.getContacts()
      const index = contacts.findIndex((c) => c.id === id)

      if (index === -1) {
        return { success: false, error: 'Contact not found' }
      }

      const updated: Contact = {
        ...contacts[index],
        ...input,
        updatedAt: new Date(),
      }
      contacts[index] = updated
      await this.saveContacts(contacts)

      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact',
      }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      const contacts = await this.getContacts()
      const filtered = contacts.filter((c) => c.id !== id)
      await this.saveContacts(filtered)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete contact',
      }
    }
  }

  async toggleFavorite(id: string): Promise<RepositoryResponse<Contact>> {
    try {
      const contacts = await this.getContacts()
      const index = contacts.findIndex((c) => c.id === id)

      if (index === -1) {
        return { success: false, error: 'Contact not found' }
      }

      const updated: Contact = {
        ...contacts[index],
        isFavorite: !contacts[index].isFavorite,
        updatedAt: new Date(),
      }
      contacts[index] = updated
      await this.saveContacts(contacts)

      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
      }
    }
  }

  async addToGroup(contactId: string, groupId: string): Promise<RepositoryResponse<void>> {
    try {
      const contacts = await this.getContacts()
      const index = contacts.findIndex((c) => c.id === contactId)

      if (index === -1) {
        return { data: undefined, success: false, error: 'Contact not found' }
      }

      if (!contacts[index].groups.includes(groupId)) {
        contacts[index] = {
          ...contacts[index],
          groups: [...contacts[index].groups, groupId],
          updatedAt: new Date(),
        }
        await this.saveContacts(contacts)
      }

      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add contact to group',
      }
    }
  }

  async removeFromGroup(contactId: string, groupId: string): Promise<RepositoryResponse<void>> {
    try {
      const contacts = await this.getContacts()
      const index = contacts.findIndex((c) => c.id === contactId)

      if (index === -1) {
        return { data: undefined, success: false, error: 'Contact not found' }
      }

      contacts[index] = {
        ...contacts[index],
        groups: contacts[index].groups.filter((g) => g !== groupId),
        updatedAt: new Date(),
      }
      await this.saveContacts(contacts)

      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove contact from group',
      }
    }
  }
}

export class MockContactGroupRepository implements IContactGroupRepository {
  private async getGroups(): Promise<ContactGroup[]> {
    const groups = await storage.get<ContactGroup[]>(STORAGE_KEYS.CONTACT_GROUPS)
    return groups ?? []
  }

  private async saveGroups(groups: ContactGroup[]): Promise<void> {
    await storage.set(STORAGE_KEYS.CONTACT_GROUPS, groups)
  }

  async getAll(): Promise<ContactGroup[]> {
    return this.getGroups()
  }

  async getById(id: string): Promise<ContactGroup | null> {
    const groups = await this.getGroups()
    return groups.find((g) => g.id === id) ?? null
  }

  async create(name: string, color: string): Promise<RepositoryResponse<ContactGroup>> {
    try {
      const groups = await this.getGroups()
      const now = new Date()

      const newGroup: ContactGroup = {
        id: generateId(),
        name,
        color,
        contactIds: [],
        createdAt: now,
        updatedAt: now,
      }

      groups.push(newGroup)
      await this.saveGroups(groups)

      return { data: newGroup, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact group',
      }
    }
  }

  async update(id: string, data: Partial<ContactGroup>): Promise<RepositoryResponse<ContactGroup>> {
    try {
      const groups = await this.getGroups()
      const index = groups.findIndex((g) => g.id === id)

      if (index === -1) {
        return { success: false, error: 'Group not found' }
      }

      const updated: ContactGroup = {
        ...groups[index],
        ...data,
        updatedAt: new Date(),
      }
      groups[index] = updated
      await this.saveGroups(groups)

      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact group',
      }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      const groups = await this.getGroups()
      const filtered = groups.filter((g) => g.id !== id)
      await this.saveGroups(filtered)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete contact group',
      }
    }
  }
}
