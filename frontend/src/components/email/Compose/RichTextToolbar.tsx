/**
 * Rich Text Toolbar Component
 * Provides formatting options for the compose body
 */

import { useCallback } from 'react'
import { Icon } from '@/components/common/Icon/Icon'
import { ICON_SIZE } from '@/constants'
import styles from './RichTextToolbar.module.css'

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>
}

type FormatCommand = 'bold' | 'italic' | 'underline' | 'strikethrough' |
  'insertUnorderedList' | 'insertOrderedList' |
  'justifyLeft' | 'justifyCenter' | 'justifyRight' |
  'createLink' | 'unlink' |
  'formatBlock' | 'removeFormat'

export function RichTextToolbar({ editorRef }: RichTextToolbarProps) {

  const execCommand = useCallback((command: FormatCommand, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }, [editorRef])

  const handleBold = useCallback(() => execCommand('bold'), [execCommand])
  const handleItalic = useCallback(() => execCommand('italic'), [execCommand])
  const handleUnderline = useCallback(() => execCommand('underline'), [execCommand])
  const handleStrikethrough = useCallback(() => execCommand('strikethrough'), [execCommand])

  const handleBulletList = useCallback(() => execCommand('insertUnorderedList'), [execCommand])
  const handleNumberedList = useCallback(() => execCommand('insertOrderedList'), [execCommand])

  const handleAlignLeft = useCallback(() => execCommand('justifyLeft'), [execCommand])
  const handleAlignCenter = useCallback(() => execCommand('justifyCenter'), [execCommand])
  const handleAlignRight = useCallback(() => execCommand('justifyRight'), [execCommand])

  const handleLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }, [execCommand])

  const handleUnlink = useCallback(() => execCommand('unlink'), [execCommand])
  const handleClearFormatting = useCallback(() => execCommand('removeFormat'), [execCommand])

  const handleHeading = useCallback((level: 1 | 2 | 3) => {
    execCommand('formatBlock', `<h${level}>`)
  }, [execCommand])

  const handleParagraph = useCallback(() => {
    execCommand('formatBlock', '<p>')
  }, [execCommand])

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <button
          type="button"
          className={styles.button}
          onClick={handleBold}
          title="Bold (Ctrl+B)"
        >
          <Icon name="bold" size={ICON_SIZE.SMALL} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleItalic}
          title="Italic (Ctrl+I)"
        >
          <Icon name="italic" size={ICON_SIZE.SMALL} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleUnderline}
          title="Underline (Ctrl+U)"
        >
          <Icon name="underline" size={ICON_SIZE.SMALL} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleStrikethrough}
          title="Strikethrough"
        >
          <Icon name="strikethrough" size={ICON_SIZE.SMALL} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={styles.button}
          onClick={handleBulletList}
          title="Bullet list"
        >
          <Icon name="list" size={ICON_SIZE.SMALL} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleNumberedList}
          title="Numbered list"
        >
          <Icon name="listOrdered" size={ICON_SIZE.SMALL} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={styles.button}
          onClick={handleAlignLeft}
          title="Align left"
        >
          <Icon name="alignLeft" size={ICON_SIZE.SMALL} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleAlignCenter}
          title="Align center"
        >
          <Icon name="alignCenter" size={ICON_SIZE.SMALL} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleAlignRight}
          title="Align right"
        >
          <Icon name="alignRight" size={ICON_SIZE.SMALL} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={styles.button}
          onClick={handleLink}
          title="Insert link"
        >
          <Icon name="link" size={ICON_SIZE.SMALL} />
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleUnlink}
          title="Remove link"
        >
          <Icon name="unlink" size={ICON_SIZE.SMALL} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <select
          className={styles.formatSelect}
          onChange={(e) => {
            const value = e.target.value
            if (value === 'p') handleParagraph()
            else if (value === 'h1') handleHeading(1)
            else if (value === 'h2') handleHeading(2)
            else if (value === 'h3') handleHeading(3)
            e.target.value = ''
          }}
          title="Format"
        >
          <option value="">Format</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </div>

      <div className={styles.group}>
        <button
          type="button"
          className={styles.button}
          onClick={handleClearFormatting}
          title="Clear formatting"
        >
          <Icon name="formatClear" size={ICON_SIZE.SMALL} />
        </button>
      </div>
    </div>
  )
}
