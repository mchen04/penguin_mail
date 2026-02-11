import { AppProvider } from '@/context/AppContext'
import { AccountProvider } from '@/context/AccountContext'
import { EmailProvider } from '@/context/EmailContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ContactsProvider } from '@/context/ContactsContext'
import { ToastProvider } from '@/context/ToastContext'
import { RepositoryProvider } from '@/context/RepositoryContext'
import { OrganizationProvider } from '@/context/OrganizationContext'
import { FeaturesProvider } from '@/context/FeaturesContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'
import { ToastContainer } from '@/components/common/Toast/ToastContainer'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { LoginPage } from '@/components/auth/LoginPage'
import { createApiRepositories } from '@/repositories'
import { useMemo } from 'react'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  const apiRepos = useMemo(() => {
    if (!isAuthenticated) return null
    return createApiRepositories()
  }, [isAuthenticated])

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <RepositoryProvider repositories={apiRepos!}>
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
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
