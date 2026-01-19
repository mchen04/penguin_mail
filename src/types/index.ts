/**
 * Barrel export for all types
 */

// Email types
export type {
  Email,
  EmailAddress,
  Attachment,
  Label,
  SystemFolderType,
  FolderType,
  CustomFolder,
  Thread,
  EmailDraft,
  EmailCreateInput,
  EmailUpdateInput,
  EmailSearchQuery,
} from './email'
export { SYSTEM_FOLDERS, isSystemFolder } from './email'

// Account types
export type {
  Account,
  AccountColor,
  AccountCreateInput,
  AccountUpdateInput,
} from './account'
export { ACCOUNT_COLOR_VAR, FOLDER_LABELS, FOLDER_ICONS } from './account'

// Settings types
export type {
  Theme,
  Density,
  FontSize,
  ReadingPanePosition,
  ReplyBehavior,
  SendBehavior,
  DateFormat,
  TimeFormat,
  Signature,
  VacationResponder,
  NotificationSettings,
  KeyboardShortcut,
  FilterRule,
  FilterCondition,
  FilterAction,
  BlockedAddress,
  AppearanceSettings,
  InboxBehaviorSettings,
  LanguageSettings,
  Settings,
} from './settings'
export { createDefaultSettings, getDefaultKeyboardShortcuts } from './settings'

// Contact types
export type {
  Contact,
  ContactGroup,
  ContactCreateInput,
  ContactUpdateInput,
} from './contact'
