/**
 * Email types for the email client
 */

import type { AccountColor } from './account'

export interface EmailAddress {
  name: string
  email: string
}

export interface Attachment {
  id: string
  name: string
  size: number
  mimeType: string
  url?: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export type SystemFolderType = 'inbox' | 'drafts' | 'sent' | 'spam' | 'trash' | 'archive' | 'starred'
export type FolderType = SystemFolderType | string // string for custom folders

export interface CustomFolder {
  id: string
  name: string
  color: string
  parentId: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Email {
  id: string
  accountId: string
  accountColor: AccountColor
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  subject: string
  preview: string
  body: string
  date: Date
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  attachments: Attachment[]
  folder: FolderType
  labels: string[]
  threadId: string
  replyToId?: string
  forwardedFromId?: string
  isDraft: boolean
  scheduledSendAt?: Date
}

export interface Thread {
  id: string
  emails: Email[]
  subject: string
  lastMessageDate: Date
  participants: EmailAddress[]
  unreadCount: number
  hasAttachment: boolean
  isStarred: boolean
  labels: string[]
}

export interface EmailDraft {
  id: string
  accountId: string
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  subject: string
  body: string
  attachments: Attachment[]
  replyToId?: string
  forwardedFromId?: string
  savedAt: Date
}

export interface EmailCreateInput {
  accountId: string
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  subject: string
  body: string
  attachments?: Attachment[]
  replyToId?: string
  forwardedFromId?: string
  scheduledSendAt?: Date
}

export interface EmailUpdateInput {
  isRead?: boolean
  isStarred?: boolean
  folder?: FolderType
  labels?: string[]
}

export interface EmailSearchQuery {
  text?: string
  from?: string
  to?: string
  subject?: string
  hasAttachment?: boolean
  isStarred?: boolean
  isRead?: boolean
  folder?: FolderType
  labels?: string[]
  dateFrom?: Date
  dateTo?: Date
  accountId?: string
}

// System folder definitions
export const SYSTEM_FOLDERS: SystemFolderType[] = [
  'inbox',
  'drafts',
  'sent',
  'spam',
  'trash',
  'archive',
  'starred',
]

export function isSystemFolder(folder: string): folder is SystemFolderType {
  return SYSTEM_FOLDERS.includes(folder as SystemFolderType)
}
