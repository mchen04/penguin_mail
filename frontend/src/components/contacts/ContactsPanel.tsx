/**
 * ContactsPanel - Main contacts management interface
 */

import { useState } from 'react'
import { useContacts } from '@/context/ContactsContext'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { Icon } from '@/components/common/Icon/Icon'
import { Button } from '@/components/common/Button/Button'
import { ICON_SIZE, LABEL_COLORS, type LabelColor } from '@/constants'
import type { Contact, ContactCreateInput } from '@/types/contact'
import styles from './ContactsPanel.module.css'

interface ContactsPanelProps {
  onClose?: () => void
}

export function ContactsPanel({ onClose }: ContactsPanelProps) {
  const {
    contacts,
    filteredContacts,
    groups,
    searchQuery,
    selectedGroupId,
    setSearch,
    setSelectedGroup,
    toggleFavorite,
    deleteContact,
    addContact,
    updateContact,
    addGroup,
    deleteGroup,
  } = useContacts()
  const { openCompose } = useApp()
  const toast = useToast()

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState<LabelColor>(LABEL_COLORS[0])
  const [formData, setFormData] = useState<ContactCreateInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    groups: [],
  })

  // Get filtered contacts, including favorites view
  const displayContacts = selectedGroupId === 'favorites'
    ? contacts.filter(c => c.isFavorite).sort((a, b) => a.name.localeCompare(b.name))
    : filteredContacts

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
      groups: [],
    })
  }

  const handleCreateContact = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    addContact(formData)
    toast.success('Contact created')
    resetForm()
    setIsCreating(false)
  }

  const handleUpdateContact = () => {
    if (!selectedContact) return
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    updateContact(selectedContact.id, formData)
    toast.success('Contact updated')
    setIsEditing(false)
    setSelectedContact({ ...selectedContact, ...formData })
  }

  const startEditing = () => {
    if (!selectedContact) return
    setFormData({
      name: selectedContact.name,
      email: selectedContact.email,
      phone: selectedContact.phone,
      company: selectedContact.company,
      notes: selectedContact.notes,
      groups: selectedContact.groups,
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
    resetForm()
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required')
      return
    }
    await addGroup(newGroupName.trim(), newGroupColor)
    toast.success('Group created')
    setNewGroupName('')
    setNewGroupColor(LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)])
    setIsCreatingGroup(false)
  }

  const handleDeleteGroup = async (groupId: string) => {
    await deleteGroup(groupId)
    if (selectedGroupId === groupId) setSelectedGroup(null)
    toast.success('Group deleted')
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>Contacts</h2>
          <span className={styles.contactCount}>{displayContacts.length} contacts</span>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => { resetForm(); setIsCreating(true); setSelectedContact(null); }}>
            <Icon name="plus" size={ICON_SIZE.SMALL} />
            New Contact
          </Button>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose}>
              <Icon name="close" size={ICON_SIZE.LARGE} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Sidebar with groups */}
        <div className={styles.sidebar}>
          <div className={styles.searchBox}>
            <Icon name="search" size={ICON_SIZE.SMALL} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <nav className={styles.groupList}>
            <button
              type="button"
              className={`${styles.groupItem} ${!selectedGroupId ? styles.active : ''}`}
              onClick={() => setSelectedGroup(null)}
            >
              <Icon name="users" size={ICON_SIZE.DEFAULT} />
              <span>All Contacts</span>
            </button>
            <button
              type="button"
              className={`${styles.groupItem} ${selectedGroupId === 'favorites' ? styles.active : ''}`}
              onClick={() => setSelectedGroup('favorites')}
            >
              <Icon name="star" size={ICON_SIZE.DEFAULT} />
              <span>Favorites</span>
            </button>

            <div className={styles.groupDivider}>
              <span>Groups</span>
              <button
                type="button"
                className={styles.addGroupButton}
                onClick={() => {
                  setIsCreatingGroup(true)
                  setNewGroupName('')
                  setNewGroupColor(LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)])
                }}
                title="Create new group"
              >
                <Icon name="plus" size={ICON_SIZE.SMALL} />
              </button>
            </div>

            {isCreatingGroup && (
              <div className={styles.groupCreateForm}>
                <div className={styles.groupColorPicker}>
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={styles.groupColorOption}
                      style={{ backgroundColor: c }}
                      data-selected={c === newGroupColor}
                      onClick={() => setNewGroupColor(c)}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  className={styles.groupNameInput}
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateGroup()
                    if (e.key === 'Escape') setIsCreatingGroup(false)
                  }}
                  autoFocus
                />
                <div className={styles.groupFormActions}>
                  <button
                    type="button"
                    className={styles.groupCancelBtn}
                    onClick={() => setIsCreatingGroup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.groupSaveBtn}
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {groups.map((group) => (
              <div
                key={group.id}
                className={`${styles.groupItem} ${selectedGroupId === group.id ? styles.active : ''}`}
              >
                <button
                  type="button"
                  className={styles.groupItemButton}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <span
                    className={styles.groupColor}
                    style={{ background: group.color }}
                  />
                  <span>{group.name}</span>
                  <span className={styles.groupCount}>
                    {group.contactIds.length}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.groupDeleteBtn}
                  onClick={() => handleDeleteGroup(group.id)}
                  title="Delete group"
                >
                  <Icon name="close" size={ICON_SIZE.XSMALL} />
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Contact list */}
        <div className={styles.contactList}>
          {displayContacts.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="users" size={ICON_SIZE.XLARGE} />
              <p>No contacts found</p>
            </div>
          ) : (
            displayContacts.map((contact) => (
              <div
                key={contact.id}
                role="button"
                tabIndex={0}
                className={`${styles.contactItem} ${selectedContact?.id === contact.id ? styles.selected : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className={styles.contactAvatar}>
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} />
                  ) : (
                    <span>{contact.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.contactInfo}>
                  <span className={styles.contactName}>{contact.name}</span>
                  <span className={styles.contactEmail}>{contact.email}</span>
                </div>
                <button
                  type="button"
                  className={`${styles.favoriteButton} ${contact.isFavorite ? styles.isFavorite : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(contact.id)
                  }}
                >
                  <Icon
                    name={contact.isFavorite ? 'starFilled' : 'star'}
                    size={ICON_SIZE.SMALL}
                  />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Contact details / Create / Edit form */}
        <div className={styles.contactDetails}>
          {isCreating || isEditing ? (
            /* Create/Edit Form */
            <>
              <div className={styles.formHeader}>
                <h3>{isCreating ? 'New Contact' : 'Edit Contact'}</h3>
              </div>
              <div className={styles.form}>
                <div className={styles.formField}>
                  <label htmlFor="contact-name">Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    autoFocus
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="contact-email">Email *</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="contact-phone">Phone</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="contact-company">Company</label>
                  <input
                    id="contact-company"
                    type="text"
                    value={formData.company ?? ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="contact-notes">Notes</label>
                  <textarea
                    id="contact-notes"
                    value={formData.notes ?? ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add notes about this contact..."
                    rows={3}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <Button variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={isCreating ? handleCreateContact : handleUpdateContact}
                >
                  {isCreating ? 'Create Contact' : 'Save Changes'}
                </Button>
              </div>
            </>
          ) : selectedContact ? (
            /* View Contact Details */
            <>
              <div className={styles.detailsHeader}>
                <div className={styles.detailsAvatar}>
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt={selectedContact.name} />
                  ) : (
                    <span>{selectedContact.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h3 className={styles.detailsName}>{selectedContact.name}</h3>
                {selectedContact.company && (
                  <p className={styles.detailsCompany}>{selectedContact.company}</p>
                )}
              </div>

              <div className={styles.detailsSection}>
                <div className={styles.detailItem}>
                  <Icon name="mail" size={ICON_SIZE.SMALL} />
                  <span>{selectedContact.email}</span>
                </div>
                {selectedContact.phone && (
                  <div className={styles.detailItem}>
                    <Icon name="phone" size={ICON_SIZE.SMALL} />
                    <span>{selectedContact.phone}</span>
                  </div>
                )}
                {selectedContact.company && (
                  <div className={styles.detailItem}>
                    <Icon name="building" size={ICON_SIZE.SMALL} />
                    <span>{selectedContact.company}</span>
                  </div>
                )}
              </div>

              {selectedContact.notes && (
                <div className={styles.detailsSection}>
                  <h4>Notes</h4>
                  <p className={styles.notes}>{selectedContact.notes}</p>
                </div>
              )}

              {selectedContact.groups.length > 0 && (
                <div className={styles.detailsSection}>
                  <h4>Groups</h4>
                  <div className={styles.groupTags}>
                    {selectedContact.groups.map((groupId) => {
                      const group = groups.find((g) => g.id === groupId)
                      return group ? (
                        <span
                          key={groupId}
                          className={styles.groupTag}
                          style={{ background: group.color }}
                        >
                          {group.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              <div className={styles.detailsActions}>
                <Button variant="secondary" onClick={() => openCompose({ mode: 'new', to: [{ name: selectedContact.name, email: selectedContact.email }] })}>
                  <Icon name="compose" size={ICON_SIZE.SMALL} />
                  Compose
                </Button>
                <Button variant="secondary" onClick={startEditing}>
                  <Icon name="edit" size={ICON_SIZE.SMALL} />
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => toggleFavorite(selectedContact.id)}>
                  <Icon name={selectedContact.isFavorite ? 'starFilled' : 'star'} size={ICON_SIZE.SMALL} />
                  {selectedContact.isFavorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setContactToDelete(selectedContact)}
                >
                  <Icon name="trash" size={ICON_SIZE.SMALL} />
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <Icon name="user" size={ICON_SIZE.XLARGE} />
              <p>Select a contact to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {contactToDelete && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h4>Delete contact?</h4>
            <p>"{contactToDelete.name}" will be permanently deleted.</p>
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => setContactToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  deleteContact(contactToDelete.id)
                  if (selectedContact?.id === contactToDelete.id) setSelectedContact(null)
                  toast.success('Contact deleted')
                  setContactToDelete(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
