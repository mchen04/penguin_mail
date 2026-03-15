import { test, expect } from '@playwright/test'

test.describe('Labels and Folders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Inbox')).toBeVisible()
  })

  test('navigate to different folders', async ({ page }) => {
    // Click on Sent folder and wait for the list to update
    await page.getByText('Sent').click()
    await expect(page.getByRole('grid', { name: 'Email list' })).toBeVisible({ timeout: 3000 })

    // Click on Drafts folder
    await page.getByText('Drafts').click()
    await expect(page.getByRole('grid', { name: 'Email list' })).toBeVisible({ timeout: 3000 })

    // Click back to Inbox
    await page.getByText('Inbox').click()
    await expect(page.getByRole('grid', { name: 'Email list' })).toBeVisible({ timeout: 3000 })
  })

  test('create custom folder', async ({ page }) => {
    const addButton = page.getByTestId('add-folder-button')
    await expect(addButton).toBeVisible({ timeout: 5000 })
    await addButton.click()

    const nameInput = page.getByPlaceholder('Folder name')
    await expect(nameInput).toBeVisible({ timeout: 3000 })
    await nameInput.fill('Test Folder')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('Test Folder')).toBeVisible({ timeout: 3000 })
  })

  test('apply label to email', async ({ page }) => {
    const firstEmail = page.getByTestId('email-row').first()
    await expect(firstEmail).toBeVisible({ timeout: 5000 })
    await firstEmail.click()

    const labelButton = page.getByRole('button', { name: /label/i })
    await expect(labelButton).toBeVisible({ timeout: 3000 })
    await labelButton.click()
    // Label dropdown or dialog must appear
    await expect(
      page.getByRole('menu')
        .or(page.getByRole('dialog'))
        .or(page.getByRole('listbox'))
    ).toBeVisible({ timeout: 3000 })
  })
})
