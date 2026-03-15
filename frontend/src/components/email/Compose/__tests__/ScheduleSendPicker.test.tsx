import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { ScheduleSendPicker } from '../ScheduleSendPicker'

const defaultProps = {
  onSchedule: vi.fn(),
  onCancel: vi.fn(),
}

function renderPicker(overrides = {}) {
  return render(<ScheduleSendPicker {...defaultProps} {...overrides} />)
}

describe('ScheduleSendPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the schedule send title and preset times', () => {
    renderPicker()
    expect(screen.getByText('Schedule send')).toBeInTheDocument()
    expect(screen.getByText('Later today')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow morning')).toBeInTheDocument()
    expect(screen.getByText('Monday morning')).toBeInTheDocument()
  })

  it('calls onSchedule with a Date when a preset is selected', async () => {
    renderPicker()
    const user = userEvent.setup()

    await user.click(screen.getByText('Tomorrow morning'))

    expect(defaultProps.onSchedule).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSchedule.mock.calls[0][0]).toBeInstanceOf(Date)
  })

  it('has a custom date/time picker option', () => {
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
