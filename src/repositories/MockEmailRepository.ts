/**
 * Mock Email Repository
 * Implements IEmailRepository with localStorage persistence
 */

import type {
  Email,
  EmailCreateInput,
  EmailUpdateInput,
  EmailSearchQuery,
  FolderType,
  EmailAddress,
} from '@/types'
import type {
  IEmailRepository,
  RepositoryResponse,
  PaginationOptions,
  PaginatedResponse,
} from './types'
import { storage, STORAGE_KEYS, generateId } from '@/services/storage'
import { simulateNetworkDelay } from '@/utils'

export class MockEmailRepository implements IEmailRepository {
  private async getEmails(): Promise<Email[]> {
    const emails = await storage.get<Email[]>(STORAGE_KEYS.EMAILS)
    return emails ?? []
  }

  private async saveEmails(emails: Email[]): Promise<void> {
    await storage.set(STORAGE_KEYS.EMAILS, emails)
  }

  private paginate<T>(items: T[], pagination?: PaginationOptions): PaginatedResponse<T> {
    if (!pagination) {
      return {
        data: items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
      }
    }

    const { page, pageSize } = pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = items.slice(start, end)
    const totalPages = Math.ceil(items.length / pageSize)

    return {
      data,
      total: items.length,
      page,
      pageSize,
      totalPages,
    }
  }

  async getById(id: string): Promise<Email | null> {
    const emails = await this.getEmails()
    return emails.find((e) => e.id === id) ?? null
  }

