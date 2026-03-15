/**
 * API-based test data seeding for E2E tests.
 * Uses Playwright's APIRequestContext to create/cleanup emails directly via the backend,
 * so E2E tests are not dependent on pre-existing database state.
 */
import type { APIRequestContext } from '@playwright/test'

const SEED_API_URL =
  process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8000'

export interface SeededEmail {
  id: string
  subject: string
}

async function getAccessToken(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  const resp = await request.post(`${SEED_API_URL}/api/v1/auth/login`, {
    data: { email, password },
  })
  if (!resp.ok()) {
    throw new Error(`Login failed: ${resp.status()} ${await resp.text()}`)
  }
  const { access } = await resp.json()
  return access
}

async function getFirstAccountId(
  request: APIRequestContext,
  token: string
): Promise<string> {
  const resp = await request.get(`${SEED_API_URL}/api/v1/accounts/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!resp.ok()) {
    throw new Error(`Failed to fetch accounts: ${resp.status()}`)
  }
  const accounts = await resp.json()
  if (!accounts.length) {
    throw new Error('Test user has no email accounts — seed the DB first')
  }
  return accounts[0].id
}

/**
 * Creates `count` emails in the test user's inbox via the API and returns their IDs + subjects.
 * Call this in `test.beforeEach` to guarantee inbox has known emails.
 */
export async function seedInboxEmails(
  request: APIRequestContext,
  userEmail: string,
  password: string,
  count = 3
): Promise<SeededEmail[]> {
  const token = await getAccessToken(request, userEmail, password)
  const accountId = await getFirstAccountId(request, token)
  const headers = { Authorization: `Bearer ${token}` }

  const seeded: SeededEmail[] = []
  for (let i = 0; i < count; i++) {
    const subject = `E2E seed ${i + 1} [${Date.now()}-${i}]`

    // Create in sent folder (the only folder available via POST /emails/)
    const createResp = await request.post(`${SEED_API_URL}/api/v1/emails/`, {
      headers,
      data: {
        accountId,
        to: [{ email: userEmail, name: 'Self' }],
        subject,
        body: '<p>E2E test email</p>',
      },
    })
    if (!createResp.ok()) {
      throw new Error(`Failed to create seed email: ${createResp.status()}`)
    }
    const email = await createResp.json()

    // Move to inbox so tests can find it there
    await request.patch(`${SEED_API_URL}/api/v1/emails/${email.id}`, {
      headers,
      data: { folder: 'inbox' },
    })

    seeded.push({ id: email.id, subject })
  }

  return seeded
}

/**
 * Permanently deletes the given email IDs via bulk API.
 * Call this in `test.afterEach` to prevent seeded data from accumulating.
 */
export async function cleanupSeededEmails(
  request: APIRequestContext,
  userEmail: string,
  password: string,
  emailIds: string[]
): Promise<void> {
  if (!emailIds.length) return
  const token = await getAccessToken(request, userEmail, password)
  await request.post(`${SEED_API_URL}/api/v1/emails/bulk`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { ids: emailIds, operation: 'deletePermanent' },
  })
}
