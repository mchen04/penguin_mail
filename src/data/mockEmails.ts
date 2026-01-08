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
  // UCR account emails (blue)
  {
    id: '1',
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'Canvas Notifications', email: 'notifications@instructure.com' },
    to: [{ name: 'Michael Chen', email: 'mchen023@ucr.edu' }],
    subject: 'Reminder: CS 171 Final Project due in 48 hours',
    preview: 'Your assignment "Final Project: Image Classification with CNNs" is due on Friday at 11:59 PM...',
    body: `<p>Hi Michael,</p>
<p>This is a reminder that your assignment <strong>"Final Project: Image Classification with CNNs"</strong> for CS 171 - Machine Learning is due in 48 hours.</p>
<p><strong>Due:</strong> Friday, January 10 at 11:59 PM PST</p>
<p><strong>Submission:</strong> Upload your Jupyter notebook and trained model weights to Gradescope.</p>
<p>Remember to include your model accuracy metrics and a brief writeup explaining your architecture choices.</p>
<p>Good luck!</p>`,
    date: hoursAgo(2),
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '2',
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'Dr. Mariam Salloum', email: 'msalloum@ucr.edu' },
    to: [{ name: 'CS 153 Students', email: 'cs153-w25@ucr.edu' }],
    subject: 'CS 153 - Office Hours Cancelled Tomorrow',
    preview: 'Hi everyone, I need to reschedule tomorrow\'s office hours due to a faculty meeting...',
    body: `<p>Hi everyone,</p>
<p>I need to reschedule tomorrow's office hours due to a faculty meeting. Instead of Thursday 2-4 PM, I will hold office hours on <strong>Friday 10 AM - 12 PM</strong> in Winston Chung Hall 217.</p>
<p>If you have questions about Project 3 (implementing a basic shell), please come to Friday's session or post on Piazza.</p>
<p>Reminder: Project 3 is due next Wednesday. Make sure your fork/exec implementation handles edge cases!</p>
<p>Best,<br/>Dr. Salloum</p>`,
    date: hoursAgo(5),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
    threadId: 'thread-1',
  },
  {
    id: '3',
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'UCR Career Center', email: 'careers@ucr.edu' },
    to: [{ name: 'Engineering Students', email: 'bcoe-students@ucr.edu' }],
    subject: 'Google, Jane Street, and 40+ companies at Winter Career Fair',
    preview: 'Don\'t miss the Bourns College of Engineering Winter Career Fair this Thursday...',
    body: `<p>Dear Engineering Students,</p>
<p>Don't miss the <strong>Bourns College of Engineering Winter Career Fair</strong> this Thursday, January 9th from 10 AM - 3 PM in the SRC Arena!</p>
<p><strong>Featured Companies Hiring for Full-Time & Internships:</strong></p>
<ul>
<li>Google - Software Engineer, New Grad</li>
<li>Jane Street - Quantitative Trading</li>
<li>Meta - Production Engineer</li>
<li>Amazon - SDE I</li>
<li>Northrop Grumman - Systems Engineer</li>
<li>Qualcomm - Embedded Software</li>
<li>...and 35+ more!</li>
</ul>
<p><strong>Pro Tips:</strong></p>
<ul>
<li>Bring copies of your resume</li>
<li>Research companies beforehand</li>
<li>Dress business casual</li>
</ul>
<p>Register on Handshake to get the full company list.</p>
<p>See you there!<br/>UCR Career Center</p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: true,
    hasAttachment: true,
    folder: 'inbox',
  },
  {
    id: '4',
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'ACM @ UCR', email: 'acm@ucr.edu' },
    to: [{ name: 'ACM Members', email: 'acm-members@ucr.edu' }],
    subject: 'Tonight: Mock Interview Night + Free Pizza',
    preview: 'Join us tonight at 6 PM in Bourns A125 for mock technical interviews with industry engineers...',
    body: `<p>Hey Highlanders!</p>
