/**
 * Account types for the email client
 */

import type { SystemFolderType } from './email'

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
  displayName?: string
  signature?: string
  defaultSignatureId?: string
  avatar?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AccountCreateInput {
  email: string
  name: string
  color?: AccountColor
  displayName?: string
  signature?: string
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
