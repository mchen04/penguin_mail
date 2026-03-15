import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'
import { seedInboxEmails, cleanupSeededEmails } from './seed'
import type { SeededEmail } from './seed'

test.describe('Bulk Actions', () => {
  let seededEmails: SeededEmail[] = []

  test.beforeEach(async ({ page, request }) => {
    seededEmails = await seedInboxEmails(request, TEST_USER.email, TEST_USER.password, 3)
    await loginAs(page, TEST_USER.email, TEST_USER.password)
    await expect(page.getByText('Inbox')).toBeVisible()
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
    await expect(checkboxes).toHaveCount(3)

    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()

    await expect(page.getByText(/2 selected/i)).toBeVisible()
    await page.getByRole('button', { name: /archive/i }).click()
    await expect(page.getByText(/archived/i)).toBeVisible()
  })

  test('bulk mark as read', async ({ page }) => {
    const checkboxes = page.locator('[data-testid="email-row"] input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()

    await checkboxes.nth(0).click()
    await page.getByRole('button', { name: /mark.*read/i }).click()
    await expect(page.getByText(/read/i)).toBeVisible()
  })

  test('bulk delete emails', async ({ page }) => {
    const checkboxes = page.locator('[data-testid="email-row"] input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()
    await expect(checkboxes).toHaveCount(3)

    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()
    await page.getByRole('button', { name: /delete/i }).click()
    await expect(page.getByText(/trash/i)).toBeVisible()
  })
})
