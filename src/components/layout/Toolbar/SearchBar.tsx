import { useState, type ChangeEvent } from 'react'
import { Icon } from '@/components/common/Icon/Icon'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = 'Search mail',
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <div className={styles.searchBar}>
      <Icon name="search" size={18} className={styles.icon} />
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        aria-label="Search mail"
      />
    </div>
  )
}
