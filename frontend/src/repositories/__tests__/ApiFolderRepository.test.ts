import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiFolderRepository, ApiLabelRepository } from '../ApiFolderRepository';

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

const mockFolderAPI = {
  id: 'f1',
  name: 'Projects',
  color: '#10b981',
  parentId: null,
  order: 0,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockLabelAPI = {
  id: 'l1',
  name: 'Important',
  color: '#ef4444',
};

describe('ApiFolderRepository', () => {
  let repo: ApiFolderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ApiFolderRepository();
  });

  describe('getAll', () => {
    it('calls GET /folders/ and returns mapped folders', async () => {
      mockApiClient.get.mockResolvedValue([mockFolderAPI]);

      const result = await repo.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/folders/');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('f1');
      expect(result[0].name).toBe('Projects');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    it('calls POST /folders/ with name, color, and parentId', async () => {
      mockApiClient.post.mockResolvedValue(mockFolderAPI);

      const result = await repo.create('Projects', '#10b981', 'parent1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/folders/', {
        name: 'Projects',
        color: '#10b981',
        parentId: 'parent1',
      });
      expect(result.success).toBe(true);
    });

    it('sends parentId as null when not provided', async () => {
      mockApiClient.post.mockResolvedValue(mockFolderAPI);

      await repo.create('Projects', '#10b981');

      expect(mockApiClient.post).toHaveBeenCalledWith('/folders/', {
        name: 'Projects',
        color: '#10b981',
        parentId: null,
      });
    });
  });

  describe('delete', () => {
    it('calls DELETE /folders/{id}', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      const result = await repo.delete('f1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/folders/f1');
      expect(result.success).toBe(true);
    });
  });

  describe('reorder', () => {
    it('calls POST /folders/{folderId}/reorder with newOrder query param', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.reorder('f1', 3);

      expect(mockApiClient.post).toHaveBeenCalledWith('/folders/f1/reorder?newOrder=3', undefined);
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.reorder('f1', 3);
      expect(result.success).toBe(false);
    });
  });

  describe('getById', () => {
    it('returns folder on success', async () => {
      mockApiClient.get.mockResolvedValue(mockFolderAPI);

      const result = await repo.getById('f1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/folders/f1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('f1');
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));

      const result = await repo.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('calls PATCH /folders/{id} with provided fields', async () => {
      mockApiClient.patch.mockResolvedValue({ ...mockFolderAPI, name: 'Renamed' });

      const result = await repo.update('f1', { name: 'Renamed', color: '#ff0000' });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/folders/f1', {
        name: 'Renamed',
        color: '#ff0000',
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.update('f1', { name: 'Renamed' });
      expect(result.success).toBe(false);
    });
  });

  describe('create error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.create('Projects', '#10b981');
      expect(result.success).toBe(false);
    });
  });

  describe('delete error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.delete('f1');
      expect(result.success).toBe(false);
    });
  });
});

describe('ApiLabelRepository', () => {
  let repo: ApiLabelRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ApiLabelRepository();
  });

  describe('getAll', () => {
    it('calls GET /labels/ and returns mapped labels', async () => {
      mockApiClient.get.mockResolvedValue([mockLabelAPI]);

      const result = await repo.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/labels/');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('l1');
      expect(result[0].name).toBe('Important');
    });
  });

  describe('create', () => {
    it('calls POST /labels/ with name and color', async () => {
      mockApiClient.post.mockResolvedValue(mockLabelAPI);

      const result = await repo.create('Important', '#ef4444');

      expect(mockApiClient.post).toHaveBeenCalledWith('/labels/', {
        name: 'Important',
        color: '#ef4444',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('update', () => {
    it('calls PATCH /labels/{id} with data', async () => {
      mockApiClient.patch.mockResolvedValue({ ...mockLabelAPI, name: 'Critical' });

      const result = await repo.update('l1', { name: 'Critical' });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/labels/l1', { name: 'Critical' });
      expect(result.success).toBe(true);
    });
  });

  describe('delete', () => {
    it('calls DELETE /labels/{id}', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      const result = await repo.delete('l1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/labels/l1');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.delete('l1');
      expect(result.success).toBe(false);
    });
  });

  describe('getById', () => {
    it('returns label on success', async () => {
      mockApiClient.get.mockResolvedValue(mockLabelAPI);

      const result = await repo.getById('l1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/labels/l1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('l1');
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));

      const result = await repo.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.create('Important', '#ef4444');
      expect(result.success).toBe(false);
    });
  });

  describe('update error path', () => {
    it('returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.update('l1', { name: 'Critical' });
      expect(result.success).toBe(false);
    });
  });
});
