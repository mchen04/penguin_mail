import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'

test.describe('Authentication', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Penguin Mail')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('successful login redirects to inbox', async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password)
    // After login, the sidebar navigation and Compose button are visible
    await expect(page.getByRole('navigation')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /compose/i })).toBeVisible({ timeout: 10000 })
  })

  test('failed login shows error', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    // Should show an error alert or remain on login page with error message
    await expect(
      page.getByRole('alert').or(page.getByText(/invalid.*credentials|wrong.*password|incorrect/i))
    ).toBeVisible({ timeout: 5000 })
  })

  test('login button disabled when fields empty', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })

  test('redirect to login when unauthenticated', async ({ page }) => {
    // Clear any stored tokens
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await expect(page.getByLabel('Email')).toBeVisible()
  })
})
