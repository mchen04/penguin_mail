import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { SnoozePicker } from '../SnoozePicker'

const defaultProps = {
  onSnooze: vi.fn(),
  onCancel: vi.fn(),
}

function renderPicker(overrides = {}) {
  return render(<SnoozePicker {...defaultProps} {...overrides} />)
}

describe('SnoozePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the snooze title and preset options', () => {
    renderPicker()
    expect(screen.getByText('Snooze until')).toBeInTheDocument()
    expect(screen.getByText('Later today')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
    expect(screen.getByText('Next week')).toBeInTheDocument()
    expect(screen.getByText('Next month')).toBeInTheDocument()
  })

  it('calls onSnooze with a Date when a preset is clicked', async () => {
    renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByText('Tomorrow'))

    expect(defaultProps.onSnooze).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSnooze.mock.calls[0][0]).toBeInstanceOf(Date)
  })

  it('has a custom date/time option', () => {
    renderPicker()
    expect(screen.getByText('Pick date & time')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByText('Cancel'))

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })
})
