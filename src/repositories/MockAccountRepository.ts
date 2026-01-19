/**
 * Mock Account Repository
 * Implements IAccountRepository with localStorage persistence
 */

import type { Account, AccountCreateInput, AccountUpdateInput } from '@/types'
import type { IAccountRepository, RepositoryResponse } from './types'
import { storage, STORAGE_KEYS, generateId } from '@/services/storage'

export class MockAccountRepository implements IAccountRepository {
  private async getAccounts(): Promise<Account[]> {
    const accounts = await storage.get<Account[]>(STORAGE_KEYS.ACCOUNTS)
    return accounts ?? []
  }

  private async saveAccounts(accounts: Account[]): Promise<void> {
    await storage.set(STORAGE_KEYS.ACCOUNTS, accounts)
  }

  async getAll(): Promise<Account[]> {
    return this.getAccounts()
  }

  async getById(id: string): Promise<Account | null> {
    const accounts = await this.getAccounts()
    return accounts.find((a) => a.id === id) ?? null
  }

  async getDefault(): Promise<Account | null> {
    const accounts = await this.getAccounts()
    return accounts.find((a) => a.isDefault) ?? accounts[0] ?? null
  }

  async create(input: AccountCreateInput): Promise<RepositoryResponse<Account>> {
    try {
      const accounts = await this.getAccounts()
      const now = new Date()

      const newAccount: Account = {
        id: generateId(),
        email: input.email,
        name: input.name,
        color: input.color ?? 'blue',
        displayName: input.displayName,
        signature: input.signature,
        isDefault: accounts.length === 0,
        createdAt: now,
        updatedAt: now,
      }

      accounts.push(newAccount)
      await this.saveAccounts(accounts)

      return { data: newAccount, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account',
      }
    }
  }

  async update(id: string, input: AccountUpdateInput): Promise<RepositoryResponse<Account>> {
    try {
      const accounts = await this.getAccounts()
      const index = accounts.findIndex((a) => a.id === id)

      if (index === -1) {
        return { success: false, error: 'Account not found' }
      }

      const updated: Account = {
        ...accounts[index],
        ...input,
        updatedAt: new Date(),
      }
      accounts[index] = updated
      await this.saveAccounts(accounts)

      return { data: updated, success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update account',
      }
    }
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    try {
      const accounts = await this.getAccounts()
      const filtered = accounts.filter((a) => a.id !== id)

      // If we deleted the default account, make another one default
      if (!filtered.some((a) => a.isDefault) && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true }
      }

      await this.saveAccounts(filtered)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account',
      }
    }
  }

  async setDefault(id: string): Promise<RepositoryResponse<void>> {
    try {
      const accounts = await this.getAccounts()

      const updated = accounts.map((a) => ({
        ...a,
        isDefault: a.id === id,
        updatedAt: a.id === id ? new Date() : a.updatedAt,
      }))

      await this.saveAccounts(updated)
      return { data: undefined, success: true }
    } catch (error) {
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set default account',
      }
    }
  }
}
