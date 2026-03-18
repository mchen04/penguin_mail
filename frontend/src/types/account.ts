/**
 * Account types for the email client
 */

import type { SystemFolderType } from './email'
import type { EmailProvider } from '@/constants/providers'

export type AccountColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'red'
  | 'indigo'

export interface Account {
  id: string
  email: string
  name: string
  color: AccountColor
  provider: string
  displayName?: string
  signature?: string
  defaultSignatureId?: string
  avatar?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  lastSyncAt?: Date | null
}

export interface AccountCreateInput {
  email: string
  name: string
  color?: AccountColor
  displayName?: string
  signature?: string

  provider: EmailProvider
  password: string

  // Only for custom provider
  smtp_host?: string
  smtp_port?: number
  smtp_security?: string
  imap_host?: string
  imap_port?: number
  imap_security?: string
}

export interface AccountUpdateInput {
  name?: string
  color?: AccountColor
  displayName?: string
  signature?: string
  defaultSignatureId?: string
  avatar?: string
  isDefault?: boolean
}

export const ACCOUNT_COLOR_VAR: Record<AccountColor, string> = {
  blue: 'var(--account-blue)',
  green: 'var(--account-green)',
  purple: 'var(--account-purple)',
  orange: 'var(--account-orange)',
  pink: 'var(--account-pink)',
  teal: 'var(--account-teal)',
  red: 'var(--account-red)',
  indigo: 'var(--account-indigo)',
}

export const FOLDER_LABELS: Record<SystemFolderType, string> = {
  inbox: 'Inbox',
  drafts: 'Drafts',
  sent: 'Sent',
  spam: 'Spam',
  trash: 'Trash',
  archive: 'Archive',
  starred: 'Starred',
  snoozed: 'Snoozed',
  scheduled: 'Scheduled',
}
