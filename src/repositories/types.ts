/**
 * Repository interface types
 * These define the contract between the app and data layer
 */

import type {
  Email,
  EmailCreateInput,
  EmailUpdateInput,
  EmailSearchQuery,
  CustomFolder,
  Label,
  Account,
  AccountCreateInput,
  AccountUpdateInput,
  Contact,
  ContactGroup,
  ContactCreateInput,
  ContactUpdateInput,
  Settings,
  FolderType,
} from '@/types'

/**
 * Common response wrapper for async operations
 */
export interface RepositoryResponse<T> {
  data: T
  success: boolean
  error?: string
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number
  pageSize: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Email Repository Interface
 */
export interface IEmailRepository {
  // Read operations
  getById(id: string): Promise<Email | null>
  getByFolder(folder: FolderType, accountId?: string, pagination?: PaginationOptions): Promise<PaginatedResponse<Email>>
  getByThread(threadId: string): Promise<Email[]>
  search(query: EmailSearchQuery, pagination?: PaginationOptions): Promise<PaginatedResponse<Email>>
  getUnreadCount(folder: FolderType, accountId?: string): Promise<number>
  getFolderCount(folder: FolderType, accountId?: string): Promise<number>
  getStarred(accountId?: string, pagination?: PaginationOptions): Promise<PaginatedResponse<Email>>

  // Write operations
  create(input: EmailCreateInput): Promise<RepositoryResponse<Email>>
  update(id: string, input: EmailUpdateInput): Promise<RepositoryResponse<Email>>
  updateMany(ids: string[], input: EmailUpdateInput): Promise<RepositoryResponse<Email[]>>
  delete(id: string): Promise<RepositoryResponse<void>>
  deleteMany(ids: string[]): Promise<RepositoryResponse<void>>
  deletePermanently(id: string): Promise<RepositoryResponse<void>>
  deletePermanentlyMany(ids: string[]): Promise<RepositoryResponse<void>>

  // Folder operations
  moveToFolder(ids: string[], folder: FolderType): Promise<RepositoryResponse<void>>
  archive(ids: string[]): Promise<RepositoryResponse<void>>
  markAsSpam(ids: string[]): Promise<RepositoryResponse<void>>

  // Draft operations
  saveDraft(email: Partial<Email>): Promise<RepositoryResponse<Email>>

  // Bulk operations
  markAsRead(ids: string[]): Promise<RepositoryResponse<void>>
  markAsUnread(ids: string[]): Promise<RepositoryResponse<void>>
  toggleStar(ids: string[]): Promise<RepositoryResponse<void>>
  addLabels(ids: string[], labelIds: string[]): Promise<RepositoryResponse<void>>
  removeLabels(ids: string[], labelIds: string[]): Promise<RepositoryResponse<void>>
}

/**
 * Folder Repository Interface
 */
export interface IFolderRepository {
  getAll(accountId?: string): Promise<CustomFolder[]>
  getById(id: string): Promise<CustomFolder | null>
  create(name: string, color: string, parentId?: string): Promise<RepositoryResponse<CustomFolder>>
  update(id: string, data: Partial<CustomFolder>): Promise<RepositoryResponse<CustomFolder>>
  delete(id: string): Promise<RepositoryResponse<void>>
  reorder(folderId: string, newOrder: number): Promise<RepositoryResponse<void>>
}

/**
 * Label Repository Interface
 */
export interface ILabelRepository {
  getAll(): Promise<Label[]>
  getById(id: string): Promise<Label | null>
  create(name: string, color: string): Promise<RepositoryResponse<Label>>
  update(id: string, data: Partial<Label>): Promise<RepositoryResponse<Label>>
  delete(id: string): Promise<RepositoryResponse<void>>
}

/**
 * Account Repository Interface
 */
export interface IAccountRepository {
  getAll(): Promise<Account[]>
  getById(id: string): Promise<Account | null>
  getDefault(): Promise<Account | null>
  create(input: AccountCreateInput): Promise<RepositoryResponse<Account>>
  update(id: string, input: AccountUpdateInput): Promise<RepositoryResponse<Account>>
  delete(id: string): Promise<RepositoryResponse<void>>
  setDefault(id: string): Promise<RepositoryResponse<void>>
}

/**
 * Contact Repository Interface
 */
export interface IContactRepository {
  getAll(pagination?: PaginationOptions): Promise<PaginatedResponse<Contact>>
  getById(id: string): Promise<Contact | null>
  getByEmail(email: string): Promise<Contact | null>
  search(query: string, pagination?: PaginationOptions): Promise<PaginatedResponse<Contact>>
  getFavorites(): Promise<Contact[]>
  getByGroup(groupId: string): Promise<Contact[]>
  create(input: ContactCreateInput): Promise<RepositoryResponse<Contact>>
  update(id: string, input: ContactUpdateInput): Promise<RepositoryResponse<Contact>>
  delete(id: string): Promise<RepositoryResponse<void>>
  toggleFavorite(id: string): Promise<RepositoryResponse<Contact>>
  addToGroup(contactId: string, groupId: string): Promise<RepositoryResponse<void>>
  removeFromGroup(contactId: string, groupId: string): Promise<RepositoryResponse<void>>
}

/**
 * Contact Group Repository Interface
 */
export interface IContactGroupRepository {
  getAll(): Promise<ContactGroup[]>
  getById(id: string): Promise<ContactGroup | null>
  create(name: string, color: string): Promise<RepositoryResponse<ContactGroup>>
  update(id: string, data: Partial<ContactGroup>): Promise<RepositoryResponse<ContactGroup>>
  delete(id: string): Promise<RepositoryResponse<void>>
}

/**
 * Settings Repository Interface
 */
export interface ISettingsRepository {
  get(): Promise<Settings>
  update(settings: Partial<Settings>): Promise<RepositoryResponse<Settings>>
  reset(): Promise<RepositoryResponse<Settings>>

  // Convenience methods for common operations
  updateAppearance(settings: Partial<Settings['appearance']>): Promise<RepositoryResponse<Settings>>
  updateNotifications(settings: Partial<Settings['notifications']>): Promise<RepositoryResponse<Settings>>
  updateInboxBehavior(settings: Partial<Settings['inboxBehavior']>): Promise<RepositoryResponse<Settings>>
  updateLanguage(settings: Partial<Settings['language']>): Promise<RepositoryResponse<Settings>>

  // Signature operations
  addSignature(name: string, content: string, isDefault?: boolean): Promise<RepositoryResponse<Settings>>
  updateSignature(id: string, data: { name?: string; content?: string; isDefault?: boolean }): Promise<RepositoryResponse<Settings>>
  deleteSignature(id: string): Promise<RepositoryResponse<Settings>>

  // Filter operations
  addFilter(filter: Omit<Settings['filters'][0], 'id' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResponse<Settings>>
  updateFilter(id: string, data: Partial<Settings['filters'][0]>): Promise<RepositoryResponse<Settings>>
  deleteFilter(id: string): Promise<RepositoryResponse<Settings>>

  // Blocked addresses
  blockAddress(email: string): Promise<RepositoryResponse<Settings>>
  unblockAddress(email: string): Promise<RepositoryResponse<Settings>>
}

/**
 * Combined repositories interface for dependency injection
 */
export interface IRepositories {
  emails: IEmailRepository
  folders: IFolderRepository
  labels: ILabelRepository
  accounts: IAccountRepository
  contacts: IContactRepository
  contactGroups: IContactGroupRepository
  settings: ISettingsRepository
}
