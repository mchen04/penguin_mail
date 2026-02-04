/**
 * Format bytes into human-readable file size
 */

import { BYTES } from '@/constants'

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = BYTES.PER_KB
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
