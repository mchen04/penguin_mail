import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiAccountRepository } from '../ApiAccountRepository';

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

const mockAccountAPI = {
  id: 'acc1',
  email: 'alice@test.com',
  name: 'Alice',
  color: '#3b82f6',
  displayName: 'Alice Smith',
  signature: 'Best regards',
  isDefault: true,
};

describe('ApiAccountRepository', () => {
  let repo: ApiAccountRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ApiAccountRepository();
  });

  describe('getAll', () => {
    it('calls GET /accounts/ and maps results', async () => {
      mockApiClient.get.mockResolvedValue([mockAccountAPI]);

      const result = await repo.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/accounts/');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('acc1');
      expect(result[0].email).toBe('alice@test.com');
    });
  });

  describe('getById', () => {
    it('returns account on success', async () => {
      mockApiClient.get.mockResolvedValue(mockAccountAPI);

      const result = await repo.getById('acc1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/accounts/acc1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('acc1');
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));

      const result = await repo.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('calls POST /accounts/ with correct payload', async () => {
      mockApiClient.post.mockResolvedValue(mockAccountAPI);

      const input = {
        email: 'alice@test.com',
        name: 'Alice',
        color: '#3b82f6',
        displayName: 'Alice Smith',
        signature: 'Best regards',
      };

      await repo.create(input);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/accounts/',
        expect.objectContaining({
          email: 'alice@test.com',
          name: 'Alice',
          color: '#3b82f6',
          displayName: 'Alice Smith',
          signature: 'Best regards',
        }),
      );
    });
  });

  describe('delete', () => {
    it('calls DELETE /accounts/{id}', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await repo.delete('acc1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/accounts/acc1');
    });
  });

  describe('setDefault', () => {
    it('calls POST /accounts/{id}/set-default', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await repo.setDefault('acc1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/accounts/acc1/set-default');
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.setDefault('acc1');
      expect(result.success).toBe(false);
    });
  });

  describe('getDefault', () => {
    it('returns the account with isDefault:true', async () => {
      const second = { ...mockAccountAPI, id: 'acc2', isDefault: false };
      const first = { ...mockAccountAPI, id: 'acc1', isDefault: true };
      mockApiClient.get.mockResolvedValue([second, first]);

      const result = await repo.getDefault();

      expect(result!.id).toBe('acc1');
    });

    it('returns the first account when none is default', async () => {
      const a1 = { ...mockAccountAPI, id: 'acc1', isDefault: false };
      const a2 = { ...mockAccountAPI, id: 'acc2', isDefault: false };
      mockApiClient.get.mockResolvedValue([a1, a2]);

      const result = await repo.getDefault();

      expect(result!.id).toBe('acc1');
    });

    it('returns null when accounts list is empty', async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await repo.getDefault();

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('calls PATCH /accounts/{id} with provided fields only', async () => {
      mockApiClient.patch.mockResolvedValue(mockAccountAPI);

      const result = await repo.update('acc1', { name: 'Updated Alice', color: 'green' });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/accounts/acc1', {
        name: 'Updated Alice',
        color: 'green',
      });
      expect(result.success).toBe(true);
      expect(result.data!.id).toBe('acc1');
    });

    it('returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.update('acc1', { name: 'Alice' });
      expect(result.success).toBe(false);
    });
  });

  describe('create error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Conflict'));
      const result = await repo.create({ email: 'a@b.com', name: 'A' });
      expect(result.success).toBe(false);
    });
  });

  describe('delete error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Not found'));
      const result = await repo.delete('acc1');
      expect(result.success).toBe(false);
    });
  });
});
