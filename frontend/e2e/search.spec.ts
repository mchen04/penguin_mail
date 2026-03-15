import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './fixtures'
import { seedInboxEmails, cleanupSeededEmails } from './seed'
import type { SeededEmail } from './seed'

test.describe('Search', () => {
  let seededEmails: SeededEmail[] = []

  test.beforeEach(async ({ page, request }) => {
    // Seed 3 known emails so searches have predictable content to match against
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
        seededEmails.map(e => e.id)
      )
      seededEmails = []
    }
  })

  test('text search returns rows whose subject matches the query', async ({ page }) => {
    // Use the unique subject fragment of the first seeded email as the search term
    const uniqueFragment = seededEmails[0].subject.split(' ').slice(0, 3).join(' ')

    const searchInput = page.getByTestId('search-input')
    await expect(searchInput).toBeVisible({ timeout: 5000 })
    await searchInput.fill(uniqueFragment)
    await searchInput.press('Enter')

    // The matching email row should be visible
    await expect(page.getByText(seededEmails[0].subject)).toBeVisible({ timeout: 5000 })
    // The other seeded emails (different subjects) should not appear
    await expect(page.getByText(seededEmails[1].subject)).not.toBeVisible()
  })

  test('advanced search opens filter panel with From field', async ({ page }) => {
    const advancedToggle = page.getByTestId('advanced-search-toggle')
    await expect(advancedToggle).toBeVisible({ timeout: 5000 })
    await advancedToggle.click()
    // From input appears in the filter panel
    await expect(page.getByLabel(/^from$/i)).toBeVisible({ timeout: 5000 })
  })

  test('clear search restores full email list', async ({ page }) => {
    const searchInput = page.getByTestId('search-input')
    await expect(searchInput).toBeVisible({ timeout: 5000 })

    // Search for something unlikely to match any seeded email
    await searchInput.fill('zzzunlikelymatchxxx')
    await searchInput.press('Enter')
    // Expect no rows or empty state
    await expect(
      page.getByText(/no results/i).or(page.getByTestId('email-row').first())
    ).toBeVisible({ timeout: 5000 })

    // Clear search — all seeded emails should reappear
    await searchInput.clear()
    await searchInput.press('Enter')
    await expect(searchInput).toHaveValue('')
    await expect(page.getByText(seededEmails[0].subject)).toBeVisible({ timeout: 5000 })
  })
})
