/**
 * Comprehensive settings types for the email client
 */

// Appearance
export type Theme = 'light' | 'dark' | 'system'
export type Density = 'compact' | 'default' | 'comfortable'
export type FontSize = 'small' | 'medium' | 'large'
export type ReadingPanePosition = 'right' | 'bottom' | 'hidden'

// Behavior
export type ReplyBehavior = 'reply' | 'replyAll'
export type SendBehavior = 'immediately' | 'delay30s' | 'delay60s'

// Language & Region
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
export type TimeFormat = '12h' | '24h'

export interface Signature {
  id: string
  name: string
  content: string
  isDefault: boolean
}

export interface VacationResponder {
  enabled: boolean
  subject: string
  message: string
  startDate: Date | null
  endDate: Date | null
  sendToContacts: boolean
  sendToEveryone: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  desktopNotifications: boolean
  soundEnabled: boolean
  notifyOnNewEmail: boolean
  notifyOnMention: boolean
}

export interface KeyboardShortcut {
  id: string
  action: string
  key: string
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  enabled: boolean
}

export interface FilterRule {
  id: string
  name: string
  enabled: boolean
  conditions: FilterCondition[]
  matchAll: boolean // true = AND, false = OR
  actions: FilterAction[]
  createdAt: Date
  updatedAt: Date
}

export interface FilterCondition {
  field: 'from' | 'to' | 'subject' | 'body' | 'hasAttachment'
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notContains'
  value: string
}

export interface FilterAction {
  type: 'moveTo' | 'addLabel' | 'markAsRead' | 'markAsStarred' | 'delete' | 'archive'
  value?: string // folder id or label id for moveTo/addLabel
}

export interface BlockedAddress {
  id: string
  email: string
  createdAt: Date
}

export interface AppearanceSettings {
  theme: Theme
  density: Density
  fontSize: FontSize
}

export interface InboxBehaviorSettings {
  defaultReplyBehavior: ReplyBehavior
  sendBehavior: SendBehavior
  conversationView: boolean
  readingPanePosition: ReadingPanePosition
  autoAdvance: 'next' | 'previous' | 'list'
  markAsReadDelay: number // milliseconds, 0 = immediately
}

export interface LanguageSettings {
  language: string
  timezone: string
  dateFormat: DateFormat
  timeFormat: TimeFormat
}

export interface Settings {
  appearance: AppearanceSettings
  notifications: NotificationSettings
  inboxBehavior: InboxBehaviorSettings
  language: LanguageSettings
  signatures: Signature[]
  vacationResponder: VacationResponder
  keyboardShortcuts: KeyboardShortcut[]
  filters: FilterRule[]
  blockedAddresses: BlockedAddress[]
}

// Default settings factory
export function createDefaultSettings(): Settings {
  return {
    appearance: {
      theme: 'light',
      density: 'default',
      fontSize: 'medium',
    },
    notifications: {
      emailNotifications: true,
      desktopNotifications: false,
      soundEnabled: true,
      notifyOnNewEmail: true,
      notifyOnMention: true,
    },
    inboxBehavior: {
      defaultReplyBehavior: 'reply',
      sendBehavior: 'immediately',
      conversationView: true,
      readingPanePosition: 'right',
      autoAdvance: 'next',
      markAsReadDelay: 0,
    },
    language: {
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    },
    signatures: [],
    vacationResponder: {
      enabled: false,
      subject: '',
      message: '',
      startDate: null,
      endDate: null,
      sendToContacts: true,
      sendToEveryone: false,
    },
    keyboardShortcuts: getDefaultKeyboardShortcuts(),
    filters: [],
    blockedAddresses: [],
  }
}

export function getDefaultKeyboardShortcuts(): KeyboardShortcut[] {
  return [
    { id: 'compose', action: 'Compose new email', key: 'c', modifiers: [], enabled: true },
    { id: 'reply', action: 'Reply', key: 'r', modifiers: [], enabled: true },
    { id: 'replyAll', action: 'Reply all', key: 'a', modifiers: [], enabled: true },
    { id: 'forward', action: 'Forward', key: 'f', modifiers: [], enabled: true },
    { id: 'archive', action: 'Archive', key: 'e', modifiers: [], enabled: true },
    { id: 'delete', action: 'Delete', key: '#', modifiers: [], enabled: true },
    { id: 'markRead', action: 'Mark as read', key: 'i', modifiers: ['shift'], enabled: true },
    { id: 'markUnread', action: 'Mark as unread', key: 'u', modifiers: ['shift'], enabled: true },
    { id: 'star', action: 'Star/unstar', key: 's', modifiers: [], enabled: true },
    { id: 'selectAll', action: 'Select all', key: 'a', modifiers: ['ctrl'], enabled: true },
    { id: 'search', action: 'Search', key: '/', modifiers: [], enabled: true },
    { id: 'escape', action: 'Close/cancel', key: 'Escape', modifiers: [], enabled: true },
    { id: 'nextEmail', action: 'Next email', key: 'j', modifiers: [], enabled: true },
    { id: 'prevEmail', action: 'Previous email', key: 'k', modifiers: [], enabled: true },
    { id: 'openEmail', action: 'Open email', key: 'o', modifiers: [], enabled: true },
    { id: 'goToInbox', action: 'Go to inbox', key: 'g', modifiers: [], enabled: true },
    { id: 'send', action: 'Send email', key: 'Enter', modifiers: ['ctrl'], enabled: true },
  ]
}