  async getByFolder(
    folder: FolderType,
    accountId?: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResponse<Email>> {
    const emails = await this.getEmails()

    let filtered = emails.filter((e) => {
      if (folder === 'starred') {
        return e.isStarred && e.folder !== 'trash' && e.folder !== 'spam'
      }
      return e.folder === folder
    })

    if (accountId) {
      filtered = filtered.filter((e) => e.accountId === accountId)
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return this.paginate(filtered, pagination)
  }

  async getByThread(threadId: string): Promise<Email[]> {
    const emails = await this.getEmails()
    return emails
      .filter((e) => e.threadId === threadId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  async search(
    query: EmailSearchQuery,
    pagination?: PaginationOptions
  ): Promise<PaginatedResponse<Email>> {
    await simulateNetworkDelay()
    const emails = await this.getEmails()

    const filtered = emails.filter((email) => {
      // Text search (subject, body, from name/email)
      if (query.text) {
        const text = query.text.toLowerCase()
        const matchesText =
          email.subject.toLowerCase().includes(text) ||
          email.body.toLowerCase().includes(text) ||
          email.from.name.toLowerCase().includes(text) ||
          email.from.email.toLowerCase().includes(text) ||
          email.preview.toLowerCase().includes(text)
        if (!matchesText) return false
      }

      // From filter
      if (query.from) {
        const from = query.from.toLowerCase()
        const matchesFrom =
          email.from.name.toLowerCase().includes(from) ||
          email.from.email.toLowerCase().includes(from)
        if (!matchesFrom) return false
      }

      // To filter
      if (query.to) {
        const to = query.to.toLowerCase()
        const matchesTo = email.to.some(
          (recipient) =>
            recipient.name.toLowerCase().includes(to) ||
            recipient.email.toLowerCase().includes(to)
        )
        if (!matchesTo) return false
      }

      // Subject filter
      if (query.subject) {
        if (!email.subject.toLowerCase().includes(query.subject.toLowerCase())) {
          return false
        }
      }

      // Boolean filters
      if (query.hasAttachment !== undefined && email.hasAttachment !== query.hasAttachment) {
        return false
      }
      if (query.isStarred !== undefined && email.isStarred !== query.isStarred) {
        return false
      }
      if (query.isRead !== undefined && email.isRead !== query.isRead) {
        return false
      }

      // Folder filter
      if (query.folder && email.folder !== query.folder) {
        return false
      }

      // Labels filter
      if (query.labels && query.labels.length > 0) {
        const hasAllLabels = query.labels.every((label) => email.labels.includes(label))
        if (!hasAllLabels) return false
      }

      // Date filters
      if (query.dateFrom && new Date(email.date) < new Date(query.dateFrom)) {
        return false
      }
      if (query.dateTo && new Date(email.date) > new Date(query.dateTo)) {
        return false
      }

      // Account filter
      if (query.accountId && email.accountId !== query.accountId) {
        return false
      }

      return true
    })

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return this.paginate(filtered, pagination)
  }

  async getUnreadCount(folder: FolderType, accountId?: string): Promise<number> {
    const emails = await this.getEmails()
    return emails.filter((e) => {
      const folderMatch = folder === 'starred' ? e.isStarred : e.folder === folder
      const accountMatch = !accountId || e.accountId === accountId
      return folderMatch && accountMatch && !e.isRead
    }).length
  }

  async getFolderCount(folder: FolderType, accountId?: string): Promise<number> {
    const emails = await this.getEmails()
    return emails.filter((e) => {
      const folderMatch = folder === 'starred' ? e.isStarred : e.folder === folder
      const accountMatch = !accountId || e.accountId === accountId
      return folderMatch && accountMatch
    }).length
  }

  async getStarred(accountId?: string, pagination?: PaginationOptions): Promise<PaginatedResponse<Email>> {
    return this.getByFolder('starred', accountId, pagination)
  }

  async create(input: EmailCreateInput): Promise<RepositoryResponse<Email>> {
    await simulateNetworkDelay()
    try {
      const emails = await this.getEmails()
      const accounts = await storage.get<{ id: string; color: string }[]>(STORAGE_KEYS.ACCOUNTS) ?? []
      const account = accounts.find((a) => a.id === input.accountId)

      const threadId = input.replyToId
        ? (await this.getById(input.replyToId))?.threadId ?? generateId()
        : generateId()

      const newEmail: Email = {
        id: generateId(),
        accountId: input.accountId,
        accountColor: (account?.color as Email['accountColor']) ?? 'blue',
        from: {
          name: 'You',
          email: account ? (accounts.find((a) => a.id === input.accountId) as { email?: string })?.email ?? '' : '',
        } as EmailAddress,
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject,
        preview: input.body.replace(/<[^>]*>/g, '').substring(0, 100),
        body: input.body,
        date: input.scheduledSendAt ?? new Date(),
        isRead: true,
        isStarred: false,
        hasAttachment: (input.attachments?.length ?? 0) > 0,
        attachments: input.attachments ?? [],
        folder: 'sent',
        labels: [],
        threadId,
        replyToId: input.replyToId,
        forwardedFromId: input.forwardedFromId,
        isDraft: false,
        scheduledSendAt: input.scheduledSendAt,
      }

      emails.push(newEmail)
      await this.saveEmails(emails)

      return { data: newEmail, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create email',
      }
    }
  }

  async update(id: string, input: EmailUpdateInput): Promise<RepositoryResponse<Email>> {
    await simulateNetworkDelay()
    try {
      const emails = await this.getEmails()
      const index = emails.findIndex((e) => e.id === id)

      if (index === -1) {
        return { success: false, error: 'Email not found' }
      }

      const updated = { ...emails[index], ...input }
      emails[index] = updated
      await this.saveEmails(emails)

      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update email',
      }
    }
  }

  async updateMany(ids: string[], input: EmailUpdateInput): Promise<RepositoryResponse<Email[]>> {
    try {
      const emails = await this.getEmails()
      const updated: Email[] = []

      for (const id of ids) {
        const index = emails.findIndex((e) => e.id === id)
        if (index !== -1) {
          emails[index] = { ...emails[index], ...input }
          updated.push(emails[index])
        }
      }

      await this.saveEmails(emails)
      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update emails',
      }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    return this.moveToFolder([id], 'trash')
  }

  async deleteMany(ids: string[]): Promise<RepositoryResponse<void>> {
    return this.moveToFolder(ids, 'trash')
  }

  async deletePermanently(id: string): Promise<RepositoryResponse<void>> {
    return this.deletePermanentlyMany([id])
  }

  async deletePermanentlyMany(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      const emails = await this.getEmails()
      const filtered = emails.filter((e) => !ids.includes(e.id))
      await this.saveEmails(filtered)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete emails',
      }
    }
  }

  async moveToFolder(ids: string[], folder: FolderType): Promise<RepositoryResponse<void>> {
    try {
      const emails = await this.getEmails()

      for (const id of ids) {
        const index = emails.findIndex((e) => e.id === id)
        if (index !== -1) {
          emails[index] = { ...emails[index], folder }
        }
      }

      await this.saveEmails(emails)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to move emails',
      }
    }
  }

