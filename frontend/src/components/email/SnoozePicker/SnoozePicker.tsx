/**
 * SnoozePicker - Wrapper around DateTimePicker for snoozing emails
 */

import { DateTimePicker, SNOOZE_PRESETS } from '@/components/common/DateTimePicker'

interface SnoozePickerProps {
  onSnooze: (date: Date) => void
  onCancel: () => void
}

export function SnoozePicker({ onSnooze, onCancel }: SnoozePickerProps) {
  return (
    <DateTimePicker
      title="Snooze until"
      confirmButtonText="Snooze"
      presets={SNOOZE_PRESETS}
      onSelect={onSnooze}
      onCancel={onCancel}
    />
  )
}
