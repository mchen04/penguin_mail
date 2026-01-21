/**
 * ScheduleSendPicker - Wrapper around DateTimePicker for scheduling emails
 */

import { DateTimePicker, SCHEDULE_SEND_PRESETS } from '@/components/common/DateTimePicker'
import styles from './ScheduleSendPicker.module.css'

interface ScheduleSendPickerProps {
  onSchedule: (date: Date) => void
  onCancel: () => void
}

export function ScheduleSendPicker({ onSchedule, onCancel }: ScheduleSendPickerProps) {
  return (
    <div className={styles.wrapper}>
      <DateTimePicker
        title="Schedule send"
        confirmButtonText="Schedule"
        presets={SCHEDULE_SEND_PRESETS}
        onSelect={onSchedule}
        onCancel={onCancel}
        showPresetChevrons
      />
    </div>
  )
}
