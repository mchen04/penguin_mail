import type { FolderType } from './email'

// Re-export for convenience
export type { FolderType } from './email'

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
  signature?: string
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

export const FOLDER_LABELS: Record<FolderType, string> = {
  inbox: 'Inbox',
  drafts: 'Drafts',
  sent: 'Sent',
  spam: 'Spam',
  trash: 'Trash',
}
