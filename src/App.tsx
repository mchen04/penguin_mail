import { AppProvider } from '@/context/AppContext'
import { AccountProvider } from '@/context/AccountContext'
import { EmailProvider } from '@/context/EmailContext'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'

function App() {
  return (
    <AppProvider>
      <AccountProvider>
        <EmailProvider>
          <AppLayout />
        </EmailProvider>
      </AccountProvider>
    </AppProvider>
  )
}

export default App
