import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiContactRepository, ApiContactGroupRepository } from '../ApiContactRepository';
import type { ContactCreateInput } from '@/types/contact';

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

const mockContactAPI = {
  id: 'c1',
  name: 'Alice',
  email: 'alice@test.com',
  phone: '555-0100',
  company: 'TestCorp',
  notes: '',
  avatar: '',
  isFavorite: false,
  groups: [],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockPaginatedContactResponse = {
  data: [mockContactAPI],
  page: 1,
  pageSize: 20,
  total: 1,
  totalPages: 1,
};

describe('ApiContactRepository', () => {
  let repo: ApiContactRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ApiContactRepository();
  });

  describe('getAll', () => {
    it('calls GET /contacts/ and returns paginated contacts', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedContactResponse);

      const result = await repo.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/', {
        page: undefined,
        pageSize: undefined,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('c1');
    });
  });

  describe('search', () => {
    it('calls GET /contacts/search with q param', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedContactResponse);

      const result = await repo.search('alice');

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/search', {
        q: 'alice',
        page: undefined,
        pageSize: undefined,
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('calls POST /contacts/ with input', async () => {
      mockApiClient.post.mockResolvedValue(mockContactAPI);

      const input = {
        name: 'Alice',
        email: 'alice@test.com',
        phone: '555-0100',
        company: 'TestCorp',
      };

      const result = await repo.create(input as ContactCreateInput);

      expect(mockApiClient.post).toHaveBeenCalledWith('/contacts/', expect.objectContaining({
        email: 'alice@test.com',
        name: 'Alice',
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('update', () => {
    it('calls PATCH /contacts/{id}', async () => {
      mockApiClient.patch.mockResolvedValue({ ...mockContactAPI, name: 'Alice Updated' });

      const result = await repo.update('c1', { name: 'Alice Updated' });

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/contacts/c1',
        expect.objectContaining({ name: 'Alice Updated' }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('delete', () => {
    it('calls DELETE /contacts/{id}', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      const result = await repo.delete('c1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/contacts/c1');
      expect(result.success).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('calls POST /contacts/{id}/toggle-favorite', async () => {
      mockApiClient.post.mockResolvedValue({ ...mockContactAPI, isFavorite: true });

      const result = await repo.toggleFavorite('c1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/contacts/c1/toggle-favorite');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.toggleFavorite('c1');
      expect(result.success).toBe(false);
    });
  });

  describe('getById', () => {
    it('returns contact on success', async () => {
      mockApiClient.get.mockResolvedValue(mockContactAPI);

      const result = await repo.getById('c1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/c1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('c1');
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));
      const result = await repo.getById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getByEmail', () => {
    it('calls GET /contacts/by-email/{encoded} and returns contact', async () => {
      mockApiClient.get.mockResolvedValue(mockContactAPI);

      const result = await repo.getByEmail('alice@test.com');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/contacts/by-email/alice%40test.com',
      );
      expect(result!.email).toBe('alice@test.com');
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));
      const result = await repo.getByEmail('noone@test.com');
      expect(result).toBeNull();
    });
  });

  describe('getFavorites', () => {
    it('calls GET /contacts/favorites and returns list', async () => {
      mockApiClient.get.mockResolvedValue([mockContactAPI]);

      const result = await repo.getFavorites();

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/favorites');
      expect(result).toHaveLength(1);
    });
  });

  describe('getByGroup', () => {
    it('calls GET /contacts/by-group/{id} and returns list', async () => {
      mockApiClient.get.mockResolvedValue([mockContactAPI]);

      const result = await repo.getByGroup('g1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/by-group/g1');
      expect(result).toHaveLength(1);
    });
  });

  describe('addToGroup', () => {
    it('calls POST /contacts/{id}/add-to-group/{groupId}', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.addToGroup('c1', 'g1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/contacts/c1/add-to-group/g1');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.addToGroup('c1', 'g1');
      expect(result.success).toBe(false);
    });
  });

  describe('removeFromGroup', () => {
    it('calls POST /contacts/{id}/remove-from-group/{groupId}', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.removeFromGroup('c1', 'g1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/contacts/c1/remove-from-group/g1');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.removeFromGroup('c1', 'g1');
      expect(result.success).toBe(false);
    });
  });

  describe('create error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Conflict'));
      const result = await repo.create({ name: 'Alice', email: 'a@b.com' } as ContactCreateInput);
      expect(result.success).toBe(false);
    });
  });

  describe('update error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.update('c1', { name: 'Alice' });
      expect(result.success).toBe(false);
    });
  });

  describe('update with all optional fields', () => {
    it('includes all optional fields in patch body when all are provided', async () => {
      mockApiClient.patch.mockResolvedValue({
        ...mockContactAPI,
        email: 'newalice@test.com',
        avatar: 'data:image/png;base64,abc',
        phone: '555-9999',
        company: 'NewCorp',
        notes: 'VIP client',
        isFavorite: true,
        groups: ['g1'],
      });

      const result = await repo.update('c1', {
        email: 'newalice@test.com',
        avatar: 'data:image/png;base64,abc',
        phone: '555-9999',
        company: 'NewCorp',
        notes: 'VIP client',
        isFavorite: true,
        groups: ['g1'],
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/contacts/c1', expect.objectContaining({
        email: 'newalice@test.com',
        phone: '555-9999',
        isFavorite: true,
      }));
      expect(result.success).toBe(true);
    });

    it('omits name from patch body when name is not in the update', async () => {
      mockApiClient.patch.mockResolvedValue({ ...mockContactAPI, email: 'other@test.com' });

      const result = await repo.update('c1', { email: 'other@test.com' });

      const callArgs = mockApiClient.patch.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs).not.toHaveProperty('name');
      expect(result.success).toBe(true);
    });
  });

  describe('toContact with null avatar/phone/company/notes', () => {
    it('maps null avatar, phone, company, notes to undefined', async () => {
      mockApiClient.patch.mockResolvedValue({
        ...mockContactAPI,
        avatar: null,
        phone: null,
        company: null,
        notes: null,
      });

      const result = await repo.update('c1', { name: 'Alice' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.avatar).toBeUndefined();
        expect(result.data.phone).toBeUndefined();
        expect(result.data.company).toBeUndefined();
        expect(result.data.notes).toBeUndefined();
      }
    });
  });

  describe('delete error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.delete('c1');
      expect(result.success).toBe(false);
    });
  });
});

