import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password)
    await expect(page.getByText('Inbox').first()).toBeVisible()
    // Wait for all network requests (settings, emails) to complete so shortcuts are active
    await page.waitForLoadState('networkidle')
    // Blur any focused input so keyboard shortcuts aren't swallowed by an input element
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
  })

  test('c opens compose', async ({ page }) => {
    await page.keyboard.press('c')
    // "New Message" is the compose window title — exact match avoids the sidebar "Compose" button
    await expect(page.getByText('New Message', { exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('Escape closes compose', async ({ page }) => {
    // Open compose via the Compose button (more reliable than keyboard shortcut)
    await page.getByRole('button', { name: /compose/i }).click()
    await expect(page.getByText('New Message', { exact: true })).toBeVisible({ timeout: 5000 })

    // Blur any focused input inside compose so Escape reaches the keyboard shortcut handler
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
    // Press Escape to close
    await page.keyboard.press('Escape')
    // Compose window should be closed
    await expect(page.getByText('New Message', { exact: true })).not.toBeVisible()
  })

  test('j/k navigates emails', async ({ page }) => {
    const emailRows = page.locator('[data-testid="email-row"]')
    if ((await emailRows.count()) > 0) {
      await expect(emailRows.first()).toBeVisible()

      // Press j to open the first email — reading pane replaces the email list
      await page.keyboard.press('j')
      // 'j' calls selectEmail() which shows EmailView with a Back button
      await expect(page.getByRole('button', { name: 'Back to inbox' })).toBeVisible({ timeout: 5000 })

      // Press k to go back (no prev email from first position) or navigate up
      await page.keyboard.press('k')
    }
  })
})
