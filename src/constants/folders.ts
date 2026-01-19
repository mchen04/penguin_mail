/**
 * Folder-related constants for email organization
 */

import type { SystemFolderType } from '@/types/email'

export const FOLDER_IDS = {
  INBOX: 'inbox',
  DRAFTS: 'drafts',
  SENT: 'sent',
  SPAM: 'spam',
  TRASH: 'trash',
  ARCHIVE: 'archive',
  STARRED: 'starred',
} as const;

export type FolderId = typeof FOLDER_IDS[keyof typeof FOLDER_IDS];

/** Standard folders that appear for each account (sidebar) */
export const STANDARD_FOLDERS: SystemFolderType[] = [
  FOLDER_IDS.INBOX,
  FOLDER_IDS.DRAFTS,
  FOLDER_IDS.SENT,
  FOLDER_IDS.SPAM,
  FOLDER_IDS.TRASH,
];

/** Identifier for viewing all accounts combined */
export const ALL_ACCOUNTS_ID = 'all';
