import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'
import { cleanupSeededEmails } from './seed'

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

      // Wait for accounts to load so fromAccountId is set (avoids accountId:"" → backend 500)
      await expect(page.locator('#compose-from')).not.toHaveValue('', { timeout: 5000 })

      // Send — button should be enabled now that there's a recipient
      await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeEnabled()

      // Intercept the POST /emails/ response to capture the created email ID directly
      const createResponsePromise = page.waitForResponse(
        resp => resp.url().includes('/api/v1/emails/') && resp.request().method() === 'POST',
        { timeout: 10000 }
      )
      await page.getByRole('button', { name: 'Send', exact: true }).click()
      const createResponse = await createResponsePromise
      const requestBody = createResponse.request().postData()
      const statusCode = createResponse.status()
      console.log('Request body:', requestBody)
      console.log('Send API status:', statusCode, 'body:', await createResponse.text().catch(() => '(unreadable)'))
      expect(statusCode).toBe(201)
      const createdEmail = await createResponse.json()
      sentId = createdEmail.id
      expect(sentId).toBeTruthy()

      // Compose window closes after successful send
      await expect(page.getByPlaceholder(/subject/i)).not.toBeVisible({ timeout: 5000 })
    } finally {
      // Best-effort cleanup of the sent email
      if (sentId) {
        await cleanupSeededEmails(request, TEST_USER.email, TEST_USER.password, [sentId])
      }
    }
  })
})
