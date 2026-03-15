import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Settings } from '@/types';
import { ApiSettingsRepository } from '../ApiSettingsRepository';

vi.mock('@/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/services/apiClient';

const mockApiClient = apiClient as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockSettingsAPI = {
  appearance: {
    theme: 'light',
    density: 'comfortable',
    fontSize: 'medium',
  },
  notifications: {
    emailNotifications: true,
    desktopNotifications: false,
    soundEnabled: true,
    notifyOnNewEmail: true,
    notifyOnMention: false,
  },
  inboxBehavior: {
    defaultReplyBehavior: 'reply',
    sendBehavior: 'send',
    conversationView: true,
    readingPanePosition: 'right',
    autoAdvance: 'next',
    markAsReadDelay: 0,
  },
  language: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  signatures: [],
  vacationResponder: {
    enabled: false,
    subject: '',
    message: '',
    startDate: null,
    endDate: null,
    sendToContacts: false,
    sendToEveryone: false,
  },
  keyboardShortcuts: [],
  filters: [],
  blockedAddresses: [],
};

describe('ApiSettingsRepository', () => {
  let repo: ApiSettingsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ApiSettingsRepository();
  });

  describe('get', () => {
    it('calls GET /settings/ and returns mapped settings', async () => {
      mockApiClient.get.mockResolvedValue(mockSettingsAPI);

      const result = await repo.get();

      expect(mockApiClient.get).toHaveBeenCalledWith('/settings/');
      expect(result.appearance.theme).toBe('light');
      expect(result.language.language).toBe('en');
    });
  });

  describe('update', () => {
    it('calls PATCH /settings/ with body built from settings keys', async () => {
      const updates = { appearance: { theme: 'dark', density: 'comfortable', fontSize: 'medium' } };
      mockApiClient.patch.mockResolvedValue({ ...mockSettingsAPI, appearance: updates.appearance });

      const result = await repo.update(updates as Partial<Settings>);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/settings/', {
        appearance: updates.appearance,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('reset', () => {
    it('calls POST /settings/reset', async () => {
      mockApiClient.post.mockResolvedValue(mockSettingsAPI);

      const result = await repo.reset();

      expect(mockApiClient.post).toHaveBeenCalledWith('/settings/reset');
      expect(result.success).toBe(true);
    });
  });

  describe('addSignature', () => {
    it('calls POST /settings/signatures', async () => {
      mockApiClient.post.mockResolvedValue(mockSettingsAPI);

      const result = await repo.addSignature('Work', 'Best regards', true);

      expect(mockApiClient.post).toHaveBeenCalledWith('/settings/signatures', {
        name: 'Work',
        content: 'Best regards',
        isDefault: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateSignature', () => {
    it('calls PATCH /settings/signatures/{id}', async () => {
      mockApiClient.patch.mockResolvedValue(mockSettingsAPI);

      const result = await repo.updateSignature('s1', { name: 'Updated', content: 'Cheers' });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/settings/signatures/s1', {
        name: 'Updated',
        content: 'Cheers',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteSignature', () => {
    it('calls DELETE then refetches settings via get()', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);
      mockApiClient.get.mockResolvedValue(mockSettingsAPI);

      const result = await repo.deleteSignature('s1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/settings/signatures/s1');
      expect(mockApiClient.get).toHaveBeenCalledWith('/settings/');
      expect(result.success).toBe(true);
    });
  });

  describe('blockAddress', () => {
    it('calls POST /settings/blocked-addresses with email', async () => {
      mockApiClient.post.mockResolvedValue(mockSettingsAPI);

      const result = await repo.blockAddress('spam@test.com');

      expect(mockApiClient.post).toHaveBeenCalledWith('/settings/blocked-addresses', {
        email: 'spam@test.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('unblockAddress', () => {
    it('calls DELETE with encoded email then refetches settings', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);
      mockApiClient.get.mockResolvedValue(mockSettingsAPI);

      const result = await repo.unblockAddress('spam@test.com');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/settings/blocked-addresses/spam%40test.com',
      );
      expect(mockApiClient.get).toHaveBeenCalledWith('/settings/');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.unblockAddress('spam@test.com');
      expect(result.success).toBe(false);
    });
  });

  describe('updateAppearance', () => {
    it('delegates to update with appearance key', async () => {
      mockApiClient.patch.mockResolvedValue(mockSettingsAPI);

      const result = await repo.updateAppearance({ theme: 'dark' } as Settings['appearance']);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/settings/',
        expect.objectContaining({ appearance: expect.objectContaining({ theme: 'dark' }) }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updateNotifications', () => {
    it('delegates to update with notifications key', async () => {
      mockApiClient.patch.mockResolvedValue(mockSettingsAPI);

      const result = await repo.updateNotifications({
        emailNotifications: false,
      } as Settings['notifications']);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/settings/',
        expect.objectContaining({ notifications: expect.any(Object) }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updateInboxBehavior', () => {
    it('delegates to update with inboxBehavior key', async () => {
      mockApiClient.patch.mockResolvedValue(mockSettingsAPI);

      const result = await repo.updateInboxBehavior({
        conversationView: false,
      } as Settings['inboxBehavior']);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/settings/',
        expect.objectContaining({ inboxBehavior: expect.any(Object) }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updateLanguage', () => {
    it('delegates to update with language key', async () => {
      mockApiClient.patch.mockResolvedValue(mockSettingsAPI);

      const result = await repo.updateLanguage({ language: 'fr' } as Settings['language']);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/settings/',
        expect.objectContaining({ language: expect.any(Object) }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('addFilter', () => {
    it('calls POST /settings/filters', async () => {
      mockApiClient.post.mockResolvedValue(mockSettingsAPI);

      const result = await repo.addFilter({
        name: 'Test Filter',
        enabled: true,
        conditions: [],
        matchAll: true,
        actions: [],
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/settings/filters',
        expect.objectContaining({ name: 'Test Filter' }),
      );
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.addFilter({
        name: 'F',
        enabled: true,
        conditions: [],
        matchAll: true,
        actions: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateFilter', () => {
    it('calls PATCH /settings/filters/{id}', async () => {
      mockApiClient.patch.mockResolvedValue(mockSettingsAPI);

      const result = await repo.updateFilter('f1', { name: 'Updated Filter' });

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/settings/filters/f1',
        { name: 'Updated Filter' },
      );
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.updateFilter('f1', { name: 'Updated' });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteFilter', () => {
    it('calls DELETE /settings/filters/{id} then refetches settings', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);
      mockApiClient.get.mockResolvedValue(mockSettingsAPI);

      const result = await repo.deleteFilter('f1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/settings/filters/f1');
      expect(mockApiClient.get).toHaveBeenCalledWith('/settings/');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.deleteFilter('f1');
      expect(result.success).toBe(false);
    });
  });

  describe('error paths for existing methods', () => {
    it('update returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.update({ appearance: { theme: 'dark' } as Settings['appearance'] });
      expect(result.success).toBe(false);
    });

    it('reset returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.reset();
      expect(result.success).toBe(false);
    });

    it('addSignature returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.addSignature('Work', 'Best regards');
      expect(result.success).toBe(false);
    });

    it('updateSignature returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.updateSignature('s1', { name: 'Updated' });
      expect(result.success).toBe(false);
    });

    it('deleteSignature returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.deleteSignature('s1');
      expect(result.success).toBe(false);
    });

    it('blockAddress returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.blockAddress('spam@test.com');
      expect(result.success).toBe(false);
    });
  });
});
