import type { Page, Locator } from '@playwright/test'

/**
 * Page Object for the Compose window.
 * Encapsulates all compose-window locators so spec files stay selector-free.
 */
export class ComposePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ── Locators ──────────────────────────────────────────────────────────────

  get composeButton(): Locator {
    return this.page.getByRole('button', { name: /compose/i })
  }

  get toInput(): Locator {
    return this.page.getByPlaceholder(/email addresses/i)
  }

  get subjectInput(): Locator {
    return this.page.getByPlaceholder(/subject/i)
  }

  get sendButton(): Locator {
    return this.page.getByRole('button', { name: 'Send' })
  }

  get closeButton(): Locator {
    return this.page.getByRole('button', { name: /close/i }).first()
  }

  get minimizeButton(): Locator {
    return this.page.getByRole('button', { name: /minimize/i })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    await this.composeButton.click()
    await this.subjectInput.waitFor({ state: 'visible', timeout: 5000 })
  }

  async fillTo(email: string): Promise<void> {
    await this.toInput.fill(email)
    await this.toInput.press('Enter')
  }

  async fillSubject(subject: string): Promise<void> {
    await this.subjectInput.fill(subject)
  }

  async send(): Promise<void> {
    await this.sendButton.click()
    // Wait for compose to close
    await this.subjectInput.waitFor({ state: 'hidden', timeout: 5000 })
  }

  async close(): Promise<void> {
    await this.closeButton.click()
    await this.subjectInput.waitFor({ state: 'hidden', timeout: 5000 })
  }
}
