import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { RecipientField } from '../RecipientField'

const defaultProps = {
  label: 'To',
  recipients: [] as string[],
  onChange: vi.fn(),
  placeholder: 'Enter email addresses',
}

function renderField(overrides = {}) {
  return render(<RecipientField {...defaultProps} {...overrides} />)
}

describe('RecipientField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the label', () => {
    renderField()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('renders initial recipients as chips', () => {
    renderField({
      recipients: ['alice@example.com', 'bob@example.com'],
    })
    expect(screen.getByText(/alice@example\.com/)).toBeInTheDocument()
    expect(screen.getByText(/bob@example\.com/)).toBeInTheDocument()
  })

  it('adds a recipient when pressing Enter with valid email', async () => {
    const onChange = vi.fn()
    renderField({ onChange })
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.type(input, 'charlie@example.com{Enter}')

    expect(onChange).toHaveBeenCalledWith(['charlie@example.com'])
  })

  it('removes a recipient when clicking the remove button on a chip', async () => {
    const onChange = vi.fn()
    renderField({
      recipients: ['alice@example.com'],
      onChange,
    })
    const user = userEvent.setup()

    const removeBtn = screen.getByRole('button', { name: /remove alice@example\.com/i })
    await user.click(removeBtn)

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('does not add recipient for invalid email format', async () => {
    const onChange = vi.fn()
    renderField({ onChange })
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.type(input, 'not-an-email{Enter}')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does nothing when pressing Enter with empty input', async () => {
    const onChange = vi.fn()
    renderField({ onChange })
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Enter}')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the placeholder text when there are no recipients', () => {
    renderField()
    expect(screen.getByPlaceholderText('Enter email addresses')).toBeInTheDocument()
  })

  it('handles comma-separated emails by adding valid ones', async () => {
    const onChange = vi.fn()
    renderField({ onChange })
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    // The comma key triggers addRecipient() via handleKeyDown
    // which reads from the current inputValue state
    await user.type(input, 'b@example.com')
    await user.keyboard(',')

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall).toContain('b@example.com')
  })
})
