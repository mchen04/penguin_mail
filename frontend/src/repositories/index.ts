/**
 * Repository barrel export and factory
 */

export * from './types'
export { ApiEmailRepository } from './ApiEmailRepository'
export { ApiAccountRepository } from './ApiAccountRepository'
export { ApiContactRepository, ApiContactGroupRepository } from './ApiContactRepository'
export { ApiFolderRepository, ApiLabelRepository } from './ApiFolderRepository'
export { ApiSettingsRepository } from './ApiSettingsRepository'

import type { IRepositories } from './types'
import { ApiEmailRepository } from './ApiEmailRepository'
import { ApiAccountRepository } from './ApiAccountRepository'
import { ApiContactRepository, ApiContactGroupRepository } from './ApiContactRepository'
import { ApiFolderRepository, ApiLabelRepository } from './ApiFolderRepository'
import { ApiSettingsRepository } from './ApiSettingsRepository'

/**
 * Create API repositories for production use with backend
 */
export function createApiRepositories(): IRepositories {
  return {
    emails: new ApiEmailRepository(),
    folders: new ApiFolderRepository(),
    labels: new ApiLabelRepository(),
    accounts: new ApiAccountRepository(),
    contacts: new ApiContactRepository(),
    contactGroups: new ApiContactGroupRepository(),
    settings: new ApiSettingsRepository(),
  }
}
