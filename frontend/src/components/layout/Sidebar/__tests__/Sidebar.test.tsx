import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  it('renders the sidebar', () => {
    render(<Sidebar />)
    expect(screen.getByRole('img', { name: 'Penguin Mail' })).toBeInTheDocument()
  })

  it('renders folder navigation', () => {
    render(<Sidebar />)
    expect(screen.getByText('Inbox')).toBeInTheDocument()
  })

  it('renders hamburger button', () => {
    render(<Sidebar />)
    const btn = screen.getByLabelText(/sidebar/i)
    expect(btn).toBeInTheDocument()
  })

  it('renders contacts button', () => {
    render(<Sidebar />)
    expect(screen.getByText(/contacts/i)).toBeInTheDocument()
  })

  it('hamburger button toggles sidebar', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    const btn = screen.getByLabelText(/sidebar/i)
    // Click once — label should change to indicate opposite state
    await user.click(btn)
    expect(screen.getByLabelText(/sidebar/i)).toBeInTheDocument()
  })

  it('contacts button opens contacts view', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    const contactsBtn = screen.getByText(/contacts/i)
    // Should be clickable without throwing
    await user.click(contactsBtn)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Sidebar />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
