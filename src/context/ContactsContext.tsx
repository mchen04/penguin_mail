/**
 * Contacts Context
 * Manages contacts and contact groups with persistence via repository pattern
 */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type {
  Contact,
  ContactGroup,
  ContactCreateInput,
  ContactUpdateInput,
} from '@/types/contact'
import { useRepositories } from './RepositoryContext'
import { REPOSITORY } from '@/constants'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface ContactsState {
  contacts: Contact[]
  groups: ContactGroup[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedGroupId: string | null // null = all contacts
}

type ContactsAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_CONTACTS'; contacts: Contact[] }
  | { type: 'SET_GROUPS'; groups: ContactGroup[] }
  | { type: 'SET_DATA'; contacts: Contact[]; groups: ContactGroup[] }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'ADD_CONTACT'; contact: Contact }
  | { type: 'UPDATE_CONTACT'; id: string; updates: Partial<Contact> }
  | { type: 'DELETE_CONTACT'; id: string }
  | { type: 'TOGGLE_FAVORITE'; id: string }
  | { type: 'ADD_GROUP'; group: ContactGroup }
  | { type: 'UPDATE_GROUP'; id: string; updates: Partial<ContactGroup> }
  | { type: 'DELETE_GROUP'; id: string }
  | { type: 'ADD_CONTACT_TO_GROUP'; contactId: string; groupId: string }
  | { type: 'REMOVE_CONTACT_FROM_GROUP'; contactId: string; groupId: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_SELECTED_GROUP'; groupId: string | null }

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

const initialState: ContactsState = {
  contacts: [],
  groups: [],
  isLoading: true,
  error: null,
  searchQuery: '',
  selectedGroupId: null,
}

function contactsReducer(state: ContactsState, action: ContactsAction): ContactsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'SET_CONTACTS':
      return { ...state, contacts: action.contacts, isLoading: false }

    case 'SET_GROUPS':
      return { ...state, groups: action.groups }

    case 'SET_DATA':
      return { ...state, contacts: action.contacts, groups: action.groups, isLoading: false }

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }

    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.contact] }

    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.id ? { ...c, ...action.updates, updatedAt: new Date() } : c
        ),
      }

    case 'DELETE_CONTACT': {
      // Also remove from all groups
      const updatedGroups = state.groups.map((g) => ({
        ...g,
        contactIds: g.contactIds.filter((id) => id !== action.id),
      }))
      return {
        ...state,
        contacts: state.contacts.filter((c) => c.id !== action.id),
        groups: updatedGroups,
      }
    }

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.id ? { ...c, isFavorite: !c.isFavorite, updatedAt: new Date() } : c
        ),
      }

    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.group] }

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.id ? { ...g, ...action.updates, updatedAt: new Date() } : g
        ),
      }

    case 'DELETE_GROUP': {
      // Also remove group from all contacts
      const updatedContacts = state.contacts.map((c) => ({
        ...c,
        groups: c.groups.filter((gId) => gId !== action.id),
      }))
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.id),
        contacts: updatedContacts,
        selectedGroupId: state.selectedGroupId === action.id ? null : state.selectedGroupId,
      }
    }

    case 'ADD_CONTACT_TO_GROUP': {
      // Update both contact and group
      const updatedContacts = state.contacts.map((c) =>
        c.id === action.contactId
          ? { ...c, groups: [...new Set([...c.groups, action.groupId])], updatedAt: new Date() }
          : c
      )
      const updatedGroups = state.groups.map((g) =>
        g.id === action.groupId
          ? { ...g, contactIds: [...new Set([...g.contactIds, action.contactId])], updatedAt: new Date() }
          : g
      )
      return { ...state, contacts: updatedContacts, groups: updatedGroups }
    }

    case 'REMOVE_CONTACT_FROM_GROUP': {
      const updatedContacts = state.contacts.map((c) =>
        c.id === action.contactId
          ? { ...c, groups: c.groups.filter((gId) => gId !== action.groupId), updatedAt: new Date() }
          : c
      )
      const updatedGroups = state.groups.map((g) =>
        g.id === action.groupId
          ? { ...g, contactIds: g.contactIds.filter((cId) => cId !== action.contactId), updatedAt: new Date() }
          : g
      )
      return { ...state, contacts: updatedContacts, groups: updatedGroups }
    }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }

    case 'SET_SELECTED_GROUP':
      return { ...state, selectedGroupId: action.groupId }

    default:
      return state
  }
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

interface ContactsContextValue {
  contacts: Contact[]
  groups: ContactGroup[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedGroupId: string | null

  // Filtered contacts based on search and group
  filteredContacts: Contact[]
  favoriteContacts: Contact[]

  // Contact CRUD (async operations)
  addContact: (input: ContactCreateInput) => Promise<void>
  updateContact: (id: string, updates: ContactUpdateInput) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  getContactById: (id: string) => Contact | undefined
  getContactByEmail: (email: string) => Contact | undefined

  // Group CRUD (async operations)
  addGroup: (name: string, color: string) => Promise<void>
  updateGroup: (id: string, updates: Partial<ContactGroup>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  getGroupById: (id: string) => ContactGroup | undefined

  // Group membership (async operations)
  addContactToGroup: (contactId: string, groupId: string) => Promise<void>
  removeContactFromGroup: (contactId: string, groupId: string) => Promise<void>
  getContactsInGroup: (groupId: string) => Contact[]

  // UI state
  setSearch: (query: string) => void
  setSelectedGroup: (groupId: string | null) => void
}

const ContactsContext = createContext<ContactsContextValue | null>(null)

// --------------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------------

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contactsReducer, initialState)
  const { contacts: contactRepository, contactGroups: groupRepository } = useRepositories()

