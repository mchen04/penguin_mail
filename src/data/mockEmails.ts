import type { Email } from '@/types/email'
import type { AccountColor } from '@/types/account'

// Helper to create dates relative to now
const daysAgo = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

const hoursAgo = (hours: number): Date => {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date
}

// Type-safe account colors
const colors = {
  blue: 'blue',
  green: 'green',
} as const satisfies Record<string, AccountColor>

export const mockEmails: Email[] = [
  // Work account emails (blue)
  {
    id: '1',
    accountId: 'work',
    accountColor: colors.blue,
    from: { name: 'Sarah Chen', email: 'sarah.chen@company.com' },
    to: [{ name: 'Me', email: 'me@work.com' }],
    subject: 'Q4 Planning Meeting - Action Items',
    preview: 'Hi team, following up on our planning session yesterday. Here are the key action items we discussed...',
    body: `<p>Hi team,</p>
<p>Following up on our planning session yesterday. Here are the key action items we discussed:</p>
<ul>
<li>Complete budget review by Friday</li>
<li>Schedule stakeholder interviews</li>
<li>Draft initial roadmap proposal</li>
</ul>
<p>Let me know if you have any questions!</p>
<p>Best,<br/>Sarah</p>`,
    date: hoursAgo(1),
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    folder: 'inbox',
    threadId: 'thread-1',
  },
  {
    id: '2',
    accountId: 'work',
    accountColor: colors.blue,
    from: { name: 'GitHub', email: 'notifications@github.com' },
    to: [{ name: 'Me', email: 'me@work.com' }],
    subject: '[penguin-mail] PR #142: Fix sidebar collapse animation',
    preview: '@developer requested your review on this pull request. Changes include animation timing adjustments...',
    body: `<p><strong>@developer</strong> requested your review on this pull request.</p>
<p>Changes include:</p>
<ul>
<li>Animation timing adjustments</li>
<li>Mobile responsive fixes</li>
<li>Accessibility improvements</li>
</ul>`,
    date: hoursAgo(3),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '3',
    accountId: 'work',
    accountColor: colors.blue,
    from: { name: 'HR Team', email: 'hr@company.com' },
    to: [{ name: 'All Staff', email: 'all@company.com' }],
    subject: 'Holiday Schedule 2024 - Office Closure Dates',
    preview: 'Please find attached the holiday schedule for 2024. The office will be closed on the following dates...',
    body: `<p>Dear Team,</p>
<p>Please find attached the holiday schedule for 2024. The office will be closed on the following dates:</p>
<ul>
<li>Dec 24-25: Christmas</li>
<li>Dec 31 - Jan 1: New Year</li>
</ul>
<p>Best regards,<br/>HR Team</p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    folder: 'inbox',
  },
  {
    id: '4',
    accountId: 'work',
    accountColor: colors.blue,
    from: { name: 'Slack', email: 'notifications@slack.com' },
    to: [{ name: 'Me', email: 'me@work.com' }],
    subject: 'New messages in #general',
    preview: 'You have 5 new messages in channels you follow. Click here to view them in Slack...',
    body: `<p>You have 5 new messages in channels you follow.</p>
<p><a href="#">Click here to view them in Slack</a></p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },

  // Personal account emails (green)
  {
    id: '5',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Amazon', email: 'ship-confirm@amazon.com' },
    to: [{ name: 'Me', email: 'me@personal.com' }],
    subject: 'Your order has shipped!',
    preview: 'Great news! Your order #123-4567890 has shipped and is on its way. Track your package...',
    body: `<p>Great news!</p>
<p>Your order #123-4567890 has shipped and is on its way.</p>
<p><strong>Estimated delivery:</strong> Tomorrow by 9pm</p>
<p><a href="#">Track your package</a></p>`,
    date: hoursAgo(2),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '6',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Mom', email: 'mom@family.com' },
    to: [{ name: 'Me', email: 'me@personal.com' }],
    subject: 'Dinner this weekend?',
    preview: "Hi honey! Dad and I were wondering if you'd like to come over for dinner this Saturday. We're making...",
    body: `<p>Hi honey!</p>
<p>Dad and I were wondering if you'd like to come over for dinner this Saturday. We're making your favorite lasagna!</p>
<p>Let us know if you can make it.</p>
<p>Love,<br/>Mom</p>`,
    date: hoursAgo(5),
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    folder: 'inbox',
    threadId: 'thread-2',
  },
  {
    id: '7',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Netflix', email: 'info@netflix.com' },
    to: [{ name: 'Me', email: 'me@personal.com' }],
    subject: 'New on Netflix: Shows you might like',
    preview: "Based on your viewing history, we think you'll love these new releases. Start watching now...",
    body: `<p>Based on your viewing history, we think you'll love these new releases:</p>
<ul>
<li>The Crown - Season 6</li>
<li>Stranger Things - Season 5</li>
<li>Wednesday - Season 2</li>
</ul>
<p><a href="#">Start watching now</a></p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '8',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Bank of America', email: 'alerts@bankofamerica.com' },
    to: [{ name: 'Me', email: 'me@personal.com' }],
    subject: 'Your statement is ready',
    preview: 'Your December statement is now available. Log in to view your account activity and download...',
    body: `<p>Your December statement is now available.</p>
<p>Log in to view your account activity and download your statement.</p>
<p><a href="#">View Statement</a></p>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '9',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Spotify', email: 'no-reply@spotify.com' },
    to: [{ name: 'Me', email: 'me@personal.com' }],
    subject: 'Your 2024 Wrapped is here!',
    preview: "See your top songs, artists, and podcasts of 2024. You listened to 45,000 minutes of music this year...",
    body: `<p>Your 2024 Wrapped is here!</p>
<p>See your top songs, artists, and podcasts of 2024.</p>
<p><strong>Minutes listened:</strong> 45,000</p>
<p><strong>Top artist:</strong> Taylor Swift</p>
<p><a href="#">View your Wrapped</a></p>`,
    date: daysAgo(5),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },

  // Sent emails
  {
    id: '10',
    accountId: 'work',
    accountColor: colors.blue,
    from: { name: 'Me', email: 'me@work.com' },
    to: [{ name: 'Sarah Chen', email: 'sarah.chen@company.com' }],
    subject: 'Re: Q4 Planning Meeting - Action Items',
    preview: 'Thanks Sarah! I\'ll have the budget review ready by Thursday. Quick question about the stakeholder...',
    body: `<p>Thanks Sarah!</p>
<p>I'll have the budget review ready by Thursday. Quick question about the stakeholder interviews - should we prioritize internal or external stakeholders first?</p>
<p>Best</p>`,
    date: hoursAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'sent',
    threadId: 'thread-1',
  },
  {
    id: '11',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Me', email: 'me@personal.com' },
    to: [{ name: 'Mom', email: 'mom@family.com' }],
    subject: 'Re: Dinner this weekend?',
    preview: "Hi Mom! Saturday works great for me. Should I bring anything? Can't wait for the lasagna!",
    body: `<p>Hi Mom!</p>
<p>Saturday works great for me. Should I bring anything? Can't wait for the lasagna!</p>
<p>See you then!</p>`,
    date: hoursAgo(4),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'sent',
    threadId: 'thread-2',
  },

  // Drafts
  {
    id: '12',
    accountId: 'work',
    accountColor: colors.blue,
    from: { name: 'Me', email: 'me@work.com' },
    to: [{ name: 'Team', email: 'team@company.com' }],
    subject: 'Weekly Update - Draft',
    preview: 'This week we made progress on several fronts. The main highlights include...',
    body: `<p>Team,</p>
<p>This week we made progress on several fronts. The main highlights include:</p>
<ul>
<li>Completed feature X</li>
<li>Started work on Y</li>
</ul>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'drafts',
  },

  // Spam
  {
    id: '13',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Winner Notification', email: 'winner@lottery-scam.com' },
    to: [{ name: 'Me', email: 'me@personal.com' }],
    subject: 'CONGRATULATIONS! You have won $1,000,000!!!',
    preview: 'Dear Winner, You have been selected as the lucky winner of our international lottery...',
    body: `<p>Dear Winner,</p>
<p>You have been selected as the lucky winner of our international lottery!</p>
<p>Click here to claim your prize!</p>`,
    date: daysAgo(2),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    folder: 'spam',
  },
]

export function getEmailsByFolder(folder: string, accountId?: string): Email[] {
  return mockEmails.filter((email) => {
    const folderMatch = email.folder === folder
    const accountMatch = !accountId || accountId === 'all' || email.accountId === accountId
    return folderMatch && accountMatch
  })
}

export function getUnreadCount(folder: string, accountId?: string): number {
  return getEmailsByFolder(folder, accountId).filter((email) => !email.isRead).length
}

export function getEmailById(id: string): Email | undefined {
  return mockEmails.find((email) => email.id === id)
}