  async archive(ids: string[]): Promise<RepositoryResponse<void>> {
    return this.moveToFolder(ids, 'archive')
  }

  async markAsSpam(ids: string[]): Promise<RepositoryResponse<void>> {
    return this.moveToFolder(ids, 'spam')
  }

  async saveDraft(email: Partial<Email>): Promise<RepositoryResponse<Email>> {
    try {
      const emails = await this.getEmails()

      if (email.id) {
        // Update existing draft
        const index = emails.findIndex((e) => e.id === email.id)
        if (index !== -1) {
          emails[index] = { ...emails[index], ...email, isDraft: true, folder: 'drafts' }
          await this.saveEmails(emails)
          return { data: emails[index], success: true }
        }
      }

      // Create new draft
      const accounts = await storage.get<{ id: string; email: string; color: string }[]>(STORAGE_KEYS.ACCOUNTS) ?? []
      const account = accounts.find((a) => a.id === email.accountId) ?? accounts[0]

      const draft: Email = {
        id: generateId(),
        accountId: email.accountId ?? account?.id ?? '',
        accountColor: (account?.color as Email['accountColor']) ?? 'blue',
        from: { name: 'You', email: account?.email ?? '' },
        to: email.to ?? [],
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject ?? '',
        preview: (email.body ?? '').replace(/<[^>]*>/g, '').substring(0, 100),
        body: email.body ?? '',
        date: new Date(),
        isRead: true,
        isStarred: false,
        hasAttachment: (email.attachments?.length ?? 0) > 0,
        attachments: email.attachments ?? [],
        folder: 'drafts',
        labels: [],
        threadId: email.threadId ?? generateId(),
        replyToId: email.replyToId,
        forwardedFromId: email.forwardedFromId,
        isDraft: true,
      }

      emails.push(draft)
      await this.saveEmails(emails)

      return { data: draft, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save draft',
      }
    }
  }

  async markAsRead(ids: string[]): Promise<RepositoryResponse<void>> {
    const result = await this.updateMany(ids, { isRead: true })
    if (!result.success) {
      return { success: false, error: result.error }
    }
    return { data: undefined, success: true }
  }

  async markAsUnread(ids: string[]): Promise<RepositoryResponse<void>> {
    const result = await this.updateMany(ids, { isRead: false })
    if (!result.success) {
      return { success: false, error: result.error }
    }
    return { data: undefined, success: true }
  }

  async toggleStar(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      const emails = await this.getEmails()

      for (const id of ids) {
        const index = emails.findIndex((e) => e.id === id)
        if (index !== -1) {
          emails[index] = { ...emails[index], isStarred: !emails[index].isStarred }
        }
      }

      await this.saveEmails(emails)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle star',
      }
    }
  }

  async addLabels(ids: string[], labelIds: string[]): Promise<RepositoryResponse<void>> {
    try {
      const emails = await this.getEmails()

      for (const id of ids) {
        const index = emails.findIndex((e) => e.id === id)
        if (index !== -1) {
          const existingLabels = emails[index].labels
          const newLabels = [...new Set([...existingLabels, ...labelIds])]
          emails[index] = { ...emails[index], labels: newLabels }
        }
      }

      await this.saveEmails(emails)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add labels',
      }
    }
  }

  async removeLabels(ids: string[], labelIds: string[]): Promise<RepositoryResponse<void>> {
    try {
      const emails = await this.getEmails()

      for (const id of ids) {
        const index = emails.findIndex((e) => e.id === id)
        if (index !== -1) {
          const newLabels = emails[index].labels.filter((l) => !labelIds.includes(l))
          emails[index] = { ...emails[index], labels: newLabels }
        }
      }

      await this.saveEmails(emails)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove labels',
      }
    }
  }
}
