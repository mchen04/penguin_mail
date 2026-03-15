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
