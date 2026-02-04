import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import styles from './EmailBody.module.css'

interface EmailBodyProps {
  html: string
}

export function EmailBody({ html }: EmailBodyProps) {
  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(html), [html])

  return (
    <div className={styles.body}>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  )
}
