import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiEmailRepository } from '../ApiEmailRepository';
import type { EmailCreateInput, FolderType, Email } from '@/types/email';

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

const mockEmailAPI = {
  id: 'e1',
  accountId: 'a1',
  accountColor: 'blue',
  from: { name: 'Alice', email: 'alice@test.com' },
  to: [{ name: 'Bob', email: 'bob@test.com' }],
  cc: [],
  bcc: [],
  subject: 'Test',
  preview: 'Preview',
  body: '<p>Body</p>',
  date: '2024-01-15T10:00:00Z',
  isRead: false,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox',
  labels: [],
  threadId: 't1',
  replyToId: null,
  forwardedFromId: null,
  isDraft: false,
  scheduledSendAt: null,
  snoozeUntil: null,
  snoozedFromFolder: null,
};

const mockPaginatedResponse = {
  data: [mockEmailAPI],
  page: 1,
  pageSize: 20,
  total: 1,
  totalPages: 1,
};

describe('ApiEmailRepository', () => {
  let repo: ApiEmailRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ApiEmailRepository();
  });

  describe('getById', () => {
    it('returns mapped email on success', async () => {
      mockApiClient.get.mockResolvedValue(mockEmailAPI);

      const result = await repo.getById('e1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/emails/e1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('e1');
      expect(result!.subject).toBe('Test');
      expect(result!.date).toBeInstanceOf(Date);
      expect(result!.cc).toBeUndefined();
      expect(result!.bcc).toBeUndefined();
    });

    it('returns null on error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));

      const result = await repo.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getByFolder', () => {
    it('calls GET /emails/ with correct params', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedResponse);

      await repo.getByFolder('inbox', 'a1', { page: 1, pageSize: 20 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/emails/', {
        folder: 'inbox',
        accountId: 'a1',
        page: 1,
        pageSize: 20,
      });
    });
  });

  describe('search', () => {
    it('calls GET /emails/ with search params', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedResponse);

      await repo.search({ text: 'hello world' }, { page: 1, pageSize: 20 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/emails/',
        expect.objectContaining({
          search: 'hello world',
          page: 1,
          pageSize: 20,
        }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('calls GET with isRead:false and returns total', async () => {
      mockApiClient.get.mockResolvedValue({ data: [], page: 1, pageSize: 1, total: 5, totalPages: 5 });

      const count = await repo.getUnreadCount('inbox', 'a1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/emails/', {
        folder: 'inbox',
        accountId: 'a1',
        isRead: false,
        pageSize: 1,
      });
      expect(count).toBe(5);
    });
  });

  describe('create', () => {
    it('calls POST /emails/ with input and returns success', async () => {
      mockApiClient.post.mockResolvedValue(mockEmailAPI);

      const input = {
        accountId: 'a1',
        to: [{ name: 'Bob', email: 'bob@test.com' }],
        subject: 'Test',
        body: '<p>Body</p>',
      };

      const result = await repo.create(input as EmailCreateInput);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/', expect.objectContaining({
        accountId: 'a1',
        to: [{ name: 'Bob', email: 'bob@test.com' }],
        subject: 'Test',
        body: '<p>Body</p>',
      }));
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe('e1');
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));

      const result = await repo.create({
        accountId: 'a1',
        to: [{ name: 'Bob', email: 'bob@test.com' }],
        subject: 'Test',
        body: '<p>Body</p>',
      } as EmailCreateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('update', () => {
    it('calls PATCH /emails/{id}', async () => {
      mockApiClient.patch.mockResolvedValue({ ...mockEmailAPI, isRead: true });

      const result = await repo.update('e1', { isRead: true });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/emails/e1', { isRead: true });
      expect(result.success).toBe(true);
    });
  });

  describe('delete', () => {
    it('calls DELETE /emails/{id}', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      const result = await repo.delete('e1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/emails/e1');
      expect(result.success).toBe(true);
    });
  });

  describe('deleteMany', () => {
    it('calls POST /emails/bulk with delete operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await repo.deleteMany(['e1', 'e2']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1', 'e2'],
        operation: 'delete',
      });
    });
  });

  describe('saveDraft', () => {
    it('creates new draft when email has no id', async () => {
      mockApiClient.post.mockResolvedValue(mockEmailAPI);

      const draft = {
        accountId: 'a1',
        to: [{ name: 'Bob', email: 'bob@test.com' }],
        subject: 'Draft',
        body: '<p>Draft body</p>',
      };

      const result = await repo.saveDraft(draft as Partial<Email>);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/draft', {
        accountId: 'a1',
        to: [{ name: 'Bob', email: 'bob@test.com' }],
        cc: [],
        bcc: [],
        subject: 'Draft',
        body: '<p>Draft body</p>',
      });
      expect(result.success).toBe(true);
    });

    it('updates existing draft when email has id', async () => {
      mockApiClient.patch.mockResolvedValue(mockEmailAPI);

      const draft = {
        id: 'e1',
        isRead: false,
      };

      const result = await repo.saveDraft(draft as Partial<Email>);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/emails/e1', {
        isRead: false,
        folder: 'drafts',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('moveToFolder', () => {
    it('calls POST /emails/bulk with move operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await repo.moveToFolder(['e1', 'e2'], 'archive' as FolderType);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1', 'e2'],
        operation: 'move',
        folder: 'archive',
      });
    });
  });

  describe('markAsRead', () => {
    it('calls POST /emails/bulk with markRead operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await repo.markAsRead(['e1', 'e2']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1', 'e2'],
        operation: 'markRead',
      });
    });
  });

  describe('addLabels', () => {
    it('calls POST /emails/bulk with addLabel and labelIds', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await repo.addLabels(['e1'], ['label1', 'label2']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1'],
        operation: 'addLabel',
        labelIds: ['label1', 'label2'],
      });
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.addLabels(['e1'], ['label1']);
      expect(result.success).toBe(false);
    });
  });

  describe('getByThread', () => {
    it('calls GET /emails/ with threadId and large pageSize', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await repo.getByThread('t1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/emails/', {
        threadId: 't1',
        pageSize: 200,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('e1');
    });
  });

  describe('getFolderCount', () => {
    it('calls GET /emails/ with folder and returns total', async () => {
      mockApiClient.get.mockResolvedValue({ data: [], page: 1, pageSize: 1, total: 7, totalPages: 7 });

      const count = await repo.getFolderCount('inbox', 'a1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/emails/', {
        folder: 'inbox',
        accountId: 'a1',
        pageSize: 1,
      });
      expect(count).toBe(7);
    });
  });

  describe('getStarred', () => {
    it('calls GET /emails/ with isStarred:true', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedResponse);

      await repo.getStarred('a1', { page: 2, pageSize: 25 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/emails/', {
        isStarred: true,
        accountId: 'a1',
        page: 2,
        pageSize: 25,
      });
    });
  });

  describe('updateMany', () => {
    it('calls markRead bulk when isRead is true', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      const result = await repo.updateMany(['e1'], { isRead: true });
      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', { ids: ['e1'], operation: 'markRead' });
      expect(result.success).toBe(true);
    });

    it('calls markUnread bulk when isRead is false', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      await repo.updateMany(['e1'], { isRead: false });
      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', { ids: ['e1'], operation: 'markUnread' });
    });

    it('calls star bulk when isStarred is true', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      await repo.updateMany(['e1'], { isStarred: true });
      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', { ids: ['e1'], operation: 'star' });
    });

    it('calls unstar bulk when isStarred is false', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      await repo.updateMany(['e1'], { isStarred: false });
      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', { ids: ['e1'], operation: 'unstar' });
    });

    it('calls move bulk when folder is set', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      await repo.updateMany(['e1'], { folder: 'archive' });
      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1'],
        operation: 'move',
        folder: 'archive',
      });
    });

    it('calls addLabel bulk when labels are set', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      await repo.updateMany(['e1'], { labels: ['l1'] });
      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1'],
        operation: 'addLabel',
        labelIds: ['l1'],
      });
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.updateMany(['e1'], { isRead: true });
      expect(result.success).toBe(false);
    });
  });

  describe('deletePermanently', () => {
    it('calls DELETE /emails/{id}/permanent', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      const result = await repo.deletePermanently('e1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/emails/e1/permanent');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.deletePermanently('e1');
      expect(result.success).toBe(false);
    });
  });

  describe('deletePermanentlyMany', () => {
    it('calls POST /emails/bulk with deletePermanent operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await repo.deletePermanentlyMany(['e1', 'e2']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1', 'e2'],
        operation: 'deletePermanent',
      });
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.deletePermanentlyMany(['e1']);
      expect(result.success).toBe(false);
    });
  });

  describe('archive', () => {
    it('calls POST /emails/bulk with archive operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.archive(['e1', 'e2']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1', 'e2'],
        operation: 'archive',
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.archive(['e1']);
      expect(result.success).toBe(false);
    });
  });

  describe('markAsSpam', () => {
    it('calls POST /emails/bulk with move to spam', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.markAsSpam(['e1']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1'],
        operation: 'move',
        folder: 'spam',
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.markAsSpam(['e1']);
      expect(result.success).toBe(false);
    });
  });

  describe('markAsUnread', () => {
    it('calls POST /emails/bulk with markUnread operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.markAsUnread(['e1', 'e2']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1', 'e2'],
        operation: 'markUnread',
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.markAsUnread(['e1']);
      expect(result.success).toBe(false);
    });
  });

  describe('toggleStar', () => {
    it('calls POST /emails/bulk with star operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.toggleStar(['e1']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1'],
        operation: 'star',
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.toggleStar(['e1']);
      expect(result.success).toBe(false);
    });
  });

  describe('removeLabels', () => {
    it('calls POST /emails/bulk with removeLabel operation', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      const result = await repo.removeLabels(['e1'], ['label1']);

      expect(mockApiClient.post).toHaveBeenCalledWith('/emails/bulk', {
        ids: ['e1'],
        operation: 'removeLabel',
        labelIds: ['label1'],
      });
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.removeLabels(['e1'], ['label1']);
      expect(result.success).toBe(false);
    });
  });

  describe('error paths for remaining methods', () => {
    it('update returns error on failure', async () => {
      mockApiClient.patch.mockRejectedValue(new Error('Server error'));
      const result = await repo.update('e1', { isRead: true });
      expect(result.success).toBe(false);
    });

    it('delete returns error on failure', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Server error'));
      const result = await repo.delete('e1');
      expect(result.success).toBe(false);
    });

    it('deleteMany returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.deleteMany(['e1']);
      expect(result.success).toBe(false);
    });

    it('moveToFolder returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.moveToFolder(['e1'], 'archive');
      expect(result.success).toBe(false);
    });

    it('markAsRead returns error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));
      const result = await repo.markAsRead(['e1']);
      expect(result.success).toBe(false);
    });
  });

  describe('search with additional query params', () => {
    it('maps isRead, isStarred, hasAttachment, folder, accountId, labels', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedResponse);

      await repo.search({
        isRead: true,
        isStarred: false,
        hasAttachment: true,
        folder: 'inbox',
        accountId: 'a1',
        labels: ['l1', 'l2'],
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/emails/',
        expect.objectContaining({
          isRead: true,
          isStarred: false,
          hasAttachment: true,
          folder: 'inbox',
          accountId: 'a1',
          labelIds: 'l1,l2',
        }),
      );
    });
  });

  describe('toEmail mapping edge cases', () => {
    it('maps cc and bcc arrays when non-empty', async () => {
      mockApiClient.get.mockResolvedValue({
        ...mockEmailAPI,
        cc: [{ name: 'CC', email: 'cc@test.com' }],
        bcc: [{ name: 'BCC', email: 'bcc@test.com' }],
      });

      const result = await repo.getById('e1');

      expect(result!.cc).toHaveLength(1);
      expect(result!.bcc).toHaveLength(1);
    });

    it('maps optional date fields when present', async () => {
      mockApiClient.get.mockResolvedValue({
        ...mockEmailAPI,
        scheduledSendAt: '2099-01-01T00:00:00Z',
        snoozeUntil: '2026-06-01T00:00:00Z',
        snoozedFromFolder: 'inbox',
        replyToId: 'parent-email',
        forwardedFromId: 'fwd-email',
      });

      const result = await repo.getById('e1');

      expect(result!.scheduledSendAt).toBeInstanceOf(Date);
      expect(result!.snoozeUntil).toBeInstanceOf(Date);
      expect(result!.snoozedFromFolder).toBe('inbox');
      expect(result!.replyToId).toBe('parent-email');
      expect(result!.forwardedFromId).toBe('fwd-email');
    });

    it('uses from_ field when from is absent', async () => {
      mockApiClient.get.mockResolvedValue({
        ...mockEmailAPI,
        from: undefined,
        from_: { name: 'Sender', email: 'sender@test.com' },
      });

      const result = await repo.getById('e1');

      expect(result!.from.name).toBe('Sender');
    });

    it('falls back to email id when threadId is null', async () => {
      mockApiClient.get.mockResolvedValue({ ...mockEmailAPI, threadId: null });

      const result = await repo.getById('e1');

      expect(result!.threadId).toBe('e1');
    });
  });
});