  // Load contacts and groups from repository on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [contactsResult, groups] = await Promise.all([
          contactRepository.getAll({ page: 1, pageSize: REPOSITORY.LOAD_ALL_PAGE_SIZE }),
          groupRepository.getAll(),
        ])
        dispatch({
          type: 'SET_DATA',
          contacts: contactsResult.data ?? [],
          groups: groups ?? [],
        })
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load contacts' })
      }
    }
    loadData()
  }, [contactRepository, groupRepository])

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    let filtered = state.contacts

    // Filter by group
    if (state.selectedGroupId) {
      filtered = filtered.filter((c) => c.groups.includes(state.selectedGroupId!))
    }

    // Filter by search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          (c.company?.toLowerCase().includes(query) ?? false)
      )
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [state.contacts, state.selectedGroupId, state.searchQuery])

  const favoriteContacts = useMemo(
    () => state.contacts.filter((c) => c.isFavorite).sort((a, b) => a.name.localeCompare(b.name)),
    [state.contacts]
  )

  // Contact CRUD
  const addContact = useCallback(async (input: ContactCreateInput) => {
    const result = await contactRepository.create(input)
    if (result.success) {
      dispatch({ type: 'ADD_CONTACT', contact: result.data })
    }
  }, [contactRepository])

  const updateContact = useCallback(async (id: string, updates: ContactUpdateInput) => {
    dispatch({ type: 'UPDATE_CONTACT', id, updates })
    await contactRepository.update(id, updates)
  }, [contactRepository])

  const deleteContact = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_CONTACT', id })
    await contactRepository.delete(id)
  }, [contactRepository])

  const toggleFavorite = useCallback(async (id: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', id })
    await contactRepository.toggleFavorite(id)
  }, [contactRepository])

  const getContactById = useCallback(
    (id: string) => state.contacts.find((c) => c.id === id),
    [state.contacts]
  )

  const getContactByEmail = useCallback(
    (email: string) => state.contacts.find((c) => c.email.toLowerCase() === email.toLowerCase()),
    [state.contacts]
  )

  // Group CRUD
  const addGroup = useCallback(async (name: string, color: string) => {
    const result = await groupRepository.create(name, color)
    if (result.success) {
      dispatch({ type: 'ADD_GROUP', group: result.data })
    }
  }, [groupRepository])

  const updateGroup = useCallback(async (id: string, updates: Partial<ContactGroup>) => {
    dispatch({ type: 'UPDATE_GROUP', id, updates })
    await groupRepository.update(id, updates)
  }, [groupRepository])

  const deleteGroup = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_GROUP', id })
    await groupRepository.delete(id)
  }, [groupRepository])

  const getGroupById = useCallback(
    (id: string) => state.groups.find((g) => g.id === id),
    [state.groups]
  )

  // Group membership
  const addContactToGroup = useCallback(async (contactId: string, groupId: string) => {
    dispatch({ type: 'ADD_CONTACT_TO_GROUP', contactId, groupId })
    await contactRepository.addToGroup(contactId, groupId)
  }, [contactRepository])

  const removeContactFromGroup = useCallback(async (contactId: string, groupId: string) => {
    dispatch({ type: 'REMOVE_CONTACT_FROM_GROUP', contactId, groupId })
    await contactRepository.removeFromGroup(contactId, groupId)
  }, [contactRepository])

  const getContactsInGroup = useCallback(
    (groupId: string) => state.contacts.filter((c) => c.groups.includes(groupId)),
    [state.contacts]
  )

  // UI state
  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', query })
  }, [])

  const setSelectedGroup = useCallback((groupId: string | null) => {
    dispatch({ type: 'SET_SELECTED_GROUP', groupId })
  }, [])

  // Memoized context value
  const value = useMemo<ContactsContextValue>(
    () => ({
      contacts: state.contacts,
      groups: state.groups,
      isLoading: state.isLoading,
      error: state.error,
      searchQuery: state.searchQuery,
      selectedGroupId: state.selectedGroupId,

      filteredContacts,
      favoriteContacts,

      addContact,
      updateContact,
      deleteContact,
      toggleFavorite,
      getContactById,
      getContactByEmail,

      addGroup,
      updateGroup,
      deleteGroup,
      getGroupById,

      addContactToGroup,
      removeContactFromGroup,
      getContactsInGroup,

      setSearch,
      setSelectedGroup,
    }),
    [
      state,
      filteredContacts,
      favoriteContacts,
      addContact,
      updateContact,
      deleteContact,
      toggleFavorite,
      getContactById,
      getContactByEmail,
      addGroup,
      updateGroup,
      deleteGroup,
      getGroupById,
      addContactToGroup,
      removeContactFromGroup,
      getContactsInGroup,
      setSearch,
      setSelectedGroup,
    ]
  )

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useContacts(): ContactsContextValue {
  const context = useContext(ContactsContext)
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider')
  }
  return context
}
