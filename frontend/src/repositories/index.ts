/**
 * Repository barrel export and factory
 */

export * from './types'
export { MockEmailRepository } from './MockEmailRepository'
export { MockAccountRepository } from './MockAccountRepository'
export { MockContactRepository, MockContactGroupRepository } from './MockContactRepository'
export { MockSettingsRepository } from './MockSettingsRepository'
export { MockFolderRepository, MockLabelRepository } from './MockFolderRepository'

import type { IRepositories } from './types'
import { MockEmailRepository } from './MockEmailRepository'
import { MockAccountRepository } from './MockAccountRepository'
import { MockContactRepository, MockContactGroupRepository } from './MockContactRepository'
import { MockSettingsRepository } from './MockSettingsRepository'
import { MockFolderRepository, MockLabelRepository } from './MockFolderRepository'

/**
 * Create mock repositories for development and testing
 */
export function createMockRepositories(): IRepositories {
  return {
    emails: new MockEmailRepository(),
    folders: new MockFolderRepository(),
    labels: new MockLabelRepository(),
    accounts: new MockAccountRepository(),
    contacts: new MockContactRepository(),
    contactGroups: new MockContactGroupRepository(),
    settings: new MockSettingsRepository(),
  }
}

