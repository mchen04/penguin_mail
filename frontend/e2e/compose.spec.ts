import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'
import { cleanupSeededEmails } from './seed'
import type { APIRequestContext } from '@playwright/test'

async function getToken(request: APIRequestContext): Promise<string> {
  const resp = await request.post('http://localhost:8000/api/v1/auth/login', {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  })
  const { access_token: access } = await resp.json()
  return access
}

async function findSentEmailBySubject(
  request: APIRequestContext,
  token: string,
  subject: string
): Promise<string | null> {
  const resp = await request.get(
    `http://localhost:8000/api/v1/emails/?folder=sent`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!resp.ok()) return null
  const data = await resp.json()
  const emails: Array<{ id: string; subject: string }> = data.results ?? data
  return emails.find(e => e.subject === subject)?.id ?? null
}

test.describe('Compose', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password)
  })

  test('opens compose window', async ({ page }) => {
    await page.getByRole('button', { name: /compose/i }).click()
    await expect(page.getByPlaceholder(/subject/i)).toBeVisible({ timeout: 5000 })
  })

  test('compose has To field', async ({ page }) => {
    await page.getByRole('button', { name: /compose/i }).click()
    await expect(page.getByPlaceholder(/recipients|to|email addresses/i)).toBeVisible({ timeout: 5000 })
  })

  test('compose can be closed', async ({ page }) => {
    await page.getByRole('button', { name: /compose/i }).click()
    await expect(page.getByPlaceholder(/subject/i)).toBeVisible({ timeout: 5000 })

    const closeBtn = page.getByRole('button', { name: 'Close', exact: true })
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()

    await expect(page.getByPlaceholder(/subject/i)).not.toBeVisible()
  })

  test('fill and send email → appears in Sent folder', async ({ page, request }) => {
    const subject = `E2E send test [${Date.now()}]`
    let sentId: string | null = null

    try {
      // Open compose
      await page.getByRole('button', { name: /compose/i }).click()
      await expect(page.getByPlaceholder(/subject/i)).toBeVisible({ timeout: 5000 })

      // Fill To field with a valid recipient and commit with Enter
      const toInput = page.getByPlaceholder(/email addresses/i)
      await toInput.fill(TEST_USER.email)
      await toInput.press('Enter')

      // Fill Subject
      await page.getByPlaceholder(/subject/i).fill(subject)

      // Send — button should be enabled now that there's a recipient
      await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeEnabled()
      await page.getByRole('button', { name: 'Send', exact: true }).click()

      // Compose window closes after successful send
      await expect(page.getByPlaceholder(/subject/i)).not.toBeVisible({ timeout: 5000 })

      // Navigate to Sent folder and verify the email landed there
      await page.getByRole('link', { name: /^sent$/i }).click()
      await expect(page.getByText(subject)).toBeVisible({ timeout: 10000 })

      // Record the sent email ID for cleanup
      const token = await getToken(request)
      sentId = await findSentEmailBySubject(request, token, subject)
    } finally {
      // Best-effort cleanup of the sent email
      if (sentId) {
        await cleanupSeededEmails(request, TEST_USER.email, TEST_USER.password, [sentId])
      }
    }
  })
})
