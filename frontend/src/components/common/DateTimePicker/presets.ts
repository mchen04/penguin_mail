/**
 * Pre-configured preset options for common DateTimePicker use cases
 */

import type { DatePreset } from '@/utils'

export interface DateTimePresetOption {
  preset: DatePreset
  label: string
}

export const SNOOZE_PRESETS: DateTimePresetOption[] = [
  { preset: 'laterToday', label: 'Later today' },
  { preset: 'tomorrow', label: 'Tomorrow' },
  { preset: 'nextWeek', label: 'Next week' },
  { preset: 'nextMonth', label: 'Next month' },
]

export const SCHEDULE_SEND_PRESETS: DateTimePresetOption[] = [
  { preset: 'laterToday', label: 'Later today' },
  { preset: 'tomorrow', label: 'Tomorrow morning' },
  { preset: 'mondayMorning', label: 'Monday morning' },
]
