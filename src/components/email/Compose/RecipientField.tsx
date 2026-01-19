import { useState, useRef, useEffect, useMemo, type KeyboardEvent, type ChangeEvent } from 'react'
import { useContacts } from '@/context/ContactsContext'
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
  const { contacts } = useContacts()
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter contacts based on input
  const suggestions = useMemo(() => {
    if (inputValue.trim().length === 0) return []

    return contacts
      .filter(contact => {
        const query = inputValue.toLowerCase()
        // Don't suggest already added recipients
        const isAlreadyAdded = recipients.some(r =>
          r.includes(contact.email.toLowerCase()) || r.toLowerCase() === contact.email.toLowerCase()
        )
        if (isAlreadyAdded) return false

        return (
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query)
        )
      })
      .slice(0, 5) // Limit to 5 suggestions
  }, [contacts, inputValue, recipients])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        return
      }
      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault()
        selectSuggestion(suggestions[highlightedIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowSuggestions(false)
        return
      }
    }

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
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    } else {
      setInputValue(value)
      setHighlightedIndex(-1) // Reset highlight when input changes
      setShowSuggestions(value.trim().length > 0)
    }
  }

  const addRecipient = () => {
    const trimmed = inputValue.trim()
    if (trimmed && isValidEmail(trimmed) && !recipients.includes(trimmed)) {
      onChange([...recipients, trimmed])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (contact: { name: string; email: string }) => {
    const recipientString = contact.name
      ? `${contact.name} <${contact.email}>`
      : contact.email

    if (!recipients.some(r => r.includes(contact.email))) {
      onChange([...recipients, recipientString])
    }
    setInputValue('')
    setShowSuggestions(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const removeRecipient = (recipientToRemove: string) => {
    onChange(recipients.filter((r) => r !== recipientToRemove))
  }

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      if (inputValue.trim() && !showSuggestions) {
        addRecipient()
      }
    }, 150)
  }

  const handleFocus = () => {
    if (inputValue.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
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
            ref={inputRef}
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={recipients.length === 0 ? placeholder : ''}
            autoComplete="off"
          />
        </div>

        {/* Contact suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className={styles.suggestions} role="listbox">
            {suggestions.map((contact, index) => (
              <button
                key={contact.id}
                type="button"
                className={`${styles.suggestion} ${index === highlightedIndex ? styles.highlighted : ''}`}
                onMouseDown={() => selectSuggestion(contact)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <div className={styles.suggestionAvatar}>
                  {contact.avatar ? (
                    <img src={contact.avatar} alt="" />
                  ) : (
                    <span>{contact.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.suggestionInfo}>
                  <span className={styles.suggestionName}>{contact.name}</span>
                  <span className={styles.suggestionEmail}>{contact.email}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
