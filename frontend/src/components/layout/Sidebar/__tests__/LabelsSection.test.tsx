import { render, screen, userEvent } from '@/test/test-utils'
import { LabelsSection } from '../LabelsSection'

describe('LabelsSection', () => {
  it('renders without crashing', () => {
    render(<LabelsSection />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders the Labels section title', () => {
    render(<LabelsSection />)
    expect(screen.getByText('Labels')).toBeInTheDocument()
  })

  it('has a create label button', () => {
    render(<LabelsSection />)
    expect(screen.getByTitle('Create new label')).toBeInTheDocument()
  })

  it('shows create form when create button is clicked', async () => {
    render(<LabelsSection />)
    const user = userEvent.setup()

    await user.click(screen.getByTitle('Create new label'))

    expect(screen.getByPlaceholderText('Label name')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})
