export type EmailProvider =
  | 'gmail'
  | 'yahoo'
  | 'outlook'
  | 'icloud'
  | 'aol'
  | 'zoho'
  | 'fastmail'
  | 'custom'

export interface ProviderPreset {
  key: EmailProvider
  label: string
  smtpHost: string
  smtpPort: number
  smtpSecurity: 'starttls' | 'ssl'
  imapHost: string
  imapPort: number
  imapSecurity: 'ssl'
}

export const PROVIDER_PRESETS: Record<Exclude<EmailProvider, 'custom'>, ProviderPreset> = {
  gmail: {
    key: 'gmail',
    label: 'Gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecurity: 'starttls',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecurity: 'ssl',
  },
  yahoo: {
    key: 'yahoo',
    label: 'Yahoo',
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: 465,
    smtpSecurity: 'ssl',
    imapHost: 'imap.mail.yahoo.com',
    imapPort: 993,
    imapSecurity: 'ssl',
  },
  outlook: {
    key: 'outlook',
    label: 'Outlook',
    smtpHost: 'smtp-mail.outlook.com',
    smtpPort: 587,
    smtpSecurity: 'starttls',
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    imapSecurity: 'ssl',
  },
  icloud: {
    key: 'icloud',
    label: 'iCloud',
    smtpHost: 'smtp.mail.me.com',
    smtpPort: 587,
    smtpSecurity: 'starttls',
    imapHost: 'imap.mail.me.com',
    imapPort: 993,
    imapSecurity: 'ssl',
  },
  aol: {
    key: 'aol',
    label: 'AOL',
    smtpHost: 'smtp.aol.com',
    smtpPort: 465,
    smtpSecurity: 'ssl',
    imapHost: 'imap.aol.com',
    imapPort: 993,
    imapSecurity: 'ssl',
  },
  zoho: {
    key: 'zoho',
    label: 'Zoho',
    smtpHost: 'smtp.zoho.com',
    smtpPort: 465,
    smtpSecurity: 'ssl',
    imapHost: 'imap.zoho.com',
    imapPort: 993,
    imapSecurity: 'ssl',
  },
  fastmail: {
    key: 'fastmail',
    label: 'Fastmail',
    smtpHost: 'smtp.fastmail.com',
    smtpPort: 587,
    smtpSecurity: 'starttls',
    imapHost: 'imap.fastmail.com',
    imapPort: 993,
    imapSecurity: 'ssl',
  },
}

export const PROVIDER_OPTIONS: { value: EmailProvider; label: string }[] = [
  { value: 'gmail', label: 'Gmail' },
  { value: 'yahoo', label: 'Yahoo' },
  { value: 'outlook', label: 'Outlook' },
  { value: 'icloud', label: 'iCloud' },
  { value: 'aol', label: 'AOL' },
  { value: 'zoho', label: 'Zoho' },
  { value: 'fastmail', label: 'Fastmail' },
  { value: 'custom', label: 'Custom' },
]

export const DOMAIN_TO_PROVIDER: Record<string, EmailProvider> = {
  'gmail.com': 'gmail',
  'googlemail.com': 'gmail',
  'yahoo.com': 'yahoo',
  'yahoo.co.uk': 'yahoo',
  'yahoo.ca': 'yahoo',
  'ymail.com': 'yahoo',
  'outlook.com': 'outlook',
  'hotmail.com': 'outlook',
  'live.com': 'outlook',
  'msn.com': 'outlook',
  'icloud.com': 'icloud',
  'me.com': 'icloud',
  'mac.com': 'icloud',
  'aol.com': 'aol',
  'zoho.com': 'zoho',
  'zohomail.com': 'zoho',
  'fastmail.com': 'fastmail',
  'fastmail.fm': 'fastmail',
}