const mockGroupAPI = {
  id: 'g1',
  name: 'Work',
  color: '#3b82f6',
  contactIds: ['c1'],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('ApiContactGroupRepository', () => {
  let repo: ApiContactGroupRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ApiContactGroupRepository();
  });

  describe('getAll', () => {
    it('calls GET /contact-groups/ and returns mapped groups', async () => {
      mockApiClient.get.mockResolvedValue([mockGroupAPI]);

      const result = await repo.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/contact-groups/');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('g1');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getById', () => {
    it('returns group on success', async () => {
      mockApiClient.get.mockResolvedValue(mockGroupAPI);

      const result = await repo.getById('g1');

      expect(result!.id).toBe('g1');
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));
      const result = await repo.getById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('calls POST /contact-groups/ with name and color', async () => {
      mockApiClient.post.mockResolvedValue(mockGroupAPI);

      const result = await repo.create('Work', '#3b82f6');

      expect(mockApiClient.post).toHaveBeenCalledWith('/contact-groups/', {
        name: 'Work',
        color: '#3b82f6',
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.create('Work', '#3b82f6');
      expect(result.success).toBe(false);
    });
  });

  describe('update', () => {
    it('calls PATCH /contact-groups/{id}', async () => {
      mockApiClient.patch.mockResolvedValue({ ...mockGroupAPI, name: 'Updated' });

      const result = await repo.update('g1', { name: 'Updated', color: '#ff0000' });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/contact-groups/g1', {
        name: 'Updated',
        color: '#ff0000',
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.update('g1', { name: 'Updated' });
      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('calls DELETE /contact-groups/{id}', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      const result = await repo.delete('g1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/contact-groups/g1');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.delete('g1');
      expect(result.success).toBe(false);
    });
  });
});
