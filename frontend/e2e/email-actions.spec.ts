import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'
import { seedInboxEmails, cleanupSeededEmails } from './seed'
import type { SeededEmail } from './seed'

test.describe('Email Actions', () => {
  let seededEmails: SeededEmail[] = []

  test.beforeEach(async ({ page, request }) => {
    // Seed known emails so tests don't depend on pre-existing DB state
    seededEmails = await seedInboxEmails(request, TEST_USER.email, TEST_USER.password, 3)
    await loginAs(page, TEST_USER.email, TEST_USER.password)
    await expect(page.getByText('Inbox')).toBeVisible()
  })

  test.afterEach(async ({ request }) => {
    // Permanently delete seeded emails to prevent accumulation between runs
    if (seededEmails.length > 0) {
      await cleanupSeededEmails(
        request,
        TEST_USER.email,
        TEST_USER.password,
        seededEmails.map((e) => e.id)
      )
      seededEmails = []
    }
  })

  test('archive email moves it to archive', async ({ page }) => {
    const firstEmail = page.locator('[data-testid="email-row"]').first()
    await expect(firstEmail).toBeVisible()

    const subject = seededEmails[0].subject
    await firstEmail.click()
    await page.getByRole('button', { name: /archive/i }).click()

    // Email disappears from inbox
    await expect(firstEmail).not.toBeVisible({ timeout: 5000 })

    // Navigate to Archive and verify it landed there
    await page.getByRole('link', { name: /^archive$/i }).click()
    await expect(page.getByText(subject)).toBeVisible({ timeout: 5000 })
  })

  test('delete email moves to trash', async ({ page }) => {
    const firstEmail = page.locator('[data-testid="email-row"]').first()
    await expect(firstEmail).toBeVisible()

    const subject = seededEmails[0].subject
    await firstEmail.click()
    await page.getByRole('button', { name: /delete/i }).click()

    // Email disappears from inbox
    await expect(firstEmail).not.toBeVisible({ timeout: 5000 })

    // Navigate to Trash and verify it landed there
    await page.getByRole('link', { name: /^trash$/i }).click()
    await expect(page.getByText(subject)).toBeVisible({ timeout: 5000 })
  })

  test('star email toggles star state', async ({ page }) => {
    const firstEmailRow = page.locator('[data-testid="email-row"]').first()
    await expect(firstEmailRow).toBeVisible()

    // Seeded emails are unstarred — find the star button in its initial state
    const starButton = firstEmailRow.getByRole('button', { name: 'Star email' })
    await expect(starButton).toHaveAttribute('aria-pressed', 'false')

    await starButton.click()

    // After toggle: aria-pressed flips to true and the label changes to 'Unstar email'
    const unstarButton = firstEmailRow.getByRole('button', { name: 'Unstar email' })
    await expect(unstarButton).toHaveAttribute('aria-pressed', 'true')
  })

  test('mark email as unread', async ({ page }) => {
    const firstEmail = page.locator('[data-testid="email-row"]').first()
    await expect(firstEmail).toBeVisible()
    await firstEmail.click()

    await page.getByRole('button', { name: /mark.*unread/i }).click()

    // Notifications region shows confirmation
    const notifications = page.getByRole('region', { name: /notifications/i })
    await expect(notifications.getByText(/unread/i)).toBeVisible({ timeout: 5000 })
  })

  test('move email to folder', async ({ page }) => {
    const firstEmail = page.locator('[data-testid="email-row"]').first()
    await expect(firstEmail).toBeVisible()
    await firstEmail.click()

    await page.getByRole('button', { name: /move/i }).click()
    await page.getByText('Archive').click()

    await expect(firstEmail).not.toBeVisible({ timeout: 5000 })
  })
})
