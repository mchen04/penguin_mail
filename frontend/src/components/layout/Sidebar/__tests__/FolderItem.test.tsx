import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { FolderItem } from '../FolderItem'

const defaultProps = {
  folder: 'inbox' as const,
  count: 5,
  isSelected: false,
  onClick: vi.fn(),
}

function renderItem(overrides = {}) {
  return render(<FolderItem {...defaultProps} {...overrides} />)
}

describe('FolderItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the folder name', () => {
    renderItem()
    expect(screen.getByText('Inbox')).toBeInTheDocument()
  })

  it('shows the unread count when count is greater than 0 for inbox', () => {
    renderItem({ folder: 'inbox', count: 12 })
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('does not show count for non-inbox/drafts folders', () => {
    renderItem({ folder: 'sent', count: 5 })
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    renderItem()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button'))

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })
})
