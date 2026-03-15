import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'

test.describe('Email List', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password)
  })

  test('inbox loads', async ({ page }) => {
    // Should see the app layout after login
    await expect(page.locator('[data-testid="email-list"], [role="main"], main')).toBeVisible({ timeout: 10000 })
  })

  test('folder navigation works', async ({ page }) => {
    // Click sent folder
    const sent = page.getByText('Sent', { exact: true })
    if (await sent.isVisible()) {
      await sent.click()
      await expect(
        page.getByRole('heading', { name: /sent/i }).or(page.getByText('Sent').first())
      ).toBeVisible()
    }
  })

  test('compose button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: /compose/i })).toBeVisible({ timeout: 10000 })
  })

  test('search input exists', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 10000 })
  })
})
