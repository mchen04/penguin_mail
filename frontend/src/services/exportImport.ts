/**
 * Export/Import Service
 * Provides functionality to export and import data from the email client
 */

import { storage, STORAGE_KEYS } from './storage'
import type { Email } from '@/types/email'
import type { Contact, ContactGroup } from '@/types/contact'
import type { Settings } from '@/types/settings'

export interface ExportData {
  version: string
  exportedAt: string
  emails?: Email[]
  contacts?: Contact[]
  contactGroups?: ContactGroup[]
  settings?: Settings
  savedSearches?: unknown[]
  emailTemplates?: unknown[]
}

/**
 * Export all data to a JSON file
 */
export async function exportAllData(): Promise<string> {
  const [emails, contacts, contactGroups, settings, savedSearches, emailTemplates] = await Promise.all([
    storage.get<Email[]>(STORAGE_KEYS.EMAILS),
    storage.get<Contact[]>(STORAGE_KEYS.CONTACTS),
    storage.get<ContactGroup[]>(STORAGE_KEYS.CONTACT_GROUPS),
    storage.get<Settings>(STORAGE_KEYS.SETTINGS),
    storage.get(STORAGE_KEYS.SAVED_SEARCHES),
    storage.get(STORAGE_KEYS.EMAIL_TEMPLATES),
  ])

  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    emails: emails ?? [],
    contacts: contacts ?? [],
    contactGroups: contactGroups ?? [],
    settings: settings ?? undefined,
    savedSearches: (savedSearches as unknown[]) ?? [],
    emailTemplates: (emailTemplates as unknown[]) ?? [],
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export contacts to CSV format
 */
export async function exportContactsToCSV(): Promise<string> {
  const contacts = await storage.get<Contact[]>(STORAGE_KEYS.CONTACTS)
  if (!contacts || contacts.length === 0) {
    return 'Name,Email,Phone,Company,Notes\n'
  }

  const headers = ['Name', 'Email', 'Phone', 'Company', 'Notes']
  const rows = contacts.map((contact) => [
    escapeCSV(contact.name),
    escapeCSV(contact.email),
    escapeCSV(contact.phone || ''),
    escapeCSV(contact.company || ''),
    escapeCSV(contact.notes || ''),
  ])

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

/**
 * Export emails to a simple format (JSON)
 */
export async function exportEmails(): Promise<string> {
  const emails = await storage.get<Email[]>(STORAGE_KEYS.EMAILS)

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    emails: emails ?? [],
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Import data from a JSON file
 */
export async function importData(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString) as ExportData

    if (!data.version) {
      return { success: false, message: 'Invalid export file format' }
    }

    // Import contacts if present
    if (data.contacts && data.contacts.length > 0) {
      const existingContacts = await storage.get<Contact[]>(STORAGE_KEYS.CONTACTS) ?? []
      const existingEmails = new Set(existingContacts.map((c) => c.email.toLowerCase()))

      const newContacts = data.contacts.filter(
        (c) => !existingEmails.has(c.email.toLowerCase())
      )

      if (newContacts.length > 0) {
        await storage.set(STORAGE_KEYS.CONTACTS, [...existingContacts, ...newContacts])
      }
    }

    // Import contact groups if present
    if (data.contactGroups && data.contactGroups.length > 0) {
      const existingGroups = await storage.get<ContactGroup[]>(STORAGE_KEYS.CONTACT_GROUPS) ?? []
      const existingNames = new Set(existingGroups.map((g) => g.name.toLowerCase()))

      const newGroups = data.contactGroups.filter(
        (g) => !existingNames.has(g.name.toLowerCase())
      )

      if (newGroups.length > 0) {
        await storage.set(STORAGE_KEYS.CONTACT_GROUPS, [...existingGroups, ...newGroups])
      }
    }

    // Import saved searches if present
    if (data.savedSearches && data.savedSearches.length > 0) {
      await storage.set(STORAGE_KEYS.SAVED_SEARCHES, data.savedSearches)
    }

    // Import email templates if present
    if (data.emailTemplates && data.emailTemplates.length > 0) {
      await storage.set(STORAGE_KEYS.EMAIL_TEMPLATES, data.emailTemplates)
    }

    return { success: true, message: 'Data imported successfully' }
  } catch {
    return { success: false, message: 'Failed to parse import file' }
  }
}

/**
 * Import contacts from CSV format
 */
export async function importContactsFromCSV(csvString: string): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const lines = csvString.trim().split('\n')
    if (lines.length < 2) {
      return { success: false, message: 'CSV file is empty or has no data rows', count: 0 }
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
    const nameIdx = headers.findIndex((h) => h === 'name' || h === 'full name' || h === 'fullname')
    const emailIdx = headers.findIndex((h) => h === 'email' || h === 'e-mail' || h === 'email address')
    const phoneIdx = headers.findIndex((h) => h === 'phone' || h === 'telephone' || h === 'mobile')
    const companyIdx = headers.findIndex((h) => h === 'company' || h === 'organization')
    const notesIdx = headers.findIndex((h) => h === 'notes' || h === 'note' || h === 'comments')

    if (emailIdx === -1) {
      return { success: false, message: 'CSV must have an Email column', count: 0 }
    }

    const existingContacts = await storage.get<Contact[]>(STORAGE_KEYS.CONTACTS) ?? []
    const existingEmails = new Set(existingContacts.map((c) => c.email.toLowerCase()))

    const newContacts: Contact[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const email = values[emailIdx]?.trim()

      if (!email || !email.includes('@') || existingEmails.has(email.toLowerCase())) {
        continue
      }

      const contact: Contact = {
        id: `imported-${Date.now()}-${i}`,
        name: values[nameIdx]?.trim() || email.split('@')[0],
        email,
        phone: phoneIdx >= 0 ? values[phoneIdx]?.trim() : undefined,
        company: companyIdx >= 0 ? values[companyIdx]?.trim() : undefined,
        notes: notesIdx >= 0 ? values[notesIdx]?.trim() : undefined,
        isFavorite: false,
        groups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      newContacts.push(contact)
      existingEmails.add(email.toLowerCase())
    }

    if (newContacts.length > 0) {
      await storage.set(STORAGE_KEYS.CONTACTS, [...existingContacts, ...newContacts])
    }

    return {
      success: true,
      message: `Imported ${newContacts.length} contacts`,
      count: newContacts.length,
    }
  } catch {
    return { success: false, message: 'Failed to parse CSV file', count: 0 }
  }
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper functions

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
