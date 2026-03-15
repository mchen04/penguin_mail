import type { Page, Locator } from '@playwright/test'

/**
 * Page Object for the Inbox / email list view.
 * Encapsulates selectors for the email list, folder navigation, and toolbar actions.
 */
export class InboxPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ── Locators ──────────────────────────────────────────────────────────────

  get emailRows(): Locator {
    return this.page.locator('[data-testid="email-row"]')
  }

  firstEmailRow(): Locator {
    return this.emailRows.first()
  }

  emailRowBySubject(subject: string): Locator {
    return this.page.getByText(subject)
  }

  get searchInput(): Locator {
    return this.page.getByTestId('search-input')
  }

  get advancedSearchToggle(): Locator {
    return this.page.getByTestId('advanced-search-toggle')
  }

  folderLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(`^${name}$`, 'i') })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async navigateToFolder(folder: string): Promise<void> {
    await this.folderLink(folder).click()
  }

  async openFirstEmail(): Promise<void> {
    await this.firstEmailRow().click()
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query)
    await this.searchInput.press('Enter')
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear()
    await this.searchInput.press('Enter')
  }

  async clickToolbarAction(name: string | RegExp): Promise<void> {
    await this.page.getByRole('button', { name }).click()
  }

  async waitForEmailVisible(subject: string, timeout = 5000): Promise<void> {
    await this.emailRowBySubject(subject).waitFor({ state: 'visible', timeout })
  }

  async waitForEmailGone(subject: string, timeout = 5000): Promise<void> {
    await this.emailRowBySubject(subject).waitFor({ state: 'hidden', timeout })
  }
}
