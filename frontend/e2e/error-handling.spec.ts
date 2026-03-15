import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'

test.describe('Error Handling', () => {
  test('shows error state when API is down', async ({ page }) => {
    // Block API requests to simulate downtime
    await page.route('**/api/**', (route) => {
      route.abort('connectionrefused')
    })

    await page.goto('/')

    // App should still render without crashing — login page or error UI visible
    await expect(
      page.getByRole('alert').or(page.getByText(/error|unavailable|unable to connect/i)).or(page.getByLabel('Email'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('handles session expiry gracefully', async ({ page }) => {
    await page.goto('/')

    // Simulate 401 responses on all API calls
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ detail: 'Unauthorized' }),
      })
    })

    // Reload to trigger API calls with 401 — should redirect to login
    await page.reload()

    await expect(page.getByLabel('Email')).toBeVisible({ timeout: 5000 })
  })

  test('handles network timeout', async ({ page }) => {
    // Login first so we can see the inbox
    await loginAs(page, TEST_USER.email, TEST_USER.password)
    await expect(page.getByText('Inbox').first()).toBeVisible()

    // Simulate slow responses for subsequent calls
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      route.abort('timedout')
    })

    // Try an action - should not crash the app
    const searchInput = page
      .locator('[data-search-input]')
      .or(page.getByPlaceholder(/search/i))
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await searchInput.press('Enter')
    }

    // App should still be functional — Inbox heading still visible
    await expect(page.getByText('Inbox').first()).toBeVisible()
  })
})
