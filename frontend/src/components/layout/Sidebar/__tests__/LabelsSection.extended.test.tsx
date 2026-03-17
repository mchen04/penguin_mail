/**
 * Extended tests for LabelsSection - covers label display, editing, deletion, and expand/collapse
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { LabelsSection } from '../LabelsSection'
import { createMockRepositories } from '@/test/mock-repositories'

function makeReposWithLabels() {
  const repos = createMockRepositories()
  repos.labels.getAll = vi.fn().mockResolvedValue([
    { id: 'l1', name: 'Work', color: '#3b82f6' },
    { id: 'l2', name: 'Personal', color: '#22c55e' },
  ])
  return repos
}

describe('LabelsSection - Extended coverage', () => {
  it('shows empty state when no labels exist', () => {
    render(<LabelsSection />)
    expect(screen.getByText('No labels yet')).toBeInTheDocument()
  })

  it('renders existing labels', async () => {
    const repos = makeReposWithLabels()
    render(<LabelsSection />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })
  })

  it('collapses and expands the section when header is clicked', async () => {
    const user = userEvent.setup()
    const repos = makeReposWithLabels()
    render(<LabelsSection />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
    })

    // Click expand button to collapse
    const expandBtn = screen.getByRole('button', { name: /labels/i })
    await user.click(expandBtn)

    // Labels should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Work')).not.toBeInTheDocument()
    })

    // Click again to expand
    await user.click(expandBtn)

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
    })
  })

  it('shows create form when + button is clicked', async () => {
    const user = userEvent.setup()
    render(<LabelsSection />)

    await user.click(screen.getByTitle('Create new label'))
    expect(screen.getByPlaceholderText('Label name')).toBeInTheDocument()
  })

  it('cancels create form when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<LabelsSection />)

    await user.click(screen.getByTitle('Create new label'))
    expect(screen.getByPlaceholderText('Label name')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByPlaceholderText('Label name')).not.toBeInTheDocument()
  })

  it('cancels create form with Escape key', async () => {
    const user = userEvent.setup()
    render(<LabelsSection />)

    await user.click(screen.getByTitle('Create new label'))
    expect(screen.getByPlaceholderText('Label name')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Label name')
    await user.type(input, 'Test{Escape}')

    expect(screen.queryByPlaceholderText('Label name')).not.toBeInTheDocument()
  })

  it('creates label when Enter is pressed in input', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.labels.create = vi.fn().mockResolvedValue({
      success: true as const,
      data: { id: 'new-l', name: 'NewLabel', color: '#3b82f6' },
    })
    render(<LabelsSection />, { repos })

    await user.click(screen.getByTitle('Create new label'))
    const input = screen.getByPlaceholderText('Label name')
    await user.type(input, 'NewLabel{Enter}')

    await waitFor(() => {
      expect(repos.labels.create).toHaveBeenCalledWith('NewLabel', expect.any(String))
    })
  })

  it('shows edit form when Edit button is clicked on a label', async () => {
    const user = userEvent.setup()
    const repos = makeReposWithLabels()
    render(<LabelsSection />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
    })

    const editBtns = screen.getAllByTitle('Edit label')
    await user.click(editBtns[0])

    // Edit form should appear with input
    await waitFor(() => {
      expect(screen.getByDisplayValue('Work')).toBeInTheDocument()
    })
  })

  it('saves edit when Enter is pressed in edit form', async () => {
    const user = userEvent.setup()
    const repos = makeReposWithLabels()
    render(<LabelsSection />, { repos })

    await waitFor(() => expect(screen.getByText('Work')).toBeInTheDocument())

    const editBtns = screen.getAllByTitle('Edit label')
    await user.click(editBtns[0])

    await waitFor(() => expect(screen.getByDisplayValue('Work')).toBeInTheDocument())

    const input = screen.getByDisplayValue('Work')
    await user.clear(input)
    await user.type(input, 'Updated{Enter}')

    await waitFor(() => {
      expect(repos.labels.update).toHaveBeenCalledWith('l1', expect.objectContaining({ name: 'Updated' }))
    })
  })

  it('cancels edit when Cancel is clicked in edit form', async () => {
    const user = userEvent.setup()
    const repos = makeReposWithLabels()
    render(<LabelsSection />, { repos })

    await waitFor(() => expect(screen.getByText('Work')).toBeInTheDocument())

    const editBtns = screen.getAllByTitle('Edit label')
    await user.click(editBtns[0])

    await waitFor(() => expect(screen.getByDisplayValue('Work')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Work')).not.toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
    })
  })

  it('saves edit when Save is clicked in edit form', async () => {
    const user = userEvent.setup()
    const repos = makeReposWithLabels()
    render(<LabelsSection />, { repos })

    await waitFor(() => expect(screen.getByText('Work')).toBeInTheDocument())

    const editBtns = screen.getAllByTitle('Edit label')
    await user.click(editBtns[0])

    await waitFor(() => expect(screen.getByDisplayValue('Work')).toBeInTheDocument())

    // Click Save button in edit form
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(repos.labels.update).toHaveBeenCalled()
    })
  })

  it('deletes label when Delete is clicked in edit form', async () => {
    const user = userEvent.setup()
    const repos = makeReposWithLabels()
    render(<LabelsSection />, { repos })

    await waitFor(() => expect(screen.getByText('Work')).toBeInTheDocument())

    const editBtns = screen.getAllByTitle('Edit label')
    await user.click(editBtns[0])

    await waitFor(() => expect(screen.getByDisplayValue('Work')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => {
      expect(repos.labels.delete).toHaveBeenCalledWith('l1')
    })
  })

  it('shows color options in create form', async () => {
    const user = userEvent.setup()
    render(<LabelsSection />)

    await user.click(screen.getByTitle('Create new label'))

    const colorButtons = screen.getAllByRole('button', { name: /select color/i })
    expect(colorButtons.length).toBeGreaterThan(0)
  })

  it('creates label when Create button is clicked', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.labels.create = vi.fn().mockResolvedValue({
      success: true as const,
      data: { id: 'new-l', name: 'MyLabel', color: '#3b82f6' },
    })
    render(<LabelsSection />, { repos })

    await user.click(screen.getByTitle('Create new label'))
    const input = screen.getByPlaceholderText('Label name')
    await user.type(input, 'MyLabel')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    await waitFor(() => {
      expect(repos.labels.create).toHaveBeenCalledWith('MyLabel', expect.any(String))
    })
  })
})
