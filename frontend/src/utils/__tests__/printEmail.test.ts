import { vi } from 'vitest'

// Mock DOMPurify before importing the module
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => html),
  },
}))

import { printEmail } from '../printEmail'
import DOMPurify from 'dompurify'
import type { Email } from '@/types'

const makeEmail = (overrides: Partial<Email> = {}): Email => ({
  id: 'email-1',
  accountId: 'account-1',
  accountColor: '#000',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  subject: 'Test Print',
  preview: 'Preview text',
  body: '<p>Email body content</p>',
  date: new Date('2026-01-15T10:30:00Z'),
  isRead: true,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox' as const,
  labels: [],
  threadId: 'thread-1',
  isDraft: false,
  ...overrides,
})

describe('printEmail', () => {
  let mockWrite: ReturnType<typeof vi.fn>
  let mockClose: ReturnType<typeof vi.fn>
  let mockPrintWindow: { document: { write: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> }; focus: ReturnType<typeof vi.fn>; print: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockWrite = vi.fn()
    mockClose = vi.fn()
    mockPrintWindow = {
      document: { write: mockWrite, close: mockClose },
      focus: vi.fn(),
      print: vi.fn(),
    }
    vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow as unknown as Window)
    vi.clearAllMocks()
    vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow as unknown as Window)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls window.open to create print window', () => {
    printEmail(makeEmail())
    expect(window.open).toHaveBeenCalled()
  })

  it('writes sanitized HTML to the print window', () => {
    const email = makeEmail({ body: '<script>alert("xss")</script><p>Safe</p>' })
    printEmail(email)

    expect(DOMPurify.sanitize).toHaveBeenCalled()
    expect(mockWrite).toHaveBeenCalled()
    const writtenHtml = mockWrite.mock.calls[0][0] as string
    expect(writtenHtml).toContain('Test Print')
    expect(writtenHtml).toContain('alice@example.com')
  })

  it('includes CC when present', () => {
    const email = makeEmail({
      cc: [{ name: 'Charlie', email: 'charlie@example.com' }],
    })
    printEmail(email)

    const writtenHtml = mockWrite.mock.calls[0][0] as string
    expect(writtenHtml).toContain('charlie@example.com')
  })

  it('includes BCC when present', () => {
    const email = makeEmail({
      bcc: [{ name: 'Dave', email: 'dave@example.com' }],
    })
    printEmail(email)

    const writtenHtml = mockWrite.mock.calls[0][0] as string
    expect(writtenHtml).toContain('dave@example.com')
  })

  it('omits CC and BCC sections when not present', () => {
    const email = makeEmail({ cc: undefined, bcc: undefined })
    printEmail(email)

    const writtenHtml = mockWrite.mock.calls[0][0] as string
    // Should not contain CC or BCC labels when they are absent
    expect(writtenHtml).not.toContain('Cc:')
    expect(writtenHtml).not.toContain('Bcc:')
  })
})
