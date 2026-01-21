/**
 * Advanced Search Component
 * Provides advanced search filters for emails
 */

import { useState, useCallback, useRef } from 'react'
import { Icon } from '@/components/common/Icon/Icon'
import { useFeatures } from '@/context/FeaturesContext'
import { useClickOutside } from '@/hooks'
import { PLACEHOLDERS, ICON_SIZE } from '@/constants'
import type { SearchFilters } from '@/types'
import styles from './AdvancedSearch.module.css'

// Re-export for backward compatibility
export type { SearchFilters } from '@/types'

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
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { savedSearches, addSavedSearch, deleteSavedSearch } = useFeatures()

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsExpanded(false), isExpanded)

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

  const handleSaveSearch = useCallback(() => {
    if (!saveName.trim()) return

    addSavedSearch(saveName.trim(), {
      text: filters.text,
      from: filters.from,
      to: filters.to,
      subject: filters.subject,
      hasAttachment: filters.hasAttachment ?? undefined,
      isUnread: filters.isUnread ?? undefined,
      isStarred: filters.isStarred ?? undefined,
      dateRange: filters.dateRange,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    })
    setSaveName('')
    setShowSaveDialog(false)
  }, [saveName, filters, addSavedSearch])

  const handleLoadSavedSearch = useCallback((savedSearch: typeof savedSearches[0]) => {
    const newFilters: SearchFilters = {
      text: savedSearch.query.text ?? '',
      from: savedSearch.query.from ?? '',
      to: savedSearch.query.to ?? '',
      subject: savedSearch.query.subject ?? '',
      hasAttachment: savedSearch.query.hasAttachment ?? null,
      isUnread: savedSearch.query.isUnread ?? null,
      isStarred: savedSearch.query.isStarred ?? null,
      dateRange: savedSearch.query.dateRange ?? 'any',
      dateFrom: savedSearch.query.dateFrom,
      dateTo: savedSearch.query.dateTo,
    }
    setFilters(newFilters)
    onSearch(newFilters)
    setIsExpanded(false)
  }, [onSearch])

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.searchBar}>
        <Icon name="search" size={ICON_SIZE.DEFAULT} className={styles.icon} />
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
          <Icon name="settings" size={ICON_SIZE.SMALL} />
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

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className={styles.savedSearches}>
              <label className={styles.savedSearchLabel}>Saved Searches</label>
              <div className={styles.savedSearchList}>
                {savedSearches.map((search) => (
                  <div key={search.id} className={styles.savedSearchItem}>
                    <button
                      type="button"
                      className={styles.savedSearchButton}
                      onClick={() => handleLoadSavedSearch(search)}
                    >
                      <Icon name="search" size={ICON_SIZE.XSMALL} />
                      {search.name}
                    </button>
                    <button
                      type="button"
                      className={styles.savedSearchDelete}
                      onClick={() => deleteSavedSearch(search.id)}
                      title="Delete saved search"
                    >
                      <Icon name="close" size={ICON_SIZE.XSMALL} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
            >
              Clear filters
            </button>
            {hasActiveFilters && !showSaveDialog && (
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => setShowSaveDialog(true)}
              >
                Save search
              </button>
            )}
            {showSaveDialog && (
              <div className={styles.saveDialog}>
                <input
                  type="text"
                  className={styles.saveInput}
                  placeholder="Search name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.saveConfirmButton}
                  onClick={handleSaveSearch}
                  disabled={!saveName.trim()}
                >
                  Save
                </button>
                <button
                  type="button"
                  className={styles.saveCancelButton}
                  onClick={() => {
                    setShowSaveDialog(false)
                    setSaveName('')
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
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
