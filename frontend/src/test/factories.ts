import type { Account, Contact, Email } from '@/types'

let _emailCounter = 0
let _contactCounter = 0
let _accountCounter = 0

export function makeEmail(overrides: Partial<Email> = {}): Email {
  const n = ++_emailCounter
  return {
    id: `email-${n}`,
    accountId: 'account-1',
    accountColor: '#000',
    from: { name: 'Sender', email: 'sender@example.com' },
    to: [{ name: 'Recipient', email: 'recipient@example.com' }],
    subject: `Test Subject ${n}`,
    preview: 'Test preview',
    body: '<p>Test body</p>',
    date: new Date('2026-01-15'),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox' as const,
    labels: [],
    threadId: `thread-${n}`,
    isDraft: false,
    ...overrides,
  }
}

export function makeContact(overrides: Partial<Contact> = {}): Contact {
  const n = ++_contactCounter
  return {
    id: `contact-${n}`,
    name: `Contact ${n}`,
    email: `contact${n}@example.com`,
    isFavorite: false,
    groups: [],
    ...overrides,
  } as Contact
}

export function makeAccount(overrides: Partial<Account> = {}): Account {
  const n = ++_accountCounter
  return {
    id: `account-${n}`,
    email: `account${n}@example.com`,
    name: `Account ${n}`,
    color: 'blue',
    isDefault: n === 1,
    ...overrides,
  } as Account
}
