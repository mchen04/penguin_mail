/**
 * Extended tests for CustomFoldersSection covering create, edit, delete, and expand/collapse
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { CustomFoldersSection } from '../CustomFoldersSection'

const mockAddFolder = vi.fn()
const mockUpdateFolder = vi.fn()
const mockDeleteFolder = vi.fn()

const FOLDERS = [
  { id: 'f1', name: 'Work', color: '#3b82f6', parentId: null },
  { id: 'f2', name: 'Personal', color: '#22c55e', parentId: null },
]

vi.mock('@/context/OrganizationContext', async () => {
  const actual = await vi.importActual('@/context/OrganizationContext')
  return {
    ...actual,
    useFolders: () => ({
      folders: FOLDERS,
      addFolder: mockAddFolder,
      updateFolder: mockUpdateFolder,
      deleteFolder: mockDeleteFolder,
      getRootFolders: () => FOLDERS,
    }),
  }
})

describe('CustomFoldersSection - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders folder items', () => {
    render(<CustomFoldersSection />)
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('shows create form when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByTitle('Create new folder'))
    expect(screen.getByPlaceholderText('Folder name')).toBeInTheDocument()
  })

  it('cancels create form when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByTitle('Create new folder'))
    expect(screen.getByPlaceholderText('Folder name')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByPlaceholderText('Folder name')).not.toBeInTheDocument()
  })

  it('cancels create form with Escape key', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByTitle('Create new folder'))
    const input = screen.getByPlaceholderText('Folder name')
    await user.type(input, 'Test{Escape}')

    expect(screen.queryByPlaceholderText('Folder name')).not.toBeInTheDocument()
  })

  it('calls addFolder when folder name is entered and Enter pressed', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByTitle('Create new folder'))
    const input = screen.getByPlaceholderText('Folder name')
    await user.type(input, 'NewFolder{Enter}')

    await waitFor(() => {
      expect(mockAddFolder).toHaveBeenCalledWith('NewFolder', expect.any(String))
    })
  })

  it('calls addFolder when Create button is clicked', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByTitle('Create new folder'))
    const input = screen.getByPlaceholderText('Folder name')
    await user.type(input, 'TestFolder')

    await user.click(screen.getByRole('button', { name: /^create$/i }))

    await waitFor(() => {
      expect(mockAddFolder).toHaveBeenCalledWith('TestFolder', expect.any(String))
    })
  })

  it('Create button is disabled when name is empty', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByTitle('Create new folder'))

    const createBtn = screen.getByRole('button', { name: /^create$/i })
    expect(createBtn).toBeDisabled()
  })

  it('shows edit form when Edit folder button is clicked', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    const editBtns = screen.getAllByTitle('Edit folder')
    await user.click(editBtns[0])

    await waitFor(() => {
      expect(screen.getByDisplayValue('Work')).toBeInTheDocument()
    })
  })

  it('cancels edit form when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    const editBtns = screen.getAllByTitle('Edit folder')
    await user.click(editBtns[0])

    await waitFor(() => expect(screen.getByDisplayValue('Work')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Work')).not.toBeInTheDocument()
    })
  })

  it('saves edit when Enter is pressed in edit input', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    const editBtns = screen.getAllByTitle('Edit folder')
    await user.click(editBtns[0])

    await waitFor(() => expect(screen.getByDisplayValue('Work')).toBeInTheDocument())

    const input = screen.getByDisplayValue('Work')
    await user.clear(input)
    await user.type(input, 'Updated Work{Enter}')

    await waitFor(() => {
      expect(mockUpdateFolder).toHaveBeenCalledWith('f1', expect.objectContaining({ name: 'Updated Work' }))
    })
  })

  it('collapses folders when header button is clicked', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    expect(screen.getByText('Work')).toBeInTheDocument()

    // Click the expand button (the one with the Folders text)
    await user.click(screen.getByText('Folders'))

    await waitFor(() => {
      expect(screen.queryByText('Work')).not.toBeInTheDocument()
    })
  })

  it('expands folders again when header is clicked twice', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByText('Folders'))
    await waitFor(() => expect(screen.queryByText('Work')).not.toBeInTheDocument())

    await user.click(screen.getByText('Folders'))
    await waitFor(() => expect(screen.getByText('Work')).toBeInTheDocument())
  })

  it('shows color picker in create form', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    await user.click(screen.getByTitle('Create new folder'))

    const colorButtons = screen.getAllByRole('button', { name: /select color/i })
    expect(colorButtons.length).toBeGreaterThan(0)
  })

  it('shows Delete button in edit form', async () => {
    const user = userEvent.setup()
    render(<CustomFoldersSection />)

    const editBtns = screen.getAllByTitle('Edit folder')
    await user.click(editBtns[0])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })
})
