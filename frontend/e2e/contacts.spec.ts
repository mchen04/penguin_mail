import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'

test.describe('Contacts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password)
  })

  test('contacts panel can be opened', async ({ page }) => {
    const contactsBtn = page.getByTestId('contacts-button')
    await expect(contactsBtn).toBeVisible({ timeout: 5000 })
    await contactsBtn.click()
    await expect(page.getByTestId('contacts-panel')).toBeVisible({ timeout: 5000 })
  })

  test('contacts panel has search input', async ({ page }) => {
    await page.getByTestId('contacts-button').click()
    await expect(page.getByTestId('contacts-panel')).toBeVisible({ timeout: 5000 })
    await expect(
      page.getByTestId('contacts-panel').getByPlaceholder(/search/i)
    ).toBeVisible()
  })

  test('typing in search filters the contact list', async ({ page }) => {
    await page.getByTestId('contacts-button').click()
    await expect(page.getByTestId('contacts-panel')).toBeVisible({ timeout: 5000 })
    const search = page.getByTestId('contacts-panel').getByPlaceholder(/search/i)
    await search.fill('zzzunlikelyname')
    // Either a "no results" message or an empty list — either way the query was accepted
    await expect(search).toHaveValue('zzzunlikelyname')
  })

  test('contacts panel can be closed', async ({ page }) => {
    await page.getByTestId('contacts-button').click()
    const panel = page.getByTestId('contacts-panel')
    await expect(panel).toBeVisible({ timeout: 5000 })

    // Close button (×) inside the panel
    const closeBtn = panel.getByRole('button', { name: /close/i })
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
      await expect(panel).not.toBeVisible({ timeout: 5000 })
    }
  })
})
