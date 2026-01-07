import { useState, type KeyboardEvent, type ChangeEvent } from 'react'
import styles from './RecipientField.module.css'

interface RecipientFieldProps {
  label: string
  recipients: string[]
  onChange: (recipients: string[]) => void
  placeholder?: string
}

// Basic email validation
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export function RecipientField({
  label,
  recipients,
  onChange,
  placeholder = 'Enter email addresses',
}: RecipientFieldProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault()
      addRecipient()
    } else if (e.key === 'Backspace' && inputValue === '' && recipients.length > 0) {
      // Remove last recipient on backspace if input is empty
      onChange(recipients.slice(0, -1))
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // If user pastes or types a comma, add the recipient
    if (value.includes(',')) {
      const parts = value.split(',').map((s) => s.trim()).filter((s) => s && isValidEmail(s))
      const newRecipients = [...recipients, ...parts.filter((p) => !recipients.includes(p))]
      onChange(newRecipients)
      setInputValue('')
    } else {
      setInputValue(value)
    }
  }

  const addRecipient = () => {
    const trimmed = inputValue.trim()
    if (trimmed && isValidEmail(trimmed) && !recipients.includes(trimmed)) {
      onChange([...recipients, trimmed])
      setInputValue('')
    }
  }

  const removeRecipient = (recipientToRemove: string) => {
    onChange(recipients.filter((r) => r !== recipientToRemove))
  }

  const handleBlur = () => {
    if (inputValue.trim()) {
      addRecipient()
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        {recipients.map((recipient) => (
          <span key={recipient} className={styles.chip}>
            {recipient}
            <button
              type="button"
              className={styles.removeChip}
              onClick={() => removeRecipient(recipient)}
              aria-label={`Remove ${recipient}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={recipients.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  )
}
