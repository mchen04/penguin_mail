import { AppProvider } from '@/context/AppContext'
import { AccountProvider } from '@/context/AccountContext'
import { EmailProvider } from '@/context/EmailContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ContactsProvider } from '@/context/ContactsContext'
import { ToastProvider } from '@/context/ToastContext'
import { RepositoryProvider } from '@/context/RepositoryContext'
import { OrganizationProvider } from '@/context/OrganizationContext'
import { FeaturesProvider } from '@/context/FeaturesContext'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'
import { ToastContainer } from '@/components/common/Toast/ToastContainer'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <RepositoryProvider>
          <SettingsProvider>
            <AppProvider>
              <AccountProvider>
                <ContactsProvider>
                  <OrganizationProvider>
                    <EmailProvider>
                      <FeaturesProvider>
                        <AppLayout />
                        <ToastContainer />
                      </FeaturesProvider>
                    </EmailProvider>
                  </OrganizationProvider>
                </ContactsProvider>
              </AccountProvider>
            </AppProvider>
          </SettingsProvider>
        </RepositoryProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
