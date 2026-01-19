import { useState, useRef, useEffect } from 'react'
import { useLabels } from '@/context/OrganizationContext'
import { Icon } from '@/components/common/Icon/Icon'
import { ICON_SIZE } from '@/constants'
import styles from './LabelPicker.module.css'

interface LabelPickerProps {
  selectedLabelIds: string[]
  onToggleLabel: (labelId: string) => void
}

export function LabelPicker({ selectedLabelIds, onToggleLabel }: LabelPickerProps) {
  const { labels } = useLabels()
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (labels.length === 0) {
    return null
  }

  return (
    <div className={styles.picker} ref={pickerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        title="Manage labels"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icon name="filter" size={ICON_SIZE.DEFAULT} />
        <span className={styles.triggerText}>Labels</span>
        <Icon name="chevronDown" size={ICON_SIZE.XSMALL} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownHeader}>Apply labels</div>
          <div className={styles.labelList}>
            {labels.map((label) => {
              const isSelected = selectedLabelIds.includes(label.id)
              return (
                <button
                  key={label.id}
                  type="button"
                  className={styles.labelOption}
                  onClick={() => onToggleLabel(label.id)}
                  role="menuitemcheckbox"
                  aria-checked={isSelected}
                >
                  <span
                    className={styles.labelColor}
                    style={{ backgroundColor: label.color }}
                  />
                  <span className={styles.labelName}>{label.name}</span>
                  {isSelected && (
                    <Icon name="check" size={ICON_SIZE.SMALL} className={styles.checkIcon} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
