import type { AccountColor } from './account'

export interface Email {
  id: string
  accountId: string
  accountColor: AccountColor
  from: {
    name: string
    email: string
  }
  to: {
    name: string
    email: string
  }[]
  cc?: {
    name: string
    email: string
  }[]
  subject: string
  preview: string
  body: string
  date: Date
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  folder: FolderType
  threadId?: string
}

export type FolderType = 'inbox' | 'drafts' | 'sent' | 'spam' | 'trash'

export interface Thread {
  id: string
  emails: Email[]
  subject: string
  lastMessageDate: Date
}
