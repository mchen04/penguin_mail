/**
 * Advanced Search Component
 * Provides advanced search filters for emails
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Icon } from '@/components/common/Icon/Icon'
import { PLACEHOLDERS } from '@/constants'
import styles from './AdvancedSearch.module.css'

export interface SearchFilters {
  text: string
  from: string
  to: string
  subject: string
  hasAttachment: boolean | null
  isUnread: boolean | null
  isStarred: boolean | null
  dateRange: 'any' | 'today' | 'week' | 'month' | 'year' | 'custom'
  dateFrom?: Date
  dateTo?: Date
}

const defaultFilters: SearchFilters = {
  text: '',
  from: '',
  to: '',
  subject: '',
  hasAttachment: null,
  isUnread: null,
  isStarred: null,
  dateRange: 'any',
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}

export function AdvancedSearch({ onSearch, initialFilters }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, ...initialFilters })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, text: e.target.value }
    setFilters(newFilters)
    // Trigger search on text change
    onSearch(newFilters)
  }, [filters, onSearch])

  const handleFilterChange = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleApply = useCallback(() => {
    onSearch(filters)
    setIsExpanded(false)
  }, [filters, onSearch])

  const handleClear = useCallback(() => {
    const clearedFilters = { ...defaultFilters }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }, [onSearch])

  const hasActiveFilters = filters.from || filters.to || filters.subject ||
    filters.hasAttachment !== null || filters.isUnread !== null ||
    filters.isStarred !== null || filters.dateRange !== 'any'

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.searchBar}>
        <Icon name="search" size={18} className={styles.icon} />
        <input
          type="text"
          className={styles.input}
          placeholder={PLACEHOLDERS.SEARCH}
          value={filters.text}
          onChange={handleTextChange}
          onFocus={() => setIsExpanded(true)}
          aria-label="Search mail"
        />
        <button
          type="button"
          className={styles.filterButton}
          onClick={() => setIsExpanded(!isExpanded)}
          data-active={hasActiveFilters}
          title="Advanced search"
        >
          <Icon name="settings" size={16} />
        </button>
      </div>

      {isExpanded && (
        <div className={styles.dropdown}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>From</label>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="sender@example.com"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>To</label>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="recipient@example.com"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Subject</label>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Contains words"
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Date</label>
            <select
              className={styles.filterSelect}
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value as SearchFilters['dateRange'])}
            >
              <option value="any">Any time</option>
              <option value="today">Today</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="year">Past year</option>
            </select>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Has attachment</label>
              <select
                className={styles.filterSelect}
                value={filters.hasAttachment === null ? '' : String(filters.hasAttachment)}
                onChange={(e) => {
                  const val = e.target.value
                  handleFilterChange('hasAttachment', val === '' ? null : val === 'true')
                }}
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.filterSelect}
                value={filters.isUnread === null ? '' : String(filters.isUnread)}
                onChange={(e) => {
                  const val = e.target.value
                  handleFilterChange('isUnread', val === '' ? null : val === 'true')
                }}
              >
                <option value="">Any</option>
                <option value="true">Unread</option>
                <option value="false">Read</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Starred</label>
              <select
                className={styles.filterSelect}
                value={filters.isStarred === null ? '' : String(filters.isStarred)}
                onChange={(e) => {
                  const val = e.target.value
                  handleFilterChange('isStarred', val === '' ? null : val === 'true')
                }}
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
            >
              Clear filters
            </button>
            <button
              type="button"
              className={styles.applyButton}
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
