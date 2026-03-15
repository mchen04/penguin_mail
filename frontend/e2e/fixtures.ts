import { test as base, type Page } from '@playwright/test'

/**
 * Login helper — navigates to the app and logs in with given credentials.
 * Assumes the backend is running with the test superuser seeded.
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 })
}

/**
 * Default test credentials — override via PLAYWRIGHT_USER_EMAIL / PLAYWRIGHT_USER_PASSWORD
 * env vars so CI can parameterize without touching source code.
 */
export const TEST_USER = {
  email: process.env.PLAYWRIGHT_USER_EMAIL ?? 'admin@penguinmail.com',
  password: process.env.PLAYWRIGHT_USER_PASSWORD ?? 'admin',
}

/**
 * Extended test fixture that provides a pre-authenticated page.
 * Use this instead of calling loginAs in beforeEach to reuse auth state.
 */
export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, provide) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password)
    await provide(page)
  },
})

export { expect } from '@playwright/test'
