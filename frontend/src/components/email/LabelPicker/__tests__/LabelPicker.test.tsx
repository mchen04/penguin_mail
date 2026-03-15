import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { LabelPicker } from '../LabelPicker'

// LabelPicker uses useLabels() context which may provide empty labels.
// When labels.length === 0, the component returns null.
// We need to mock the context to provide labels.

vi.mock('@/context/OrganizationContext', async () => {
  const actual = await vi.importActual('@/context/OrganizationContext')
  return {
    ...actual,
    useLabels: () => ({
      labels: [
        { id: 'label-1', name: 'Important', color: '#ff0000' },
        { id: 'label-2', name: 'Work', color: '#00ff00' },
        { id: 'label-3', name: 'Personal', color: '#0000ff' },
      ],
      addLabel: vi.fn(),
      updateLabel: vi.fn(),
      deleteLabel: vi.fn(),
      getLabelById: vi.fn(),
      selectLabel: vi.fn(),
      selectedLabelId: null,
    }),
  }
})

const defaultProps = {
  selectedLabelIds: [] as string[],
  onToggleLabel: vi.fn(),
}

function renderPicker(overrides = {}) {
  return render(<LabelPicker {...defaultProps} {...overrides} />)
}

describe('LabelPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Labels trigger button', () => {
    renderPicker()
    expect(screen.getByText('Labels')).toBeInTheDocument()
  })

  it('opens dropdown when trigger is clicked', async () => {
    renderPicker()
    const user = userEvent.setup()

    const trigger = screen.getByTitle('Manage labels')
    await user.click(trigger)

    expect(screen.getByText('Apply labels')).toBeInTheDocument()
  })

  it('shows labels in dropdown', async () => {
    renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByTitle('Manage labels'))

    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('calls onToggleLabel when a label option is clicked', async () => {
    renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByTitle('Manage labels'))

    const menuItems = screen.getAllByRole('menuitemcheckbox')
    await user.click(menuItems[0])

    expect(defaultProps.onToggleLabel).toHaveBeenCalledWith('label-1')
  })

  it('shows checked state for selected labels', async () => {
    renderPicker({ selectedLabelIds: ['label-1'] })
    const user = userEvent.setup()

    await user.click(screen.getByTitle('Manage labels'))

    const menuItems = screen.getAllByRole('menuitemcheckbox')
    expect(menuItems[0]).toHaveAttribute('aria-checked', 'true')
    expect(menuItems[1]).toHaveAttribute('aria-checked', 'false')
  })
})
