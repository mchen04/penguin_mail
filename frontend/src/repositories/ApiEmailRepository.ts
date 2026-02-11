import type {
  Email,
  EmailCreateInput,
  EmailUpdateInput,
  EmailSearchQuery,
  FolderType,
  AccountColor,
} from '@/types'
import type {
  IEmailRepository,
  RepositoryResponse,
  PaginationOptions,
  PaginatedResponse,
} from './types'
import { apiClient } from '@/services/apiClient'

interface EmailAddressAPI {
  name: string
  email: string
}

interface AttachmentAPI {
  id: string
  name: string
  size: number
  mimeType: string
  url?: string | null
}

interface EmailAPI {
  id: string
  accountId: string
  accountColor: string
  from_?: EmailAddressAPI
  from?: EmailAddressAPI
  to: EmailAddressAPI[]
  cc: EmailAddressAPI[]
  bcc: EmailAddressAPI[]
  subject: string
  preview: string
  body: string
  date: string
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  attachments: AttachmentAPI[]
  folder: string
  labels: string[]
  threadId: string | null
  replyToId: string | null
  forwardedFromId: string | null
  isDraft: boolean
  scheduledSendAt: string | null
  snoozeUntil: string | null
  snoozedFromFolder: string | null
}

interface PaginatedAPI {
  data: EmailAPI[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function toEmail(e: EmailAPI): Email {
  const from = e.from_ || e.from || { name: '', email: '' }
  return {
    id: e.id,
    accountId: e.accountId,
    accountColor: e.accountColor as AccountColor,
    from: { name: from.name, email: from.email },
    to: e.to,
    cc: e.cc?.length ? e.cc : undefined,
    bcc: e.bcc?.length ? e.bcc : undefined,
    subject: e.subject,
    preview: e.preview,
    body: e.body,
    date: new Date(e.date),
    isRead: e.isRead,
    isStarred: e.isStarred,
    hasAttachment: e.hasAttachment,
    attachments: e.attachments.map(a => ({
      id: a.id,
      name: a.name,
      size: a.size,
      mimeType: a.mimeType,
      url: a.url ?? undefined,
    })),
    folder: e.folder as FolderType,
    labels: e.labels,
    threadId: e.threadId ?? e.id,
    replyToId: e.replyToId ?? undefined,
    forwardedFromId: e.forwardedFromId ?? undefined,
    isDraft: e.isDraft,
    scheduledSendAt: e.scheduledSendAt ? new Date(e.scheduledSendAt) : undefined,
    snoozeUntil: e.snoozeUntil ? new Date(e.snoozeUntil) : undefined,
    snoozedFromFolder: e.snoozedFromFolder as FolderType | undefined,
  }
}

function toPaginated(res: PaginatedAPI): PaginatedResponse<Email> {
  return {
    data: res.data.map(toEmail),
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    totalPages: res.totalPages,
  }
}

export class ApiEmailRepository implements IEmailRepository {
  async getById(id: string): Promise<Email | null> {
    try {
      const data = await apiClient.get<EmailAPI>(`/emails/${id}`)
      return toEmail(data)
    } catch {
      return null
    }
  }

  async getByFolder(
    folder: FolderType,
    accountId?: string,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResponse<Email>> {
    const params: Record<string, string | number | boolean | undefined> = {
      folder,
      accountId,
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    }
    const data = await apiClient.get<PaginatedAPI>('/emails/', params)
    return toPaginated(data)
  }

  async getByThread(threadId: string): Promise<Email[]> {
    const data = await apiClient.get<PaginatedAPI>('/emails/', {
      threadId,
      pageSize: 200,
    })
    return data.data.map(toEmail)
  }

  async search(
    query: EmailSearchQuery,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResponse<Email>> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    }
    if (query.text) params.search = query.text
    if (query.folder) params.folder = query.folder
    if (query.accountId) params.accountId = query.accountId
    if (query.isRead !== undefined) params.isRead = query.isRead
    if (query.isStarred !== undefined) params.isStarred = query.isStarred
    if (query.hasAttachment !== undefined) params.hasAttachment = query.hasAttachment
    if (query.labels?.length) params.labelIds = query.labels.join(',')

    const data = await apiClient.get<PaginatedAPI>('/emails/', params)
    return toPaginated(data)
  }

  async getUnreadCount(folder: FolderType, accountId?: string): Promise<number> {
    const data = await apiClient.get<PaginatedAPI>('/emails/', {
      folder,
      accountId,
      isRead: false,
      pageSize: 1,
    })
    return data.total
  }

  async getFolderCount(folder: FolderType, accountId?: string): Promise<number> {
    const data = await apiClient.get<PaginatedAPI>('/emails/', {
      folder,
      accountId,
      pageSize: 1,
    })
    return data.total
  }

  async getStarred(
    accountId?: string,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResponse<Email>> {
    const data = await apiClient.get<PaginatedAPI>('/emails/', {
      isStarred: true,
      accountId,
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    })
    return toPaginated(data)
  }

  async create(input: EmailCreateInput): Promise<RepositoryResponse<Email>> {
    try {
      const data = await apiClient.post<EmailAPI>('/emails/', {
        accountId: input.accountId,
        to: input.to,
        cc: input.cc ?? [],
        bcc: input.bcc ?? [],
        subject: input.subject,
        body: input.body,
        replyToId: input.replyToId,
        forwardedFromId: input.forwardedFromId,
        scheduledSendAt: input.scheduledSendAt?.toISOString(),
      })
      return { success: true, data: toEmail(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async update(id: string, input: EmailUpdateInput): Promise<RepositoryResponse<Email>> {
    try {
      const data = await apiClient.patch<EmailAPI>(`/emails/${id}`, input)
      return { success: true, data: toEmail(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async updateMany(ids: string[], input: EmailUpdateInput): Promise<RepositoryResponse<Email[]>> {
    try {
      // Use bulk endpoint for batch updates
      if (input.isRead === true) {
        await apiClient.post('/emails/bulk', { ids, operation: 'markRead' })
      } else if (input.isRead === false) {
        await apiClient.post('/emails/bulk', { ids, operation: 'markUnread' })
      }
      if (input.isStarred === true) {
        await apiClient.post('/emails/bulk', { ids, operation: 'star' })
      } else if (input.isStarred === false) {
        await apiClient.post('/emails/bulk', { ids, operation: 'unstar' })
      }
      if (input.folder) {
        await apiClient.post('/emails/bulk', { ids, operation: 'move', folder: input.folder })
      }
      if (input.labels) {
        await apiClient.post('/emails/bulk', { ids, operation: 'addLabel', labelIds: input.labels })
      }
      // Return empty array since we don't get individual responses from bulk
      return { success: true, data: [] }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.delete(`/emails/${id}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async deleteMany(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'delete' })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async deletePermanently(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.delete(`/emails/${id}/permanent`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async deletePermanentlyMany(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'deletePermanent' })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async moveToFolder(ids: string[], folder: FolderType): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'move', folder })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async archive(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'archive' })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async markAsSpam(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'move', folder: 'spam' })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async saveDraft(email: Partial<Email>): Promise<RepositoryResponse<Email>> {
    try {
      if (email.id) {
        // Update existing draft
        const data = await apiClient.patch<EmailAPI>(`/emails/${email.id}`, {
          isRead: email.isRead,
          folder: 'drafts',
        })
        return { success: true, data: toEmail(data) }
      }

      // Create new draft
      const data = await apiClient.post<EmailAPI>('/emails/draft', {
        accountId: email.accountId,
        to: email.to ?? [],
        cc: email.cc ?? [],
        bcc: email.bcc ?? [],
        subject: email.subject ?? '',
        body: email.body ?? '',
      })
      return { success: true, data: toEmail(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async markAsRead(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'markRead' })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async markAsUnread(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'markUnread' })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async toggleStar(ids: string[]): Promise<RepositoryResponse<void>> {
    try {
      // Toggle = star (the backend can handle the toggle logic if needed,
      // but for now we'll just star since we don't know current state)
      await apiClient.post('/emails/bulk', { ids, operation: 'star' })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async addLabels(ids: string[], labelIds: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'addLabel', labelIds })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async removeLabels(ids: string[], labelIds: string[]): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post('/emails/bulk', { ids, operation: 'removeLabel', labelIds })
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}