<p>Join us <strong>TONIGHT at 6 PM</strong> in Bourns A125 for our Winter Mock Interview Night!</p>
<p><strong>What to expect:</strong></p>
<ul>
<li>30-minute mock technical interviews with engineers from Google, Amazon, and startups</li>
<li>Personalized feedback on your problem-solving approach</li>
<li>Resume review stations</li>
<li>FREE PIZZA (first come, first served)</li>
</ul>
<p><strong>Come prepared with:</strong></p>
<ul>
<li>Your laptop (for live coding)</li>
<li>Questions about the interview process</li>
</ul>
<p>Perfect timing before the career fair on Thursday!</p>
<p>RSVP: <a href="#">forms.gle/acm-mock-interviews</a></p>
<p>See you there!<br/>ACM @ UCR Executive Board</p>`,
    date: hoursAgo(3),
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
    from: { name: 'GitHub', email: 'notifications@github.com' },
    to: [{ name: 'Michael Chen', email: 'm.chen.dev@gmail.com' }],
    subject: '[react-pdf-viewer] PR #847: Add dark mode support',
    preview: '@nicholasyang requested your review on this pull request. Changes include theme context provider...',
    body: `<p><strong>@nicholasyang</strong> requested your review on this pull request.</p>
<h3>Add dark mode support to PDF viewer component</h3>
<p><strong>Changes:</strong></p>
<ul>
<li>Add ThemeContext provider with light/dark/system modes</li>
<li>Update toolbar and page background colors</li>
<li>Add CSS variables for theming</li>
<li>Update Storybook with theme toggle</li>
</ul>
<p><strong>Files changed:</strong> 12 &nbsp; <strong>+284</strong> / <strong>-41</strong></p>
<p><a href="#">View pull request on GitHub</a></p>`,
    date: hoursAgo(1),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '6',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'LeetCode', email: 'no-reply@leetcode.com' },
    to: [{ name: 'Michael Chen', email: 'm.chen.dev@gmail.com' }],
    subject: "45-day streak! Today's challenge: Binary Tree Cameras",
    preview: "You're on fire! Keep your streak alive by solving today's Daily Challenge...",
    body: `<p>Hey Michael,</p>
<p>You're on a <strong>45-day streak</strong>! Keep it going!</p>
<h3>Today's Daily Challenge</h3>
<p><strong>968. Binary Tree Cameras</strong> (Hard)</p>
<p>You are given the root of a binary tree. We install cameras on the tree nodes where each camera can monitor its parent, itself, and its immediate children. Return the minimum number of cameras needed to monitor all nodes.</p>
<p><a href="#">Solve Now</a></p>
<hr/>
<p><strong>Upcoming:</strong> LeetCode Weekly Contest 432 - Sunday 7:30 PM PST</p>
<p>Your current rating: <strong>1847</strong> (Top 8%)</p>`,
    date: hoursAgo(4),
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '7',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'LinkedIn', email: 'messages-noreply@linkedin.com' },
    to: [{ name: 'Michael Chen', email: 'm.chen.dev@gmail.com' }],
    subject: 'A recruiter from Anthropic viewed your profile',
    preview: 'Emily Rodriguez, Technical Recruiter at Anthropic, viewed your profile. See who else is viewing...',
    body: `<p>Hi Michael,</p>
<p><strong>Emily Rodriguez</strong>, Technical Recruiter at <strong>Anthropic</strong>, viewed your profile.</p>
<p>Your profile has been viewed <strong>47 times</strong> in the past 7 days.</p>
<p><strong>Other recent views:</strong></p>
<ul>
<li>Recruiter at Two Sigma</li>
<li>Engineering Manager at Stripe</li>
<li>Talent Acquisition at OpenAI</li>
</ul>
<p>Keep your profile updated to attract more opportunities!</p>
<p><a href="#">See all profile views</a></p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '8',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Vercel', email: 'notifications@vercel.com' },
    to: [{ name: 'Michael Chen', email: 'm.chen.dev@gmail.com' }],
    subject: 'Deployment successful for portfolio-v3',
    preview: 'Your deployment to portfolio-v3.vercel.app has completed successfully. Build time: 34s...',
    body: `<p><strong>Deployment Status: Success</strong></p>
<p>Your deployment to <strong>portfolio-v3</strong> has completed successfully.</p>
<table>
<tr><td>Project</td><td>portfolio-v3</td></tr>
<tr><td>Branch</td><td>main</td></tr>
<tr><td>Commit</td><td>feat: add project showcase section</td></tr>
<tr><td>Build Time</td><td>34s</td></tr>
<tr><td>URL</td><td><a href="#">portfolio-v3.vercel.app</a></td></tr>
</table>
<p><a href="#">View Deployment</a> | <a href="#">View Logs</a></p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '9',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Stripe Recruiting', email: 'recruiting@stripe.com' },
    to: [{ name: 'Michael Chen', email: 'm.chen.dev@gmail.com' }],
    subject: 'Your application for New Grad SWE has been received',
    preview: 'Thank you for applying to the Software Engineer, New Grad position at Stripe...',
    body: `<p>Hi Michael,</p>
