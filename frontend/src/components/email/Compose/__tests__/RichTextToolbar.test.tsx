/**
 * Tests for RichTextToolbar - covers formatting buttons and select
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { RichTextToolbar } from '../RichTextToolbar'

// jsdom doesn't implement execCommand — define and spy on it
beforeEach(() => {
  // Define it if not present (jsdom omits it)
  if (!document.execCommand) {
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(true),
      writable: true,
      configurable: true,
    })
  } else {
    vi.spyOn(document, 'execCommand').mockReturnValue(true)
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})

function TestRichTextToolbar() {
  const editorRef = useRef<HTMLDivElement>(null)
  return (
    <div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning data-testid="editor" />
      <RichTextToolbar editorRef={editorRef} />
    </div>
  )
}

describe('RichTextToolbar', () => {
  it('renders all formatting buttons', () => {
    render(<TestRichTextToolbar />)
    // Check buttons via title attribute
    expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument()
    expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument()
    expect(screen.getByTitle('Underline (Ctrl+U)')).toBeInTheDocument()
    expect(screen.getByTitle('Strikethrough')).toBeInTheDocument()
  })

  it('renders list buttons', () => {
    render(<TestRichTextToolbar />)
    expect(screen.getByTitle('Bullet list')).toBeInTheDocument()
    expect(screen.getByTitle('Numbered list')).toBeInTheDocument()
  })

  it('renders alignment buttons', () => {
    render(<TestRichTextToolbar />)
    expect(screen.getByTitle('Align left')).toBeInTheDocument()
    expect(screen.getByTitle('Align center')).toBeInTheDocument()
    expect(screen.getByTitle('Align right')).toBeInTheDocument()
  })

  it('renders link buttons', () => {
    render(<TestRichTextToolbar />)
    expect(screen.getByTitle('Insert link')).toBeInTheDocument()
    expect(screen.getByTitle('Remove link')).toBeInTheDocument()
  })

  it('renders clear formatting button', () => {
    render(<TestRichTextToolbar />)
    expect(screen.getByTitle('Clear formatting')).toBeInTheDocument()
  })

  it('renders format select dropdown', () => {
    render(<TestRichTextToolbar />)
    expect(screen.getByRole('combobox', { name: 'Format' })).toBeInTheDocument()
  })

  it('calls execCommand with bold when Bold button clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Bold (Ctrl+B)'))
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined)
  })

  it('calls execCommand with italic when Italic button clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Italic (Ctrl+I)'))
    expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined)
  })

  it('calls execCommand with underline when Underline button clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Underline (Ctrl+U)'))
    expect(document.execCommand).toHaveBeenCalledWith('underline', false, undefined)
  })

  it('calls execCommand with strikethrough when clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Strikethrough'))
    expect(document.execCommand).toHaveBeenCalledWith('strikethrough', false, undefined)
  })

  it('calls execCommand with insertUnorderedList when Bullet list clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Bullet list'))
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined)
  })

  it('calls execCommand with insertOrderedList when Numbered list clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Numbered list'))
    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false, undefined)
  })

  it('calls execCommand with justifyLeft when Align left clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Align left'))
    expect(document.execCommand).toHaveBeenCalledWith('justifyLeft', false, undefined)
  })

  it('calls execCommand with justifyCenter when Align center clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Align center'))
    expect(document.execCommand).toHaveBeenCalledWith('justifyCenter', false, undefined)
  })

  it('calls execCommand with justifyRight when Align right clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Align right'))
    expect(document.execCommand).toHaveBeenCalledWith('justifyRight', false, undefined)
  })

  it('calls execCommand with unlink when Remove link clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Remove link'))
    expect(document.execCommand).toHaveBeenCalledWith('unlink', false, undefined)
  })

  it('calls execCommand with removeFormat when Clear formatting clicked', async () => {
    const user = userEvent.setup()
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Clear formatting'))
    expect(document.execCommand).toHaveBeenCalledWith('removeFormat', false, undefined)
  })

  it('calls execCommand with formatBlock for paragraph when Paragraph selected', async () => {
    render(<TestRichTextToolbar />)
    const select = screen.getByRole('combobox', { name: 'Format' })

    fireEvent.change(select, { target: { value: 'p' } })
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<p>')
  })

  it('calls execCommand with formatBlock for h1 when Heading 1 selected', async () => {
    render(<TestRichTextToolbar />)
    const select = screen.getByRole('combobox', { name: 'Format' })

    fireEvent.change(select, { target: { value: 'h1' } })
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h1>')
  })

  it('calls execCommand with formatBlock for h2 when Heading 2 selected', async () => {
    render(<TestRichTextToolbar />)
    const select = screen.getByRole('combobox', { name: 'Format' })

    fireEvent.change(select, { target: { value: 'h2' } })
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h2>')
  })

  it('calls execCommand with formatBlock for h3 when Heading 3 selected', async () => {
    render(<TestRichTextToolbar />)
    const select = screen.getByRole('combobox', { name: 'Format' })

    fireEvent.change(select, { target: { value: 'h3' } })
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h3>')
  })

  it('calls prompt and execCommand with createLink when Insert link clicked and URL provided', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'prompt').mockReturnValueOnce('https://example.com')
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Insert link'))
    expect(window.prompt).toHaveBeenCalledWith('Enter URL:')
    expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com')
  })

  it('does not call createLink when prompt is cancelled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'prompt').mockReturnValueOnce(null)
    render(<TestRichTextToolbar />)

    await user.click(screen.getByTitle('Insert link'))
    expect(window.prompt).toHaveBeenCalledWith('Enter URL:')
    expect(document.execCommand).not.toHaveBeenCalledWith('createLink', false, expect.anything())
  })
})
