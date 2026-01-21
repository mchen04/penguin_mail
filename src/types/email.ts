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

/**
 * Input type for composing and sending emails
 * Used by the compose window and sendEmail action
 */
export interface ComposeEmailInput {
  /** Existing email ID if editing a draft */
  id?: string
  /** Account to send from */
  accountId: string
  /** Sender information (typically set from account) */
  from?: EmailAddress
  /** Recipients */
  to: EmailAddress[]
  /** CC recipients */
  cc?: EmailAddress[]
  /** BCC recipients */
  bcc?: EmailAddress[]
  /** Email subject */
  subject: string
  /** Email body (HTML) */
  body: string
  /** Attachments */
  attachments?: Attachment[]
  /** Thread context */
  threadId?: string
  /** Original email ID if replying */
  replyToId?: string
  /** Original email ID if forwarding */
  forwardedFromId?: string
  /** True if this is an existing draft being sent */
  isDraft?: boolean
  /** Account color for display */
  accountColor?: AccountColor
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
