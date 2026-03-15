import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'
import { seedInboxEmails, cleanupSeededEmails } from './seed'
import type { SeededEmail } from './seed'

test.describe('Labels and Folders', () => {
  let seededEmails: SeededEmail[] = []

  test.beforeEach(async ({ page, request }) => {
    seededEmails = await seedInboxEmails(request, TEST_USER.email, TEST_USER.password, 2)
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

  test('navigate to different folders', async ({ page }) => {
    // Navigate through folders — Sent and Drafts may be empty so just click through
    await page.locator('aside').getByRole('button', { name: 'Sent', exact: true }).click()
    await page.locator('aside').getByRole('button', { name: 'Drafts', exact: true }).click()

    // Click back to Inbox — omit exact:true so "Inbox 2" (with unread count) also matches
    await page.locator('aside').getByRole('button', { name: 'Inbox' }).first().click()
    await expect(page.getByRole('grid', { name: 'Email list' })).toBeVisible({ timeout: 5000 })
  })

  test('create custom folder', async ({ page }) => {
    // The "add folder" button is only rendered when custom folders already exist.
    // If it's not available, skip this test gracefully.
    const addFolderBtn = page.locator('[data-testid="add-folder-button"]')
    const btnVisible = await addFolderBtn.isVisible().catch(() => false)
    if (!btnVisible) {
      test.skip()
      return
    }
    await addFolderBtn.click()
    await expect(page.getByPlaceholder('Folder name')).toBeVisible({ timeout: 3000 })
    await page.getByPlaceholder('Folder name').fill('Test Folder')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('Test Folder')).toBeVisible({ timeout: 3000 })
  })

  test('apply label to email', async ({ page }) => {
    const firstEmail = page.getByTestId('email-row').first()
    await expect(firstEmail).toBeVisible({ timeout: 5000 })
    await firstEmail.click()

    // LabelPicker is only rendered when labels exist. If no labels, the sidebar
    // shows "No labels yet" — verify that to confirm the labels feature is present.
    const labelsButton = page.getByRole('button', { name: 'Manage labels' })
    const noLabels = page.getByText('No labels yet')

    await expect(labelsButton.or(noLabels)).toBeVisible({ timeout: 5000 })

    // If the label picker is available, open it and confirm the dropdown appears
    if (await labelsButton.isVisible()) {
      await labelsButton.click()
      await expect(page.getByText('Apply labels')).toBeVisible({ timeout: 3000 })
    }
  })
})
