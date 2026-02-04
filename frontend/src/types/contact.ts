/**
 * Contact types for the email client
 */

export interface Contact {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  company?: string
  notes?: string
  isFavorite: boolean
  groups: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ContactGroup {
  id: string
  name: string
  color: string
  contactIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ContactCreateInput {
  email: string
  name: string
  avatar?: string
  phone?: string
  company?: string
  notes?: string
  groups?: string[]
}

export interface ContactUpdateInput {
  email?: string
  name?: string
  avatar?: string
  phone?: string
  company?: string
  notes?: string
  isFavorite?: boolean
  groups?: string[]
}
