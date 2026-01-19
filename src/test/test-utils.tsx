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

// Wrapper that provides all context providers in the correct order
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <RepositoryProvider>
        <SettingsProvider>
          <AppProvider>
            <AccountProvider>
              <ContactsProvider>
                <OrganizationProvider>
                  <EmailProvider>
                    {children}
                  </EmailProvider>
                </OrganizationProvider>
              </ContactsProvider>
            </AccountProvider>
          </AppProvider>
        </SettingsProvider>
      </RepositoryProvider>
    </ToastProvider>
  )
}

// Custom render function that wraps components with all providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Export custom render as the default render
export { customRender as render }
// Also export the wrapper for direct use
export { AllProviders }
