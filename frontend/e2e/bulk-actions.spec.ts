import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'
import { seedInboxEmails, cleanupSeededEmails } from './seed'
import type { SeededEmail } from './seed'

test.describe('Bulk Actions', () => {
  let seededEmails: SeededEmail[] = []

  test.beforeEach(async ({ page, request }) => {
    seededEmails = await seedInboxEmails(request, TEST_USER.email, TEST_USER.password, 3)
    await loginAs(page, TEST_USER.email, TEST_USER.password)
    await expect(page.getByText('Inbox').first()).toBeVisible()
  })

  test.afterEach(async ({ request }) => {
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

  test('bulk archive multiple emails', async ({ page }) => {
    const checkboxes = page.locator('[data-testid="email-row"] input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()

    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()

    // Archive button should now be enabled with 2 items selected
    await page.getByRole('button', { name: 'Archive' }).first().click()
    await expect(page.getByText(/archived/i)).toBeVisible()
  })

  test('bulk mark as read', async ({ page }) => {
    const checkboxes = page.locator('[data-testid="email-row"] input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()

    await checkboxes.nth(0).click()
    await page.getByRole('button', { name: 'Mark as read' }).first().click()
    await expect(page.getByText(/marked as read/i)).toBeVisible()
  })

  test('bulk delete emails', async ({ page }) => {
    const checkboxes = page.locator('[data-testid="email-row"] input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()

    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()
    await page.getByRole('button', { name: /delete/i }).first().click()
    // Use a more specific text to avoid matching the "Trash" sidebar button
    await expect(page.getByText(/emails moved to trash/i)).toBeVisible()
  })
})
