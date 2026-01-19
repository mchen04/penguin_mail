import { AppProvider } from '@/context/AppContext'
import { AccountProvider } from '@/context/AccountContext'
import { EmailProvider } from '@/context/EmailContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ContactsProvider } from '@/context/ContactsContext'
import { ToastProvider } from '@/context/ToastContext'
import { RepositoryProvider } from '@/context/RepositoryContext'
import { LabelsProvider } from '@/context/LabelsContext'
import { FoldersProvider } from '@/context/FoldersContext'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'
import { ToastContainer } from '@/components/common/Toast/ToastContainer'

function App() {
  return (
    <ToastProvider>
      <RepositoryProvider>
        <SettingsProvider>
          <AppProvider>
            <AccountProvider>
              <ContactsProvider>
                <LabelsProvider>
                  <FoldersProvider>
                    <EmailProvider>
                      <AppLayout />
                      <ToastContainer />
                    </EmailProvider>
                  </FoldersProvider>
                </LabelsProvider>
              </ContactsProvider>
            </AccountProvider>
          </AppProvider>
        </SettingsProvider>
      </RepositoryProvider>
    </ToastProvider>
  )
}

export default App
