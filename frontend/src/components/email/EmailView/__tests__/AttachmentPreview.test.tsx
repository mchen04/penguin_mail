import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { waitFor } from '@testing-library/react'
import { render, screen } from '@/test/test-utils'
import { AttachmentPreview } from '../AttachmentPreview'

const mockAttachments = [
  {
    id: 'att-1',
    name: 'report.pdf',
    size: 1048576, // 1 MB
    mimeType: 'application/pdf',
    url: '/api/attachments/att-1/download',
  },
]

const imageAttachment = {
  id: 'img-1',
  name: 'photo.png',
  size: 102400,
  mimeType: 'image/png',
  url: '/api/attachments/img-1/download',
}

const pdfAttachment = {
  id: 'pdf-1',
  name: 'document.pdf',
  size: 512000,
  mimeType: 'application/pdf',
  url: '/api/attachments/pdf-1/download',
}

function renderPreview(attachments = mockAttachments) {
  return render(<AttachmentPreview attachments={attachments} />)
}

describe('AttachmentPreview', () => {
  it('shows the attachment name', () => {
    renderPreview()
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
  })

  it('shows the formatted file size', () => {
    renderPreview()
    // 1048576 bytes = 1 MB
    expect(screen.getByText(/1.*MB/i)).toBeInTheDocument()
  })

  it('has a download button', () => {
    renderPreview()
    expect(screen.getByTitle('Download attachment')).toBeInTheDocument()
  })

  it('renders an image thumbnail for image attachments', () => {
    renderPreview([
      {
        id: 'att-2',
        name: 'photo.png',
        size: 204800,
        mimeType: 'image/png',
        url: '/api/attachments/att-2/download',
      },
    ])
    const img = screen.getByAltText('photo.png')
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
  })

  it('returns null when attachments array is empty', () => {
    const { container } = renderPreview([])
    // The component returns null for empty attachments
    expect(container.firstChild).toBeNull()
  })
})

describe('AttachmentPreview - click and download interactions', () => {
  it('shows plural "attachments" when more than one attachment exists (line 107)', () => {
    renderPreview([mockAttachments[0], { ...mockAttachments[0], id: 'att-2', name: 'other.pdf' }])
    expect(screen.getByText(/2 attachments/i)).toBeInTheDocument()
  })

  it('clicking a previewable image attachment opens lightbox (branch 1 arm 0, branch 7 arm 2)', async () => {
    const user = userEvent.setup()
    renderPreview([imageAttachment])

    const item = screen.getByText('photo.png').closest('[data-clickable="true"]') as HTMLElement
    expect(item).toBeTruthy()
    await user.click(item)

    // Lightbox should open
    await waitFor(() => {
      expect(screen.getByTitle('Close preview')).toBeInTheDocument()
    })
  })

  it('clicking a non-previewable attachment does nothing (branch 1 arm 1)', async () => {
    const user = userEvent.setup()
    renderPreview([pdfAttachment])

    const item = screen.getByText('document.pdf').closest('div[data-clickable]') as HTMLElement
    if (item) {
      await user.click(item)
    }
    // No lightbox since PDF is not previewable as image
    expect(screen.queryByTitle('Close preview')).not.toBeInTheDocument()
  })

  it('clicking download button triggers download with url (branch 2)', async () => {
    const user = userEvent.setup()
    renderPreview([pdfAttachment])

    // Mock the link creation AFTER render, before click
    const mockLink = { href: '', download: '', click: vi.fn() }
    const origCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockLink as unknown as HTMLElement
      return origCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockReturnValueOnce(mockLink as unknown as Node)
    vi.spyOn(document.body, 'removeChild').mockReturnValueOnce(mockLink as unknown as Node)

    await user.click(screen.getByTitle('Download attachment'))

    expect(mockLink.click).toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
