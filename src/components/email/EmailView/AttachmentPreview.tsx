/**
 * Attachment Preview Component
 * Displays email attachments with previews for images and file icons for other types
 */

import { useState, useCallback } from 'react'
import type { Attachment } from '@/types/email'
import { Icon } from '@/components/common/Icon/Icon'
import styles from './AttachmentPreview.module.css'

interface AttachmentPreviewProps {
  attachments: Attachment[]
}

interface AttachmentItemProps {
  attachment: Attachment
  onPreview: (attachment: Attachment) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string): 'image' | 'attachment' {
  if (mimeType.startsWith('image/')) return 'image'
  return 'attachment'
}

function isPreviewable(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function AttachmentItem({ attachment, onPreview }: AttachmentItemProps) {
  const canPreview = isPreviewable(attachment.mimeType)
  const iconName = getFileIcon(attachment.mimeType)

  const handleClick = useCallback(() => {
    if (canPreview) {
      onPreview(attachment)
    }
  }, [attachment, canPreview, onPreview])

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [attachment])

  return (
    <div
      className={styles.attachmentItem}
      onClick={handleClick}
      data-clickable={canPreview}
    >
      {canPreview && attachment.url ? (
        <div className={styles.thumbnail}>
          <img src={attachment.url} alt={attachment.name} />
        </div>
      ) : (
        <div className={styles.iconWrapper}>
          <Icon name={iconName} size={24} />
        </div>
      )}
      <div className={styles.info}>
        <span className={styles.name} title={attachment.name}>
          {attachment.name}
        </span>
        <span className={styles.size}>
          {formatFileSize(attachment.size)}
        </span>
      </div>
      <button
        className={styles.downloadButton}
        onClick={handleDownload}
        title="Download attachment"
      >
        <Icon name="download" size={16} />
      </button>
    </div>
  )
}

export function AttachmentPreview({ attachments }: AttachmentPreviewProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)

  const handlePreview = useCallback((attachment: Attachment) => {
    setPreviewAttachment(attachment)
  }, [])

  const handleClosePreview = useCallback(() => {
    setPreviewAttachment(null)
  }, [])

  if (attachments.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Icon name="attachment" size={16} />
        <span className={styles.count}>
          {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.list}>
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onPreview={handlePreview}
          />
        ))}
      </div>

      {/* Lightbox preview for images */}
      {previewAttachment && isPreviewable(previewAttachment.mimeType) && (
        <div className={styles.lightbox} onClick={handleClosePreview}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.lightboxClose}
              onClick={handleClosePreview}
              title="Close preview"
            >
              <Icon name="close" size={24} />
            </button>
            <img
              src={previewAttachment.url}
              alt={previewAttachment.name}
              className={styles.lightboxImage}
            />
            <div className={styles.lightboxInfo}>
              <span className={styles.lightboxName}>{previewAttachment.name}</span>
              <span className={styles.lightboxSize}>
                {formatFileSize(previewAttachment.size)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
