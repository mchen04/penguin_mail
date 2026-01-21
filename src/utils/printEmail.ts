/**
 * Print Email Utility
 * Formats and prints an email in a print-friendly format
 */

import DOMPurify from 'dompurify'
import type { Email } from '@/types/email'
import { formatFullDate } from './formatDate'
import { formatBytes } from './formatBytes'

export function printEmail(email: Email): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const toRecipients = email.to.map((r) => r.name ? `${r.name} <${r.email}>` : r.email).join(', ')
  const ccRecipients = email.cc?.map((r) => r.name ? `${r.name} <${r.email}>` : r.email).join(', ')
  const bccRecipients = email.bcc?.map((r) => r.name ? `${r.name} <${r.email}>` : r.email).join(', ')

  const attachmentList = email.attachments && email.attachments.length > 0
    ? `<div class="attachments">
        <strong>Attachments:</strong>
        <ul>${email.attachments.map((a) => `<li>${a.name} (${formatBytes(a.size)})</li>`).join('')}</ul>
      </div>`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${email.subject} - Print</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #e5e5e5;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .subject {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #1a1a1a;
    }
    .meta {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px 16px;
      font-size: 13px;
    }
    .meta-label {
      color: #666;
      font-weight: 500;
    }
    .meta-value {
      color: #1a1a1a;
    }
    .body {
      padding: 24px 0;
    }
    .body img {
      max-width: 100%;
      height: auto;
    }
    .attachments {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
      font-size: 13px;
    }
    .attachments ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }
    .attachments li {
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    @media print {
      body {
        padding: 0;
      }
      .footer {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="subject">${escapeHtml(email.subject)}</h1>
    <div class="meta">
      <span class="meta-label">From:</span>
      <span class="meta-value">${escapeHtml(email.from.name)} &lt;${escapeHtml(email.from.email)}&gt;</span>

      <span class="meta-label">To:</span>
      <span class="meta-value">${escapeHtml(toRecipients)}</span>

      ${ccRecipients ? `
        <span class="meta-label">Cc:</span>
        <span class="meta-value">${escapeHtml(ccRecipients)}</span>
      ` : ''}

      ${bccRecipients ? `
        <span class="meta-label">Bcc:</span>
        <span class="meta-value">${escapeHtml(bccRecipients)}</span>
      ` : ''}

      <span class="meta-label">Date:</span>
      <span class="meta-value">${formatFullDate(email.date)}</span>
    </div>
  </div>

  <div class="body">
    ${DOMPurify.sanitize(email.body)}
  </div>

  ${attachmentList}

  <div class="footer">
    Printed from Penguin Mail
  </div>

  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() {
        window.close();
      };
    };
  </script>
</body>
</html>
`

  printWindow.document.write(html)
  printWindow.document.close()
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
