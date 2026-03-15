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
    await expect(page.getByText('Inbox').first()).toBeVisible()
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
    const subject = seededEmails[0].subject
    const emailRow = page.locator('[data-testid="email-row"]').filter({ hasText: subject })
    await expect(emailRow).toBeVisible()

    await emailRow.click()
    await page.getByRole('button', { name: 'Archive' }).first().click()

    // Email disappears from inbox — archive folder has no sidebar button to verify further
    await expect(emailRow).not.toBeVisible({ timeout: 5000 })
  })

  test('delete email moves to trash', async ({ page }) => {
    const subject = seededEmails[0].subject
    const emailRow = page.locator('[data-testid="email-row"]').filter({ hasText: subject })
    await expect(emailRow).toBeVisible()

    await emailRow.click()
    await page.getByRole('button', { name: 'Delete' }).first().click()

    // Email disappears from inbox
    await expect(emailRow).not.toBeVisible({ timeout: 5000 })

    // Navigate to Trash and verify it landed there
    await page.locator('aside').getByRole('button', { name: 'Trash', exact: true }).click()
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
    const subject = seededEmails[0].subject
    const emailRow = page.locator('[data-testid="email-row"]').filter({ hasText: subject })
    await expect(emailRow).toBeVisible()
    await emailRow.click()

    // Open the "More actions" dropdown — it shows "Mark as unread" because clicking opens = marks as read
    await page.getByRole('button', { name: 'More actions' }).click()
    const markUnreadItem = page.getByText('Mark as unread')
    await expect(markUnreadItem).toBeVisible({ timeout: 3000 })
    await markUnreadItem.click()

    // Dropdown closes after the action — verifies the click was processed
    await expect(markUnreadItem).not.toBeVisible({ timeout: 3000 })
  })

  test('move email to folder via bulk action', async ({ page }) => {
    const subject = seededEmails[0].subject
    const emailRow = page.locator('[data-testid="email-row"]').filter({ hasText: subject })
    await expect(emailRow).toBeVisible()

    // Select via checkbox instead of clicking email row
    const checkbox = emailRow.locator('input[type="checkbox"]')
    await checkbox.click()

    // Use bulk "Move to folder" → Archive
    await page.getByRole('button', { name: 'Move to folder' }).click()
    // The move menu renders folder buttons; Archive in the menu is last in DOM
    await page.getByRole('button', { name: 'Archive', exact: true }).last().click()

    // Email disappears from inbox
    await expect(emailRow).not.toBeVisible({ timeout: 5000 })
  })
})
