import { useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { Modal } from '@/components/common/Modal/Modal'
import { Icon, type IconName } from '@/components/common/Icon/Icon'
import { Button } from '@/components/common/Button/Button'
import { ICON_SIZE, TEXT } from '@/constants'
import { stripHtml } from '@/utils'
import type { Theme, Density, ReadingPanePosition, DateFormat, TimeFormat, Signature, VacationResponder, FilterRule } from '@/types/settings'
import styles from './SettingsModal.module.css'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SettingsTab = 'general' | 'notifications' | 'inbox' | 'signatures' | 'vacation' | 'filters' | 'blocked' | 'shortcuts'

const TABS: { id: SettingsTab; label: string; icon: IconName }[] = [
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'inbox', label: 'Inbox', icon: 'inbox' },
  { id: 'signatures', label: 'Signatures', icon: 'edit' },
  { id: 'vacation', label: 'Vacation', icon: 'vacation' },
  { id: 'filters', label: 'Filters', icon: 'filter' },
  { id: 'blocked', label: 'Blocked', icon: 'ban' },
  { id: 'shortcuts', label: 'Shortcuts', icon: 'keyboard' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const {
    theme,
    density,
    fontSize,
    readingPanePosition,
    setTheme,
    setDensity,
    setFontSize,
    setReadingPanePosition,
    notifications,
    updateNotifications,
    conversationView,
    setConversationView,
    settings,
    updateLanguage,
    keyboardShortcuts,
    updateKeyboardShortcut,
    resetSettings,
    signatures,
    addSignature,
    updateSignature,
    deleteSignature,
    setDefaultSignature,
    vacationResponder,
    updateVacationResponder,
    filters,
    addFilter,
    updateFilter,
    deleteFilter,
    blockedAddresses,
    blockAddress,
    unblockAddress,
  } = useSettings()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="large">
      <div className={styles.layout}>
        {/* Sidebar tabs */}
        <nav className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={ICON_SIZE.DEFAULT} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'general' && (
            <GeneralSettings
              theme={theme}
              density={density}
              fontSize={fontSize}
              dateFormat={settings.language.dateFormat}
              timeFormat={settings.language.timeFormat}
              onThemeChange={setTheme}
              onDensityChange={setDensity}
              onFontSizeChange={setFontSize}
              onDateFormatChange={(dateFormat) => updateLanguage({ dateFormat })}
              onTimeFormatChange={(timeFormat) => updateLanguage({ timeFormat })}
              onResetSettings={resetSettings}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings
              notifications={notifications}
              onUpdate={updateNotifications}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxSettings
              conversationView={conversationView}
              readingPanePosition={readingPanePosition}
              onConversationViewChange={setConversationView}
              onReadingPaneChange={setReadingPanePosition}
            />
          )}

          {activeTab === 'signatures' && (
            <SignatureSettings
              signatures={signatures}
              onAdd={addSignature}
              onUpdate={updateSignature}
              onDelete={deleteSignature}
              onSetDefault={setDefaultSignature}
            />
          )}

          {activeTab === 'vacation' && (
            <VacationSettings
              vacationResponder={vacationResponder}
              onUpdate={updateVacationResponder}
            />
          )}

          {activeTab === 'filters' && (
            <FilterSettings
              filters={filters}
              onAdd={addFilter}
              onUpdate={updateFilter}
              onDelete={deleteFilter}
            />
          )}

          {activeTab === 'blocked' && (
            <BlockedSettings
              blockedAddresses={blockedAddresses}
              onBlock={blockAddress}
              onUnblock={unblockAddress}
            />
          )}

          {activeTab === 'shortcuts' && (
            <ShortcutSettings
              shortcuts={keyboardShortcuts}
              onUpdateShortcut={updateKeyboardShortcut}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

// --------------------------------------------------------------------------
// General Settings
// --------------------------------------------------------------------------

interface GeneralSettingsProps {
  theme: Theme
  density: Density
  fontSize: string
  dateFormat: DateFormat
  timeFormat: TimeFormat
  onThemeChange: (theme: Theme) => void
  onDensityChange: (density: Density) => void
  onFontSizeChange: (fontSize: 'small' | 'medium' | 'large') => void
  onDateFormatChange: (format: DateFormat) => void
  onTimeFormatChange: (format: TimeFormat) => void
  onResetSettings: () => void
}

function GeneralSettings({
  theme,
  density,
  fontSize,
  dateFormat,
  timeFormat,
  onThemeChange,
  onDensityChange,
  onFontSizeChange,
  onDateFormatChange,
  onTimeFormatChange,
  onResetSettings,
}: GeneralSettingsProps) {
  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Appearance</h3>

        <div className={styles.setting}>
          <label className={styles.label}>Theme</label>
          <div className={styles.options}>
            <OptionButton
              label="Light"
              active={theme === 'light'}
              onClick={() => onThemeChange('light')}
            />
            <OptionButton
              label="Dark"
              active={theme === 'dark'}
              onClick={() => onThemeChange('dark')}
            />
            <OptionButton
              label="System"
              active={theme === 'system'}
              onClick={() => onThemeChange('system')}
            />
          </div>
        </div>

        <div className={styles.setting}>
          <label className={styles.label}>Display Density</label>
          <div className={styles.options}>
            <OptionButton
              label="Compact"
              active={density === 'compact'}
              onClick={() => onDensityChange('compact')}
            />
            <OptionButton
              label="Default"
              active={density === 'default'}
              onClick={() => onDensityChange('default')}
            />
            <OptionButton
              label="Comfortable"
              active={density === 'comfortable'}
              onClick={() => onDensityChange('comfortable')}
            />
          </div>
        </div>

        <div className={styles.setting}>
          <label className={styles.label}>Font Size</label>
          <div className={styles.options}>
            <OptionButton
              label="Small"
              active={fontSize === 'small'}
              onClick={() => onFontSizeChange('small')}
            />
            <OptionButton
              label="Medium"
              active={fontSize === 'medium'}
              onClick={() => onFontSizeChange('medium')}
            />
            <OptionButton
              label="Large"
              active={fontSize === 'large'}
              onClick={() => onFontSizeChange('large')}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Date & Time</h3>

        <div className={styles.setting}>
          <label className={styles.label}>Date Format</label>
          <div className={styles.options}>
            <OptionButton
              label="MM/DD/YYYY"
              active={dateFormat === 'MM/DD/YYYY'}
              onClick={() => onDateFormatChange('MM/DD/YYYY')}
            />
            <OptionButton
              label="DD/MM/YYYY"
              active={dateFormat === 'DD/MM/YYYY'}
              onClick={() => onDateFormatChange('DD/MM/YYYY')}
            />
            <OptionButton
              label="YYYY-MM-DD"
              active={dateFormat === 'YYYY-MM-DD'}
              onClick={() => onDateFormatChange('YYYY-MM-DD')}
            />
          </div>
        </div>

        <div className={styles.setting}>
          <label className={styles.label}>Time Format</label>
          <div className={styles.options}>
            <OptionButton
              label="12-hour"
              active={timeFormat === '12h'}
              onClick={() => onTimeFormatChange('12h')}
            />
            <OptionButton
              label="24-hour"
              active={timeFormat === '24h'}
              onClick={() => onTimeFormatChange('24h')}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Reset</h3>
        <div className={styles.setting}>
          <p className={styles.description}>
            Reset all settings to their default values. This action cannot be undone.
          </p>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={onResetSettings}
          >
            Reset All Settings
          </button>
        </div>
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Notification Settings
// --------------------------------------------------------------------------

interface NotificationSettingsProps {
  notifications: {
    emailNotifications: boolean
    desktopNotifications: boolean
    soundEnabled: boolean
    notifyOnNewEmail: boolean
    notifyOnMention: boolean
  }
  onUpdate: (updates: Partial<NotificationSettingsProps['notifications']>) => void
}

function NotificationSettings({ notifications, onUpdate }: NotificationSettingsProps) {
  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Notifications</h3>

        <ToggleSetting
          label="Email notifications"
          description="Receive email notifications for important updates"
          checked={notifications.emailNotifications}
          onChange={(checked) => onUpdate({ emailNotifications: checked })}
        />

        <ToggleSetting
          label="Desktop notifications"
          description="Show desktop notifications when new emails arrive"
          checked={notifications.desktopNotifications}
          onChange={(checked) => onUpdate({ desktopNotifications: checked })}
        />

        <ToggleSetting
          label="Sound"
          description="Play a sound when new emails arrive"
          checked={notifications.soundEnabled}
          onChange={(checked) => onUpdate({ soundEnabled: checked })}
        />

        <ToggleSetting
          label="Notify on new email"
          description="Get notified when any new email arrives"
          checked={notifications.notifyOnNewEmail}
          onChange={(checked) => onUpdate({ notifyOnNewEmail: checked })}
        />

        <ToggleSetting
          label="Notify on mentions"
          description="Get notified when you are mentioned in an email"
          checked={notifications.notifyOnMention}
          onChange={(checked) => onUpdate({ notifyOnMention: checked })}
        />
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Inbox Settings
// --------------------------------------------------------------------------

interface InboxSettingsProps {
  conversationView: boolean
  readingPanePosition: ReadingPanePosition
  onConversationViewChange: (enabled: boolean) => void
  onReadingPaneChange: (position: ReadingPanePosition) => void
}

function InboxSettings({
  conversationView,
  readingPanePosition,
  onConversationViewChange,
  onReadingPaneChange,
}: InboxSettingsProps) {
  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Inbox Behavior</h3>

        <ToggleSetting
          label="Conversation view"
          description="Group related emails into conversations"
          checked={conversationView}
          onChange={onConversationViewChange}
        />

        <div className={styles.setting}>
          <label className={styles.label}>Reading pane</label>
          <p className={styles.description}>
            Choose where the reading pane appears when viewing emails
          </p>
          <div className={styles.options}>
            <OptionButton
              label="Right"
              active={readingPanePosition === 'right'}
              onClick={() => onReadingPaneChange('right')}
            />
            <OptionButton
              label="Bottom"
              active={readingPanePosition === 'bottom'}
              onClick={() => onReadingPaneChange('bottom')}
            />
            <OptionButton
              label="Hidden"
              active={readingPanePosition === 'hidden'}
              onClick={() => onReadingPaneChange('hidden')}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Signature Settings
// --------------------------------------------------------------------------

interface SignatureSettingsProps {
  signatures: Signature[]
  onAdd: (name: string, content: string, isDefault?: boolean) => void
  onUpdate: (id: string, updates: Partial<Signature>) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

function SignatureSettings({
  signatures,
  onAdd,
  onUpdate,
  onDelete,
  onSetDefault,
}: SignatureSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')

  const startNew = () => {
    setIsEditing(true)
    setEditingId(null)
    setName('')
    setContent('')
  }

  const startEdit = (sig: Signature) => {
    setIsEditing(true)
    setEditingId(sig.id)
    setName(sig.name)
    setContent(sig.content)
  }

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return

    if (editingId) {
      onUpdate(editingId, { name, content })
    } else {
      onAdd(name, content, signatures.length === 0)
    }
    setIsEditing(false)
    setEditingId(null)
    setName('')
    setContent('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingId(null)
    setName('')
    setContent('')
  }

  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Email Signatures</h3>
        <p className={styles.description}>
          Create signatures to automatically append to your emails
        </p>

        {isEditing ? (
          <div className={styles.signatureForm}>
            <div className={styles.formField}>
              <label className={styles.label}>Signature name</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Work, Personal"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Signature content</label>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your signature..."
                rows={4}
              />
            </div>
            <div className={styles.formActions}>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Create Signature'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {signatures.length === 0 ? (
              <p className={styles.emptyMessage}>No signatures yet. Create one to get started.</p>
            ) : (
              <div className={styles.signatureList}>
                {signatures.map((sig) => (
                  <div key={sig.id} className={styles.signatureItem}>
                    <div className={styles.signatureInfo}>
                      <span className={styles.signatureName}>
                        {sig.name}
                        {sig.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </span>
                      <p className={styles.signaturePreview}>{stripHtml(sig.content, ' ').slice(0, TEXT.SIGNATURE_PREVIEW_LENGTH)}...</p>
                    </div>
                    <div className={styles.signatureActions}>
                      {!sig.isDefault && (
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => onSetDefault(sig.id)}
                        >
                          Set as default
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => startEdit(sig)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => onDelete(sig.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="secondary" onClick={startNew}>
              <Icon name="plus" size={ICON_SIZE.SMALL} />
              Add Signature
            </Button>
          </>
        )}
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Shortcut Settings
// --------------------------------------------------------------------------

interface ShortcutSettingsProps {
  shortcuts: Array<{
    id: string
    action: string
    key: string
    modifiers: string[]
    enabled: boolean
  }>
  onUpdateShortcut: (id: string, updates: { enabled?: boolean }) => void
}

function ShortcutSettings({ shortcuts, onUpdateShortcut }: ShortcutSettingsProps) {
  const formatShortcut = (shortcut: { key: string; modifiers: string[] }) => {
    const modifierLabels: Record<string, string> = {
      ctrl: 'Ctrl',
      alt: 'Alt',
      shift: 'Shift',
      meta: 'Cmd',
    }
    const parts = shortcut.modifiers.map((m) => modifierLabels[m] || m)
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Keyboard Shortcuts</h3>
        <p className={styles.description}>
          Enable or disable keyboard shortcuts for common actions
        </p>

        <div className={styles.shortcutList}>
          {shortcuts.map((shortcut) => (
            <div key={shortcut.id} className={styles.shortcutItem}>
              <div className={styles.shortcutInfo}>
                <span className={styles.shortcutAction}>{shortcut.action}</span>
                <kbd className={styles.shortcutKey}>{formatShortcut(shortcut)}</kbd>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={shortcut.enabled}
                  onChange={(e) => onUpdateShortcut(shortcut.id, { enabled: e.target.checked })}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Vacation Responder Settings
// --------------------------------------------------------------------------

interface VacationSettingsProps {
  vacationResponder: VacationResponder
  onUpdate: (updates: Partial<VacationResponder>) => void
}

function VacationSettings({ vacationResponder, onUpdate }: VacationSettingsProps) {
  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Vacation Responder</h3>
        <p className={styles.description}>
          Automatically reply to incoming emails when you're away
        </p>

        <ToggleSetting
          label="Enable vacation responder"
          description="Automatically send a reply to people who email you"
          checked={vacationResponder.enabled}
          onChange={(enabled) => onUpdate({ enabled })}
        />

        {vacationResponder.enabled && (
          <>
            <div className={styles.formField}>
              <label className={styles.label}>Start date</label>
              <input
                type="date"
                className={styles.input}
                value={vacationResponder.startDate ? new Date(vacationResponder.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onUpdate({ startDate: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>End date</label>
              <input
                type="date"
                className={styles.input}
                value={vacationResponder.endDate ? new Date(vacationResponder.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onUpdate({ endDate: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Subject</label>
              <input
                type="text"
                className={styles.input}
                value={vacationResponder.subject}
                onChange={(e) => onUpdate({ subject: e.target.value })}
                placeholder="I'm currently out of office"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Message</label>
              <textarea
                className={styles.textarea}
                value={vacationResponder.message}
                onChange={(e) => onUpdate({ message: e.target.value })}
                placeholder="Enter your vacation message..."
                rows={4}
              />
            </div>

            <ToggleSetting
              label="Only send to contacts"
              description="Only reply to people in your contacts"
              checked={vacationResponder.sendToContacts}
              onChange={(sendToContacts) => onUpdate({ sendToContacts })}
            />
          </>
        )}
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Filter Settings
// --------------------------------------------------------------------------

interface FilterSettingsProps {
  filters: FilterRule[]
  onAdd: (filter: Omit<FilterRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, updates: Partial<FilterRule>) => void
  onDelete: (id: string) => void
}

function FilterSettings({ filters, onAdd, onUpdate, onDelete }: FilterSettingsProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [fieldType, setFieldType] = useState<FilterRule['conditions'][0]['field']>('from')
  const [operator, setOperator] = useState<FilterRule['conditions'][0]['operator']>('contains')
  const [conditionValue, setConditionValue] = useState('')
  const [actionType, setActionType] = useState<FilterRule['actions'][0]['type']>('moveTo')
  const [actionValue, setActionValue] = useState('')

  const resetForm = () => {
    setName('')
    setFieldType('from')
    setOperator('contains')
    setConditionValue('')
    setActionType('moveTo')
    setActionValue('')
    setIsCreating(false)
    setEditingId(null)
  }

  const handleSave = () => {
    if (!name.trim() || !conditionValue.trim()) return

    const filterData = {
      name,
      enabled: true,
      matchAll: true,
      conditions: [{ field: fieldType, operator, value: conditionValue }],
      actions: [{ type: actionType, value: actionValue || undefined }],
    }

    if (editingId) {
      onUpdate(editingId, filterData)
    } else {
      onAdd(filterData)
    }
    resetForm()
  }

  const startEdit = (filter: FilterRule) => {
    setEditingId(filter.id)
    setName(filter.name)
    if (filter.conditions[0]) {
      setFieldType(filter.conditions[0].field)
      setOperator(filter.conditions[0].operator)
      setConditionValue(filter.conditions[0].value)
    }
    if (filter.actions[0]) {
      setActionType(filter.actions[0].type)
      setActionValue(filter.actions[0].value ?? '')
    }
    setIsCreating(true)
  }

  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Email Filters</h3>
        <p className={styles.description}>
          Create rules to automatically organize incoming emails
        </p>

        {isCreating ? (
          <div className={styles.filterForm}>
            <div className={styles.formField}>
              <label className={styles.label}>Filter name</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Move newsletters to folder"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>When email</label>
              <div className={styles.conditionRow}>
                <select
                  className={styles.select}
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FilterRule['conditions'][0]['field'])}
                >
                  <option value="from">From</option>
                  <option value="to">To</option>
                  <option value="subject">Subject</option>
                  <option value="body">Body</option>
                </select>
                <select
                  className={styles.select}
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as FilterRule['conditions'][0]['operator'])}
                >
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                </select>
                <input
                  type="text"
                  className={styles.input}
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder="Value"
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Then</label>
              <div className={styles.actionRow}>
                <select
                  className={styles.select}
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as FilterRule['actions'][0]['type'])}
                >
                  <option value="moveTo">Move to folder</option>
                  <option value="addLabel">Add label</option>
                  <option value="markAsRead">Mark as read</option>
                  <option value="markAsStarred">Star</option>
                  <option value="archive">Archive</option>
                  <option value="delete">Delete</option>
                </select>
                {(actionType === 'moveTo' || actionType === 'addLabel') && (
                  <input
                    type="text"
                    className={styles.input}
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    placeholder="Folder/Label name"
                  />
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Create Filter'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {filters.length === 0 ? (
              <p className={styles.emptyMessage}>No filters yet. Create one to automatically organize your emails.</p>
            ) : (
              <div className={styles.filterList}>
                {filters.map((filter) => (
                  <div key={filter.id} className={styles.filterItem}>
                    <div className={styles.filterInfo}>
                      <div className={styles.filterHeader}>
                        <span className={styles.filterName}>{filter.name}</span>
                        <label className={styles.toggle}>
                          <input
                            type="checkbox"
                            checked={filter.enabled}
                            onChange={(e) => onUpdate(filter.id, { enabled: e.target.checked })}
                          />
                          <span className={styles.toggleSlider} />
                        </label>
                      </div>
                      <p className={styles.filterDescription}>
                        {filter.conditions[0]?.field} {filter.conditions[0]?.operator} "{filter.conditions[0]?.value}"
                        {' → '}
                        {filter.actions[0]?.type}
                        {filter.actions[0]?.value ? `: ${filter.actions[0].value}` : ''}
                      </p>
                    </div>
                    <div className={styles.filterActions}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => startEdit(filter)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => onDelete(filter.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="secondary" onClick={() => setIsCreating(true)}>
              <Icon name="plus" size={ICON_SIZE.SMALL} />
              Create Filter
            </Button>
          </>
        )}
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Blocked Addresses Settings
// --------------------------------------------------------------------------

interface BlockedSettingsProps {
  blockedAddresses: string[]
  onBlock: (email: string) => void
  onUnblock: (email: string) => void
}

function BlockedSettings({ blockedAddresses, onBlock, onUnblock }: BlockedSettingsProps) {
  const [newEmail, setNewEmail] = useState('')

  const handleBlock = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) return
    if (blockedAddresses.includes(newEmail.toLowerCase())) return
    onBlock(newEmail.toLowerCase())
    setNewEmail('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlock()
    }
  }

  return (
    <div className={styles.settings}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Blocked Addresses</h3>
        <p className={styles.description}>
          Emails from blocked addresses will be automatically moved to spam
        </p>

        <div className={styles.blockForm}>
          <input
            type="email"
            className={styles.input}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter email address to block"
          />
          <Button variant="secondary" onClick={handleBlock}>
            Block
          </Button>
        </div>

        {blockedAddresses.length === 0 ? (
          <p className={styles.emptyMessage}>No blocked addresses.</p>
        ) : (
          <div className={styles.blockedList}>
            {blockedAddresses.map((email) => (
              <div key={email} className={styles.blockedItem}>
                <span className={styles.blockedEmail}>{email}</span>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => onUnblock(email)}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// --------------------------------------------------------------------------
// Common Components
// --------------------------------------------------------------------------

interface OptionButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

function OptionButton({ label, active, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.option} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

interface ToggleSettingProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className={styles.toggleSetting}>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDescription}>{description}</span>
      </div>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.toggleSlider} />
      </label>
    </div>
  )
}
