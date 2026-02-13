import type { ComposeEmailInput } from '@/types/email'

const DEFAULT_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export async function postEmail(input: ComposeEmailInput) {
  const url = `${DEFAULT_BASE}/api/emails/`
  const body = {
    sender: input.from?.email ?? '',
    to: input.to ?? [],
    cc: input.cc ?? [],
    bcc: input.bcc ?? [],
    subject: input.subject ?? '',
    body: input.body ?? '',
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to post email: ${res.status} ${text}`)
  }

  return res.json()
}