<p>Thank you for applying to the <strong>Software Engineer, New Grad (2025)</strong> position at Stripe!</p>
<p>We've received your application and our team is reviewing it. Due to the high volume of applications, this process may take 2-3 weeks.</p>
<p><strong>What happens next:</strong></p>
<ol>
<li>Application review by our recruiting team</li>
<li>If selected, you'll receive an online assessment (OA)</li>
<li>Phone screen with an engineer</li>
<li>Virtual onsite interviews</li>
</ol>
<p>In the meantime, check out our <a href="#">engineering blog</a> to learn more about what we're building.</p>
<p>Best of luck!<br/>Stripe Recruiting Team</p>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'inbox',
  },

  // Sent emails
  {
    id: '10',
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'Michael Chen', email: 'mchen023@ucr.edu' },
    to: [{ name: 'Dr. Mariam Salloum', email: 'msalloum@ucr.edu' }],
    subject: 'Re: CS 153 - Project 3 Extension Request',
    preview: 'Hi Dr. Salloum, I wanted to ask if it would be possible to get a 2-day extension on Project 3...',
    body: `<p>Hi Dr. Salloum,</p>
<p>I wanted to ask if it would be possible to get a 2-day extension on Project 3. I've been spending a lot of time debugging an issue with my pipe implementation and I'm also preparing for several technical interviews this week.</p>
<p>I have the core fork/exec functionality working, but I want to make sure my signal handling is robust before submitting.</p>
<p>I completely understand if the deadline is firm - just wanted to check.</p>
<p>Thank you for your time,<br/>Michael Chen</p>`,
    date: hoursAgo(4),
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
    from: { name: 'Michael Chen', email: 'm.chen.dev@gmail.com' },
    to: [{ name: 'Stripe Recruiting', email: 'recruiting@stripe.com' }],
    subject: 'Re: Technical Interview Availability',
    preview: 'Hi Emily, thank you for reaching out! I would be available for the technical phone screen on...',
    body: `<p>Hi Emily,</p>
<p>Thank you for reaching out! I would be available for the technical phone screen on any of the following times:</p>
<ul>
<li>Tuesday, Jan 14: 10 AM - 2 PM PST</li>
<li>Wednesday, Jan 15: 9 AM - 12 PM PST</li>
<li>Friday, Jan 17: 1 PM - 5 PM PST</li>
</ul>
<p>Please let me know which slot works best for the team.</p>
<p>Looking forward to it!</p>
<p>Best,<br/>Michael Chen</p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    folder: 'sent',
  },

  // Drafts
  {
    id: '12',
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'Michael Chen', email: 'mchen023@ucr.edu' },
    to: [{ name: 'Citadel Recruiting', email: 'campus-recruiting@citadel.com' }],
    subject: 'Application for New Grad Quantitative Developer - Michael Chen',
    preview: 'Dear Hiring Team, I am writing to express my strong interest in the Quantitative Developer position...',
    body: `<p>Dear Hiring Team,</p>
<p>I am writing to express my strong interest in the Quantitative Developer position at Citadel. As a senior Computer Science student at UC Riverside with a focus on systems programming and machine learning, I am excited about the opportunity to apply my technical skills in a fast-paced quantitative environment.</p>
<p><strong>Relevant Experience:</strong></p>
<ul>
<li>Built a low-latency trading simulation engine in Rust (99th percentile latency under 50ms)</li>
<li>Implemented ML models for time-series prediction in my capstone project</li>
<li>Contributed to open-source projects including react-pdf-viewer</li>
</ul>
<p>I would welcome the opportunity to discuss how my background in...</p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    folder: 'drafts',
  },

  // Spam
  {
    id: '13',
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Web3 Careers', email: 'jobs@web3-careers-legit.xyz' },
    to: [{ name: 'Developer', email: 'm.chen.dev@gmail.com' }],
    subject: 'Make $500k working in crypto - no experience needed!!!',
    preview: 'URGENT: We are looking for blockchain developers to join our revolutionary DeFi project...',
    body: `<p>URGENT OPPORTUNITY!!!</p>
<p>We are looking for blockchain developers to join our revolutionary DeFi project. NO EXPERIENCE NEEDED!</p>
<p>You could be earning $500,000+ per year working from home!</p>
<p>Just send us your wallet address to get started...</p>`,
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
