import type { Account, AccountCreateInput, AccountUpdateInput } from '@/types'
import type { IAccountRepository, RepositoryResponse } from './types'
import { apiClient } from '@/services/apiClient'

interface AccountAPI {
  id: string
  email: string
  name: string
  color: string
  displayName: string
  signature: string
  defaultSignatureId: string
  avatar: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

function toAccount(a: AccountAPI): Account {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    color: a.color as Account['color'],
    displayName: a.displayName || undefined,
    signature: a.signature || undefined,
    defaultSignatureId: a.defaultSignatureId || undefined,
    avatar: a.avatar || undefined,
    isDefault: a.isDefault,
    createdAt: new Date(a.createdAt),
    updatedAt: new Date(a.updatedAt),
  }
}

export class ApiAccountRepository implements IAccountRepository {
  async getAll(): Promise<Account[]> {
    const data = await apiClient.get<AccountAPI[]>('/accounts/')
    return data.map(toAccount)
  }

  async getById(id: string): Promise<Account | null> {
    try {
      const data = await apiClient.get<AccountAPI>(`/accounts/${id}`)
      return toAccount(data)
    } catch {
      return null
    }
  }

  async getDefault(): Promise<Account | null> {
    const accounts = await this.getAll()
    return accounts.find(a => a.isDefault) ?? accounts[0] ?? null
  }

  async create(input: AccountCreateInput): Promise<RepositoryResponse<Account>> {
    try {
      const data = await apiClient.post<AccountAPI>('/accounts/', {
        email: input.email,
        name: input.name,
        color: input.color ?? 'blue',
        displayName: input.displayName ?? '',
        signature: input.signature ?? '',
      })
      return { success: true, data: toAccount(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async update(id: string, input: AccountUpdateInput): Promise<RepositoryResponse<Account>> {
    try {
      const body: Record<string, unknown> = {}
      if (input.name !== undefined) body.name = input.name
      if (input.color !== undefined) body.color = input.color
      if (input.displayName !== undefined) body.displayName = input.displayName
      if (input.signature !== undefined) body.signature = input.signature
      if (input.defaultSignatureId !== undefined) body.defaultSignatureId = input.defaultSignatureId
      if (input.avatar !== undefined) body.avatar = input.avatar
      if (input.isDefault !== undefined) body.isDefault = input.isDefault

      const data = await apiClient.patch<AccountAPI>(`/accounts/${id}`, body)
      return { success: true, data: toAccount(data) }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.delete(`/accounts/${id}`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }

  async setDefault(id: string): Promise<RepositoryResponse<void>> {
    try {
      await apiClient.post(`/accounts/${id}/set-default`)
      return { success: true, data: undefined }
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }
  }
}
