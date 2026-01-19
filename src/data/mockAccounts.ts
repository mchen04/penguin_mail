/**
 * Mock account data
 */

import type { Account } from '@/types/account'

const now = new Date()
const daysAgo = (days: number): Date => {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return date
}

export const mockAccounts: Account[] = [
  {
    id: 'ucr',
    email: 'mchen023@ucr.edu',
    name: 'UCR',
    color: 'blue',
    displayName: 'Michael Chen',
    signature: '<p>Best regards,<br/>Michael Chen<br/>Computer Science, UC Riverside</p>',
    isDefault: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
  },
  {
    id: 'personal',
    email: 'm.chen.dev@gmail.com',
    name: 'Personal',
    color: 'green',
    displayName: 'Michael Chen',
    signature: '<p>Thanks,<br/>Michael</p>',
    isDefault: false,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
  },
]
