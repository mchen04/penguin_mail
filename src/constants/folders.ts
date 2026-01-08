/**
 * Folder-related constants for email organization
 */

export const FOLDER_IDS = {
  INBOX: 'inbox',
  DRAFTS: 'drafts',
  SENT: 'sent',
  SPAM: 'spam',
  TRASH: 'trash',
} as const;

export type FolderId = typeof FOLDER_IDS[keyof typeof FOLDER_IDS];

/** Standard folders that appear for each account */
export const STANDARD_FOLDERS: FolderId[] = [
  FOLDER_IDS.INBOX,
  FOLDER_IDS.DRAFTS,
  FOLDER_IDS.SENT,
  FOLDER_IDS.SPAM,
  FOLDER_IDS.TRASH,
];

/** Identifier for viewing all accounts combined */
export const ALL_ACCOUNTS_ID = 'all';
