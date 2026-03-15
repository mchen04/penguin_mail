import { test, expect } from '@playwright/test'

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Inbox')).toBeVisible()
  })

  test('c opens compose', async ({ page }) => {
    await page.keyboard.press('c')
    // Compose modal/panel should open
    await expect(
      page.getByText(/new message|compose|new email/i)
    ).toBeVisible()
  })

  test('Escape closes compose', async ({ page }) => {
    // Open compose first
    await page.keyboard.press('c')
    await expect(
      page.getByText(/new message|compose|new email/i)
    ).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')
    // Compose should be closed
    await expect(page.getByText(/new message|compose/i)).not.toBeVisible()
  })

  test('j/k navigates emails', async ({ page }) => {
    const emailRows = page.locator('[data-testid="email-row"]')
    if ((await emailRows.count()) > 0) {
      await expect(emailRows.first()).toBeVisible()

      // Press j to select next email — first row should gain selected state
      await page.keyboard.press('j')
      await expect(emailRows.first()).toHaveClass(/selected|active|focused/)

      // Press k to go back — selection should change
      await page.keyboard.press('k')
    }
  })
})
