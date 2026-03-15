/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { EmailProvider } from '@/context/EmailContext'
import { AccountProvider } from '@/context/AccountContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ContactsProvider } from '@/context/ContactsContext'
import { OrganizationProvider } from '@/context/OrganizationContext'
import { RepositoryProvider } from '@/context/RepositoryContext'
import { ToastProvider } from '@/context/ToastContext'
import { FeaturesProvider } from '@/context/FeaturesContext'
import { createMockRepositories } from './mock-repositories'
import type { IRepositories } from '@/repositories/types'

// Wrapper that provides all context providers in the correct order
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <RepositoryProvider repositories={createMockRepositories()}>
        <SettingsProvider>
          <AppProvider>
            <AccountProvider>
              <ContactsProvider>
                <OrganizationProvider>
                  <FeaturesProvider>
                    <EmailProvider>
                      {children}
                    </EmailProvider>
                  </FeaturesProvider>
                </OrganizationProvider>
              </ContactsProvider>
            </AccountProvider>
          </AppProvider>
        </SettingsProvider>
      </RepositoryProvider>
    </ToastProvider>
  )
}

// Custom render function that wraps components with all providers.
// Pass `repos` to inject custom mock repositories (e.g. to seed specific emails or accounts).
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { repos?: IRepositories }
) {
  const { repos, ...renderOptions } = options ?? {}
  const wrapper = repos ? createWrapper(repos) : AllProviders
  return render(ui, { wrapper, ...renderOptions })
}

/**
 * Creates a wrapper component that injects the given repositories (or fresh mocks
 * if none provided). Use this in renderHook calls that need custom mock repos.
 */
export function createWrapper(repos?: IRepositories) {
  const mockRepos = repos ?? createMockRepositories()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ToastProvider>
        <RepositoryProvider repositories={mockRepos}>
          <SettingsProvider>
            <AppProvider>
              <AccountProvider>
                <ContactsProvider>
                  <OrganizationProvider>
                    <FeaturesProvider>
                      <EmailProvider>{children}</EmailProvider>
                    </FeaturesProvider>
                  </OrganizationProvider>
                </ContactsProvider>
              </AccountProvider>
            </AppProvider>
          </SettingsProvider>
        </RepositoryProvider>
      </ToastProvider>
    )
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Export custom render as the default render
export { customRender as render }
// Also export the wrapper for direct use
export { AllProviders }
