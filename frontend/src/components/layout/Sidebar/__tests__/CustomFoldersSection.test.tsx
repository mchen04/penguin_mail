import { vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { CustomFoldersSection } from '../CustomFoldersSection'

// CustomFoldersSection returns null when folders.length === 0 && !isCreating.
// We mock the context to provide folders so the component renders.

vi.mock('@/context/OrganizationContext', async () => {
  const actual = await vi.importActual('@/context/OrganizationContext')
  return {
    ...actual,
    useFolders: () => ({
      folders: [
        { id: 'folder-1', name: 'Projects', color: '#ff0000', parentId: null },
        { id: 'folder-2', name: 'Receipts', color: '#00ff00', parentId: null },
      ],
      addFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      getRootFolders: () => [
        { id: 'folder-1', name: 'Projects', color: '#ff0000', parentId: null },
        { id: 'folder-2', name: 'Receipts', color: '#00ff00', parentId: null },
      ],
    }),
  }
})

describe('CustomFoldersSection', () => {
  it('renders without crashing', () => {
    render(<CustomFoldersSection />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders the Folders section title', () => {
    render(<CustomFoldersSection />)
    expect(screen.getByText('Folders')).toBeInTheDocument()
  })

  it('has a create folder button', () => {
    render(<CustomFoldersSection />)
    expect(screen.getByTitle('Create new folder')).toBeInTheDocument()
  })

  it('renders folder items from context', () => {
    render(<CustomFoldersSection />)
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Receipts')).toBeInTheDocument()
  })
})
