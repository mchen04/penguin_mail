import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import styles from './EmailBody.module.css'

interface EmailBodyProps {
  html: string
}

export function EmailBody({ html }: EmailBodyProps) {
  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(html), [html])

  return (
    <article className={styles.body} aria-label="Email content">
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </article>
  )
}
