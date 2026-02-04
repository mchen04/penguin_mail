/**
 * DateTimePicker - Generic date/time picker with presets
 * Used for scheduling emails and snoozing
 */

import { useState, useCallback } from 'react'
import { Icon } from '@/components/common/Icon/Icon'
import { ICON_SIZE } from '@/constants'
import {
  getPresetDate,
  formatPresetDate,
  getTomorrowDateString,
  getTodayDateString,
  parseCustomDateTime,
  type DatePreset,
} from '@/utils'
import type { DateTimePresetOption } from './presets'
import styles from './DateTimePicker.module.css'

interface DateTimePickerProps {
  /** Title displayed in the header */
  title: string
  /** Text for the confirm button in custom mode */
  confirmButtonText: string
  /** Preset options to display */
  presets: DateTimePresetOption[]
  /** Called when a date is selected (either preset or custom) */
  onSelect: (date: Date) => void
  /** Called when the picker is cancelled */
  onCancel: () => void
  /** Whether to show chevron icons on preset buttons */
  showPresetChevrons?: boolean
}

export function DateTimePicker({
  title,
  confirmButtonText,
  presets,
  onSelect,
  onCancel,
  showPresetChevrons = false,
}: DateTimePickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('09:00')

  const handlePresetClick = useCallback((preset: DatePreset) => {
    const date = getPresetDate(preset)
    onSelect(date)
  }, [onSelect])

  const handleCustomConfirm = useCallback(() => {
    const selectedDate = parseCustomDateTime(customDate, customTime)
    if (selectedDate) {
      onSelect(selectedDate)
    }
  }, [customDate, customTime, onSelect])

  if (showCustom) {
    return (
      <div className={styles.picker}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setShowCustom(false)}
          >
            <Icon name="chevronLeft" size={ICON_SIZE.SMALL} />
          </button>
          <span className={styles.title}>Pick date & time</span>
        </div>

        <div className={styles.customForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Date</label>
            <input
              type="date"
              className={styles.input}
              value={customDate || getTomorrowDateString()}
              onChange={(e) => setCustomDate(e.target.value)}
              min={getTodayDateString()}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Time</label>
            <input
              type="time"
              className={styles.input}
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
          </div>

          <div className={styles.customActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleCustomConfirm}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.picker}>
      <div className={styles.header}>
        <Icon name="clock" size={ICON_SIZE.SMALL} />
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.presets}>
        {presets.map((option) => (
          <button
            key={option.preset}
            type="button"
            className={styles.presetButton}
            onClick={() => handlePresetClick(option.preset)}
          >
            <div className={styles.presetContent}>
              <span className={styles.presetLabel}>{option.label}</span>
              <span className={styles.presetTime}>
                {formatPresetDate(getPresetDate(option.preset))}
              </span>
            </div>
            {showPresetChevrons && (
              <Icon name="chevronRight" size={ICON_SIZE.SMALL} />
            )}
          </button>
        ))}

        <div className={styles.divider} />

        <button
          type="button"
          className={styles.presetButton}
          onClick={() => setShowCustom(true)}
        >
          <div className={styles.presetContent}>
            <span className={styles.presetLabel}>Pick date & time</span>
          </div>
          <Icon name="chevronRight" size={ICON_SIZE.SMALL} />
        </button>
      </div>

      <button
        type="button"
        className={styles.cancelLink}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  )
}
