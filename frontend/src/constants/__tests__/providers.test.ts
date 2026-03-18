/**
 * Tests for provider presets, options, and domain-to-provider mapping.
 */
import { describe, it, expect } from 'vitest'
import {
  PROVIDER_PRESETS,
  PROVIDER_OPTIONS,
  DOMAIN_TO_PROVIDER,
  type EmailProvider,
  type ProviderPreset,
} from '../providers'

describe('PROVIDER_PRESETS', () => {
  const providers: Exclude<EmailProvider, 'custom'>[] = [
    'gmail', 'yahoo', 'outlook', 'icloud', 'aol', 'zoho', 'fastmail',
  ]

  it('has an entry for every non-custom provider', () => {
    for (const p of providers) {
      expect(PROVIDER_PRESETS[p]).toBeDefined()
    }
  })

  it.each(providers)('%s preset has correct shape', (key) => {
    const preset: ProviderPreset = PROVIDER_PRESETS[key]
    expect(preset.key).toBe(key)
    expect(preset.label).toBeTruthy()
    expect(preset.smtpHost).toMatch(/smtp/)
    expect(preset.smtpPort).toBeGreaterThan(0)
    expect(['starttls', 'ssl']).toContain(preset.smtpSecurity)
    expect(preset.imapHost).toMatch(/imap|outlook/)
    expect(preset.imapPort).toBe(993)
    expect(preset.imapSecurity).toBe('ssl')
  })

  it('gmail preset has correct SMTP settings', () => {
    const gmail = PROVIDER_PRESETS.gmail
    expect(gmail.smtpHost).toBe('smtp.gmail.com')
    expect(gmail.smtpPort).toBe(587)
    expect(gmail.smtpSecurity).toBe('starttls')
    expect(gmail.imapHost).toBe('imap.gmail.com')
  })

  it('yahoo preset uses SSL on port 465', () => {
    expect(PROVIDER_PRESETS.yahoo.smtpPort).toBe(465)
    expect(PROVIDER_PRESETS.yahoo.smtpSecurity).toBe('ssl')
  })

  it('outlook preset has correct host', () => {
    expect(PROVIDER_PRESETS.outlook.smtpHost).toBe('smtp-mail.outlook.com')
    expect(PROVIDER_PRESETS.outlook.imapHost).toBe('outlook.office365.com')
  })
})

describe('PROVIDER_OPTIONS', () => {
  it('has 8 entries including custom', () => {
    expect(PROVIDER_OPTIONS).toHaveLength(8)
  })

  it('includes all known providers and custom', () => {
    const values = PROVIDER_OPTIONS.map((o) => o.value)
    expect(values).toContain('gmail')
    expect(values).toContain('yahoo')
    expect(values).toContain('outlook')
    expect(values).toContain('icloud')
    expect(values).toContain('aol')
    expect(values).toContain('zoho')
    expect(values).toContain('fastmail')
    expect(values).toContain('custom')
  })

  it('every option has a non-empty label', () => {
    for (const opt of PROVIDER_OPTIONS) {
      expect(opt.label).toBeTruthy()
    }
  })

  it('custom is the last option', () => {
    expect(PROVIDER_OPTIONS[PROVIDER_OPTIONS.length - 1].value).toBe('custom')
  })
})

describe('DOMAIN_TO_PROVIDER', () => {
  it('maps gmail.com to gmail', () => {
    expect(DOMAIN_TO_PROVIDER['gmail.com']).toBe('gmail')
  })

  it('maps googlemail.com to gmail', () => {
    expect(DOMAIN_TO_PROVIDER['googlemail.com']).toBe('gmail')
  })

  it('maps hotmail.com to outlook', () => {
    expect(DOMAIN_TO_PROVIDER['hotmail.com']).toBe('outlook')
  })

  it('maps live.com to outlook', () => {
    expect(DOMAIN_TO_PROVIDER['live.com']).toBe('outlook')
  })

  it('maps me.com to icloud', () => {
    expect(DOMAIN_TO_PROVIDER['me.com']).toBe('icloud')
  })

  it('maps yahoo variant domains to yahoo', () => {
    expect(DOMAIN_TO_PROVIDER['yahoo.com']).toBe('yahoo')
    expect(DOMAIN_TO_PROVIDER['yahoo.co.uk']).toBe('yahoo')
    expect(DOMAIN_TO_PROVIDER['ymail.com']).toBe('yahoo')
  })

  it('maps fastmail.fm to fastmail', () => {
    expect(DOMAIN_TO_PROVIDER['fastmail.fm']).toBe('fastmail')
  })

  it('maps zohomail.com to zoho', () => {
    expect(DOMAIN_TO_PROVIDER['zohomail.com']).toBe('zoho')
  })

  it('returns undefined for unknown domains', () => {
    expect(DOMAIN_TO_PROVIDER['unknown-domain.com']).toBeUndefined()
  })
})
