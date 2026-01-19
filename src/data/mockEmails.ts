/**
 * Mock email data generator
 * Creates 50+ realistic emails across different folders and accounts
 */

import type { Email, EmailAddress, Attachment } from '@/types/email'
import type { AccountColor } from '@/types/account'

// Helper to create dates relative to now
const daysAgo = (days: number, hours = 0): Date => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(date.getHours() - hours)
  return date
}

const hoursAgo = (hours: number): Date => {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date
}

const minutesAgo = (minutes: number): Date => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutes)
  return date
}

// Type-safe account colors
const colors = {
  blue: 'blue' as AccountColor,
  green: 'green' as AccountColor,
}

// Helper to create mock attachments
const createAttachment = (name: string, size: number, mimeType: string): Attachment => ({
  id: `att-${Math.random().toString(36).substring(2, 11)}`,
  name,
  size,
  mimeType,
})

// Senders for realistic variety
const senders: Record<string, EmailAddress> = {
  canvas: { name: 'Canvas Notifications', email: 'notifications@instructure.com' },
  salloum: { name: 'Dr. Mariam Salloum', email: 'msalloum@ucr.edu' },
  careercenter: { name: 'UCR Career Center', email: 'careers@ucr.edu' },
  acm: { name: 'ACM @ UCR', email: 'acm@ucr.edu' },
  github: { name: 'GitHub', email: 'notifications@github.com' },
  leetcode: { name: 'LeetCode', email: 'no-reply@leetcode.com' },
  linkedin: { name: 'LinkedIn', email: 'messages-noreply@linkedin.com' },
  vercel: { name: 'Vercel', email: 'notifications@vercel.com' },
  stripe: { name: 'Stripe Recruiting', email: 'recruiting@stripe.com' },
  amazon: { name: 'Amazon Jobs', email: 'jobs@amazon.com' },
  google: { name: 'Google Careers', email: 'noreply@google.com' },
  piazza: { name: 'Piazza', email: 'no-reply@piazza.com' },
  gradescope: { name: 'Gradescope', email: 'no-reply@gradescope.com' },
  slack: { name: 'Slack', email: 'feedback@slack.com' },
  figma: { name: 'Figma', email: 'notifications@figma.com' },
  notion: { name: 'Notion', email: 'notify@notion.so' },
  discord: { name: 'Discord', email: 'noreply@discord.com' },
  spotify: { name: 'Spotify', email: 'no-reply@spotify.com' },
  airbnb: { name: 'Airbnb', email: 'automated@airbnb.com' },
  uber: { name: 'Uber', email: 'noreply@uber.com' },
  doordash: { name: 'DoorDash', email: 'no-reply@doordash.com' },
  netflix: { name: 'Netflix', email: 'info@mailer.netflix.com' },
  venmo: { name: 'Venmo', email: 'venmo@venmo.com' },
  ucrfinaid: { name: 'UCR Financial Aid', email: 'finaid@ucr.edu' },
  ucrhousing: { name: 'UCR Housing', email: 'housing@ucr.edu' },
  coursera: { name: 'Coursera', email: 'no-reply@coursera.org' },
  web3spam: { name: 'Web3 Careers', email: 'jobs@web3-careers-legit.xyz' },
  crypto: { name: 'Crypto Opportunity', email: 'investment@totally-real-crypto.io' },
  prince: { name: 'Nigerian Prince', email: 'prince@royalty-transfer.ng' },
}

// Recipients
const ucrRecipient: EmailAddress = { name: 'Michael Chen', email: 'mchen023@ucr.edu' }
const personalRecipient: EmailAddress = { name: 'Michael Chen', email: 'm.chen.dev@gmail.com' }

let emailId = 1
let threadId = 1

const generateId = () => String(emailId++)
const generateThreadId = () => `thread-${threadId++}`

// Named thread IDs for reply chains (top 5 emails will have replies)
const THREAD_IDS = {
  CS171_PROJECT: 'thread-cs171-project',
  CS153_OFFICE: 'thread-cs153-office',
  CAREER_FAIR: 'thread-career-fair',
  GITHUB_PR: 'thread-github-pr',
  LEETCODE: 'thread-leetcode',
}

// Create UCR account emails
const ucrEmails: Email[] = [
  // Inbox emails
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.canvas,
    to: [ucrRecipient],
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
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CS171_PROJECT,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.salloum,
    to: [{ name: 'CS 153 Students', email: 'cs153-w25@ucr.edu' }],
    subject: 'CS 153 - Office Hours Cancelled Tomorrow',
    preview: "Hi everyone, I need to reschedule tomorrow's office hours due to a faculty meeting...",
    body: `<p>Hi everyone,</p>
<p>I need to reschedule tomorrow's office hours due to a faculty meeting. Instead of Thursday 2-4 PM, I will hold office hours on <strong>Friday 10 AM - 12 PM</strong> in Winston Chung Hall 217.</p>
<p>If you have questions about Project 3 (implementing a basic shell), please come to Friday's session or post on Piazza.</p>
<p>Reminder: Project 3 is due next Wednesday. Make sure your fork/exec implementation handles edge cases!</p>
<p>Best,<br/>Dr. Salloum</p>`,
    date: hoursAgo(5),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CS153_OFFICE,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.careercenter,
    to: [{ name: 'Engineering Students', email: 'bcoe-students@ucr.edu' }],
    subject: 'Google, Jane Street, and 40+ companies at Winter Career Fair',
    preview: "Don't miss the Bourns College of Engineering Winter Career Fair this Thursday...",
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
    attachments: [createAttachment('Career_Fair_Companies.pdf', 245000, 'application/pdf')],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CAREER_FAIR,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.acm,
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
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.piazza,
    to: [ucrRecipient],
    subject: '[CS 171] New answer to your question about CNNs',
    preview: 'An instructor answered your question "Why is my CNN overfitting after 5 epochs?"',
    body: `<p>Hi Michael,</p>
<p>An instructor answered your question in CS 171:</p>
<p><strong>Your question:</strong> "Why is my CNN overfitting after 5 epochs even with dropout layers?"</p>
<p><strong>Instructor answer:</strong></p>
<blockquote>
<p>This is a common issue! A few things to try:</p>
<ul>
<li>Increase your dropout rate (try 0.5 instead of 0.3)</li>
<li>Add data augmentation (rotation, flipping, etc.)</li>
<li>Reduce model complexity (fewer filters or layers)</li>
<li>Use early stopping with patience=3</li>
</ul>
<p>Also make sure you're calling model.eval() during validation!</p>
</blockquote>
<p><a href="#">View full discussion on Piazza</a></p>`,
    date: hoursAgo(6),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.gradescope,
    to: [ucrRecipient],
    subject: 'CS 153: Your Project 2 has been graded',
    preview: 'Your submission for "Project 2: Memory Allocator" has been graded. Score: 95/100...',
    body: `<p>Hi Michael Chen,</p>
<p>Your submission for <strong>Project 2: Memory Allocator</strong> in CS 153 has been graded.</p>
<table>
<tr><td><strong>Score:</strong></td><td>95/100</td></tr>
<tr><td><strong>Autograder:</strong></td><td>85/85</td></tr>
<tr><td><strong>Code Style:</strong></td><td>10/15</td></tr>
</table>
<p><strong>Feedback:</strong></p>
<ul>
<li>Excellent implementation of malloc and free</li>
<li>Good use of best-fit allocation strategy</li>
<li>Minor style issues: some functions could use more comments</li>
</ul>
<p><a href="#">View detailed feedback on Gradescope</a></p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.ucrfinaid,
    to: [ucrRecipient],
    subject: 'Action Required: FAFSA Verification Documents',
    preview: 'Your FAFSA application has been selected for verification. Please submit the required documents...',
    body: `<p>Dear Michael Chen,</p>
<p>Your 2024-2025 FAFSA application has been selected for verification. Please submit the following documents by <strong>February 1, 2025</strong>:</p>
<ul>
<li>2023 Tax Return Transcript (student)</li>
<li>2023 Tax Return Transcript (parent)</li>
<li>Signed Verification Worksheet</li>
</ul>
<p>You can upload documents through R'Web or visit our office in Student Services Building 121.</p>
<p>Failure to complete verification may result in delays to your financial aid disbursement.</p>
<p>Questions? Contact us at finaid@ucr.edu or (951) 827-3878.</p>
<p>UCR Financial Aid Office</p>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: true,
    hasAttachment: true,
    attachments: [createAttachment('Verification_Worksheet.pdf', 156000, 'application/pdf')],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.ucrhousing,
    to: [ucrRecipient],
    subject: 'Housing Application Status Update',
    preview: 'Your housing application for Fall 2025 has been received. Priority selection begins...',
    body: `<p>Dear Michael,</p>
<p>Thank you for submitting your housing application for Fall 2025.</p>
<p><strong>Application Status:</strong> Received</p>
<p><strong>Priority Number:</strong> 2,847</p>
<p>Room selection will begin on April 1, 2025. Students will be notified of their selection time slot via email.</p>
<p><strong>Reminders:</strong></p>
<ul>
<li>Complete the Housing Deposit ($300) by February 15</li>
<li>Update your roommate preferences by March 1</li>
<li>Review the Room & Board rates for 2025-2026</li>
</ul>
<p><a href="#">Log in to Housing Portal</a></p>
<p>UCR Housing Services</p>`,
    date: daysAgo(5),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.coursera,
    to: [ucrRecipient],
    subject: 'Congrats! You completed Machine Learning Specialization',
    preview: "You've earned your certificate! Download and share your accomplishment...",
    body: `<p>Congratulations Michael!</p>
<p>You've completed the <strong>Machine Learning Specialization</strong> by Stanford University and DeepLearning.AI.</p>
<p><strong>Courses Completed:</strong></p>
<ul>
<li>Supervised Machine Learning: Regression and Classification</li>
<li>Advanced Learning Algorithms</li>
<li>Unsupervised Learning, Recommenders, Reinforcement Learning</li>
</ul>
<p><strong>What you learned:</strong></p>
<ul>
<li>Build ML models with NumPy and TensorFlow</li>
<li>Train supervised models for prediction and classification</li>
<li>Build and train neural networks</li>
<li>Apply best practices for ML development</li>
</ul>
<p><a href="#">Download your certificate</a> | <a href="#">Share on LinkedIn</a></p>
<p>Keep learning!</p>`,
    date: daysAgo(7),
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    attachments: [createAttachment('ML_Specialization_Certificate.pdf', 892000, 'application/pdf')],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
]

// Create personal account emails
const personalEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.github,
    to: [personalRecipient],
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
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.GITHUB_PR,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.leetcode,
    to: [personalRecipient],
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
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.LEETCODE,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.linkedin,
    to: [personalRecipient],
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
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.vercel,
    to: [personalRecipient],
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
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.stripe,
    to: [personalRecipient],
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
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.amazon,
    to: [personalRecipient],
    subject: 'Amazon SDE Internship - Online Assessment Invitation',
    preview: 'Congratulations! You have been selected to complete an online assessment for the Amazon SDE Internship...',
    body: `<p>Dear Michael,</p>
<p>Congratulations! Based on your application, you have been invited to complete an online assessment for the <strong>Software Development Engineer Internship</strong> at Amazon.</p>
<p><strong>Assessment Details:</strong></p>
<ul>
<li><strong>Format:</strong> 2 coding questions + work simulation</li>
<li><strong>Duration:</strong> 90 minutes</li>
<li><strong>Deadline:</strong> Complete within 5 days of receiving this email</li>
</ul>
<p><strong>Tips for success:</strong></p>
<ul>
<li>Review data structures and algorithms</li>
<li>Practice on platforms like LeetCode</li>
<li>Read about Amazon's Leadership Principles</li>
</ul>
<p><a href="#">Start Assessment</a></p>
<p>Good luck!<br/>Amazon University Recruiting</p>`,
    date: daysAgo(4),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.google,
    to: [personalRecipient],
    subject: 'Google STEP Internship - Application Update',
    preview: 'Thank you for your interest in the Google STEP Internship. We wanted to provide an update...',
    body: `<p>Hi Michael,</p>
<p>Thank you for your continued interest in the <strong>Google STEP Internship</strong> program.</p>
<p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. This was a highly competitive process, and we received many strong applications.</p>
<p>We encourage you to:</p>
<ul>
<li>Continue building your skills and projects</li>
<li>Apply for other Google opportunities when they open</li>
<li>Check out Google's developer resources and learning paths</li>
</ul>
<p>We wish you the best in your job search and future endeavors.</p>
<p>Best regards,<br/>Google University Recruiting</p>`,
    date: daysAgo(5),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.slack,
    to: [personalRecipient],
    subject: 'You have 12 unread messages in 3 channels',
    preview: "Here's what you missed in your Slack workspaces while you were away...",
    body: `<p>Hi Michael,</p>
<p>You have unread messages in <strong>Tech Interview Prep</strong>:</p>
<p><strong>#leetcode-daily</strong> (5 messages)</p>
<blockquote>
<p><strong>@sarah:</strong> Just solved today's hard in 20 min, here's my approach...</p>
<p><strong>@james:</strong> Can someone explain the DP solution?</p>
</blockquote>
<p><strong>#job-search</strong> (4 messages)</p>
<blockquote>
<p><strong>@alex:</strong> Just got an offer from Meta! Happy to share interview tips</p>
</blockquote>
<p><strong>#general</strong> (3 messages)</p>
<blockquote>
<p><strong>@admin:</strong> Weekly mock interview schedule is up</p>
</blockquote>
<p><a href="#">Open Slack</a></p>`,
    date: hoursAgo(8),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.figma,
    to: [personalRecipient],
    subject: '[portfolio-redesign] Sarah commented on Frame 1',
    preview: '@sarahdesigns left a comment: "Love the color palette! Maybe try a slightly darker...',
    body: `<p>Sarah Chen commented on your design:</p>
<p><strong>File:</strong> portfolio-redesign</p>
<p><strong>Frame:</strong> Homepage Hero Section</p>
<blockquote>
<p>"Love the color palette! Maybe try a slightly darker shade for the CTA button to improve contrast. Also, the spacing between the headline and description could be a bit tighter."</p>
</blockquote>
<p><a href="#">View in Figma</a> | <a href="#">Reply to comment</a></p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.notion,
    to: [personalRecipient],
    subject: 'Weekly digest: Job Applications Tracker',
    preview: "Here's your weekly summary: 3 applications submitted, 2 responses received...",
    body: `<p>Hi Michael,</p>
<p>Here's your weekly summary for <strong>Job Applications Tracker</strong>:</p>
<h3>This Week's Activity</h3>
<ul>
<li><strong>Applications Submitted:</strong> 3</li>
<li><strong>Responses Received:</strong> 2</li>
<li><strong>Interviews Scheduled:</strong> 1</li>
<li><strong>Rejections:</strong> 1</li>
</ul>
<h3>Upcoming</h3>
<ul>
<li>Stripe phone screen - Jan 15</li>
<li>Amazon OA deadline - Jan 12</li>
</ul>
<p><a href="#">Open in Notion</a></p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.discord,
    to: [personalRecipient],
    subject: 'You have 23 new messages',
    preview: 'CS Students server: New messages in #internships, #leetcode-help, and 2 other channels',
    body: `<p>Hi Michael,</p>
<p>You have new messages in <strong>CS Students</strong>:</p>
<p><strong>#internships</strong></p>
<blockquote>
<p><strong>techguy42:</strong> Anyone have experience with Citadel's interview process?</p>
<p><strong>codemaster:</strong> Just finished mine last week, happy to share...</p>
</blockquote>
<p><strong>#leetcode-help</strong></p>
<blockquote>
<p><strong>newbie_dev:</strong> Stuck on this graph problem, can someone explain BFS vs DFS?</p>
</blockquote>
<p><a href="#">Open Discord</a></p>`,
    date: hoursAgo(10),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.spotify,
    to: [personalRecipient],
    subject: 'Your 2024 Wrapped is here!',
    preview: "You listened to 45,000 minutes of music this year. See your top artists, songs, and more...",
    body: `<p>Hey Michael,</p>
<p>Your <strong>2024 Wrapped</strong> is ready!</p>
<h3>Your Year in Music</h3>
<ul>
<li><strong>Minutes Listened:</strong> 45,000</li>
<li><strong>Top Genre:</strong> Lo-fi Beats</li>
<li><strong>Top Artist:</strong> Nujabes</li>
<li><strong>Top Song:</strong> "Aruarian Dance"</li>
</ul>
<p>You were in the top 2% of lo-fi listeners worldwide!</p>
<p><a href="#">See Your Full Wrapped</a> | <a href="#">Share</a></p>`,
    date: daysAgo(14),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.venmo,
    to: [personalRecipient],
    subject: 'Alex Chen paid you $25.00',
    preview: 'For "dinner split" - View your Venmo balance...',
    body: `<p><strong>Alex Chen</strong> paid you <strong>$25.00</strong></p>
<p><em>"dinner split"</em></p>
<p><strong>Your new balance:</strong> $127.50</p>
<p><a href="#">View in Venmo</a> | <a href="#">Transfer to Bank</a></p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.doordash,
    to: [personalRecipient],
    subject: 'Your order from Panda Express is on the way!',
    preview: 'Estimated delivery: 6:45 PM. Track your order in real-time...',
    body: `<p>Your order is on the way!</p>
<p><strong>Order from:</strong> Panda Express</p>
<p><strong>Items:</strong></p>
<ul>
<li>Orange Chicken Bowl</li>
<li>Spring Roll (2)</li>
</ul>
<p><strong>Estimated Delivery:</strong> 6:45 PM</p>
<p><strong>Driver:</strong> Marcus (4.9 stars)</p>
<p><a href="#">Track Order</a></p>`,
    date: hoursAgo(12),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.netflix,
    to: [personalRecipient],
    subject: 'New on Netflix: Shows we think you\'ll love',
    preview: 'Based on your watching history: The Three-Body Problem, Squid Game Season 2...',
    body: `<p>Hi Michael,</p>
<p>Based on what you've watched, we think you'll enjoy:</p>
<h3>New Releases</h3>
<ul>
<li><strong>The Three-Body Problem</strong> - Sci-fi epic based on the bestselling novel</li>
<li><strong>Squid Game: Season 2</strong> - The games continue</li>
<li><strong>Black Mirror: Season 7</strong> - More dark tech tales</li>
</ul>
<h3>Because you watched "Breaking Bad"</h3>
<ul>
<li>Better Call Saul</li>
<li>Ozark</li>
<li>Narcos</li>
</ul>
<p><a href="#">Browse Netflix</a></p>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
]

// More UCR inbox emails
const moreUcrEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.canvas,
    to: [ucrRecipient],
    subject: 'Grade Posted: MATH 010A - Calculus I',
    preview: 'A grade has been posted for your assignment "Midterm Exam 2" in MATH 010A...',
    body: `<p>Hi Michael,</p>
<p>A grade has been posted in <strong>MATH 010A - Calculus I</strong>:</p>
<p><strong>Assignment:</strong> Midterm Exam 2</p>
<p><strong>Score:</strong> 87/100</p>
<p><strong>Class Average:</strong> 74/100</p>
<p><a href="#">View grade details in Canvas</a></p>`,
    date: daysAgo(6),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'Dr. James Wilson', email: 'jwilson@ucr.edu' },
    to: [ucrRecipient],
    subject: 'RE: Research Opportunity Question',
    preview: 'Hi Michael, Thank you for your interest in my research lab. I would be happy to meet...',
    body: `<p>Hi Michael,</p>
<p>Thank you for your interest in my research lab focusing on distributed systems and cloud computing.</p>
<p>I would be happy to meet with you to discuss potential research opportunities. We currently have an opening for an undergraduate research assistant for the Spring quarter.</p>
<p>Please come to my office hours (Tuesday 3-4 PM, WCH 351) or schedule a meeting through my Calendly.</p>
<p>Best,<br/>Dr. James Wilson<br/>Associate Professor, Computer Science</p>`,
    date: daysAgo(4),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'UCR Library', email: 'library@ucr.edu' },
    to: [ucrRecipient],
    subject: 'Reminder: Book due in 3 days',
    preview: 'The following item is due on January 12: "Introduction to Algorithms" by Cormen...',
    body: `<p>Dear Michael Chen,</p>
<p>This is a reminder that the following library item is due soon:</p>
<p><strong>Title:</strong> Introduction to Algorithms (4th Edition)</p>
<p><strong>Author:</strong> Cormen, Leiserson, Rivest, Stein</p>
<p><strong>Due Date:</strong> January 12, 2025</p>
<p>You can renew this item online if no one else has placed a hold on it.</p>
<p><a href="#">Renew Now</a> | <a href="#">View My Account</a></p>
<p>UCR Library</p>`,
    date: daysAgo(1),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
]

// More personal emails
const morePersonalEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.github,
    to: [personalRecipient],
    subject: '[mchen-portfolio] dependabot: Bump vite from 4.5.0 to 5.0.12',
    preview: 'Dependabot opened a PR to update vite in your repository...',
    body: `<p><strong>Dependabot</strong> opened a pull request:</p>
<h3>Bump vite from 4.5.0 to 5.0.12</h3>
<p>This PR updates <code>vite</code> from 4.5.0 to 5.0.12</p>
<p><strong>Release Notes:</strong></p>
<ul>
<li>Performance improvements</li>
<li>Bug fixes for HMR</li>
<li>Updated esbuild dependency</li>
</ul>
<p><strong>Compatibility score:</strong> 94%</p>
<p><a href="#">View PR</a> | <a href="#">Merge</a> | <a href="#">Dismiss</a></p>`,
    date: hoursAgo(6),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.uber,
    to: [personalRecipient],
    subject: 'Your ride receipt',
    preview: 'Thanks for riding with Uber! Your trip from UCR to Canyon Crest cost $12.47...',
    body: `<p>Thanks for riding with Uber!</p>
<h3>Trip Details</h3>
<table>
<tr><td>Date</td><td>January 8, 2025</td></tr>
<tr><td>From</td><td>UCR Campus</td></tr>
<tr><td>To</td><td>Canyon Crest Town Center</td></tr>
<tr><td>Distance</td><td>3.2 mi</td></tr>
<tr><td>Duration</td><td>12 min</td></tr>
</table>
<h3>Fare Breakdown</h3>
<table>
<tr><td>Base fare</td><td>$3.50</td></tr>
<tr><td>Distance</td><td>$5.12</td></tr>
<tr><td>Time</td><td>$2.40</td></tr>
<tr><td>Booking fee</td><td>$1.45</td></tr>
<tr><td><strong>Total</strong></td><td><strong>$12.47</strong></td></tr>
</table>
<p><a href="#">Get PDF receipt</a></p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.airbnb,
    to: [personalRecipient],
    subject: 'Your booking request was accepted!',
    preview: 'Great news! Your booking for SF Tech Hub Apartment has been confirmed...',
    body: `<p>Great news, Michael!</p>
<p>Your booking has been confirmed:</p>
<h3>SF Tech Hub Apartment</h3>
<p><strong>Check-in:</strong> March 15, 2025 at 3:00 PM</p>
<p><strong>Check-out:</strong> March 18, 2025 at 11:00 AM</p>
<p><strong>Location:</strong> SOMA, San Francisco</p>
<p><strong>Total:</strong> $387.00 (3 nights)</p>
<p>Your host, Sarah, will send you check-in instructions 24 hours before your arrival.</p>
<p><a href="#">View Reservation</a> | <a href="#">Message Host</a></p>`,
    date: daysAgo(8),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Mom', email: 'susan.chen@gmail.com' },
    to: [personalRecipient],
    subject: 'Dinner this weekend?',
    preview: 'Hi sweetie! Your dad and I were thinking of coming to Riverside this weekend. Are you free for dinner...',
    body: `<p>Hi sweetie!</p>
<p>Your dad and I were thinking of coming to Riverside this weekend. Are you free for dinner on Saturday?</p>
<p>We could try that new Korean BBQ place you mentioned. Or if you prefer, we can bring food from home.</p>
<p>Let us know what time works for you!</p>
<p>Love,<br/>Mom</p>
<p>P.S. Don't forget to take your vitamins!</p>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: 'thread-dinner',
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Alex Chen', email: 'alex.chen.dev@gmail.com' },
    to: [personalRecipient],
    subject: 'RE: Side project idea',
    preview: 'Dude the AI code review tool sounds awesome! I\'m totally down to work on it. When do you want to...',
    body: `<p>Dude the AI code review tool sounds awesome! I'm totally down to work on it.</p>
<p>When do you want to start? I was thinking we could:</p>
<ul>
<li>Use the OpenAI API for the initial version</li>
<li>Build a VS Code extension</li>
<li>Maybe add GitHub integration later</li>
</ul>
<p>I'm free most evenings after 7pm. Want to hop on a call this week to plan it out?</p>
<p>Let me know!</p>
<p>-Alex</p>`,
    date: daysAgo(5),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: 'thread-sideproject',
    isDraft: false,
  },
]

// Sent emails
const sentEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: ucrRecipient,
    to: [senders.salloum],
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
    attachments: [],
    folder: 'sent',
    labels: [],
    threadId: 'thread-2',
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: personalRecipient,
    to: [{ name: 'Emily Rodriguez', email: 'emily.rodriguez@stripe.com' }],
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
    attachments: [],
    folder: 'sent',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: personalRecipient,
    to: [{ name: 'Alex Chen', email: 'alex.chen.dev@gmail.com' }],
    subject: 'Side project idea',
    preview: 'Hey Alex! I had this idea for a side project - an AI-powered code review tool...',
    body: `<p>Hey Alex!</p>
<p>I had this idea for a side project - an AI-powered code review tool that could help catch bugs and suggest improvements in real-time.</p>
<p>Key features I'm thinking:</p>
<ul>
<li>Real-time suggestions as you type</li>
<li>Integration with popular IDEs</li>
<li>Custom rules per project</li>
<li>Security vulnerability detection</li>
</ul>
<p>Would you be interested in building this together? I think we could have an MVP in a few weeks.</p>
<p>Let me know what you think!</p>
<p>-Michael</p>`,
    date: daysAgo(6),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'sent',
    labels: [],
    threadId: 'thread-sideproject',
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: ucrRecipient,
    to: [{ name: 'Dr. James Wilson', email: 'jwilson@ucr.edu' }],
    subject: 'Research Opportunity Question',
    preview: 'Dear Dr. Wilson, I am a junior CS student interested in your research on distributed systems...',
    body: `<p>Dear Dr. Wilson,</p>
<p>I am a junior Computer Science student at UCR, and I am very interested in your research on distributed systems and cloud computing.</p>
<p>I recently read your paper on "Efficient Load Balancing in Microservices Architectures" and found it fascinating. I would love to learn more about potential research opportunities in your lab.</p>
<p>My background includes:</p>
<ul>
<li>Strong foundation in data structures and algorithms</li>
<li>Experience with AWS and Docker</li>
<li>Personal projects involving distributed systems</li>
</ul>
<p>Would you be available for a brief meeting to discuss this further?</p>
<p>Thank you for your time.</p>
<p>Best regards,<br/>Michael Chen</p>`,
    date: daysAgo(5),
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    attachments: [createAttachment('Michael_Chen_Resume.pdf', 125000, 'application/pdf')],
    folder: 'sent',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: personalRecipient,
    to: [{ name: 'Mom', email: 'susan.chen@gmail.com' }],
    subject: 'Re: Dinner this weekend?',
    preview: 'Hi Mom! Yes, Saturday dinner sounds great. Korean BBQ would be awesome...',
    body: `<p>Hi Mom!</p>
<p>Yes, Saturday dinner sounds great. Korean BBQ would be awesome - I've been craving it!</p>
<p>How about 6pm? I can make a reservation at that place in Canyon Crest.</p>
<p>See you Saturday!</p>
<p>Love,<br/>Michael</p>
<p>P.S. Yes, I'm taking my vitamins :)</p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'sent',
    labels: [],
    threadId: 'thread-dinner',
    isDraft: false,
  },
]

// Draft emails
const draftEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: ucrRecipient,
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
    attachments: [createAttachment('Resume_MichaelChen.pdf', 145000, 'application/pdf')],
    folder: 'drafts',
    labels: [],
    threadId: generateThreadId(),
    isDraft: true,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: personalRecipient,
    to: [],
    subject: 'Blog post draft: My Journey Learning Rust',
    preview: 'After 6 months of learning Rust, here are my thoughts on the language...',
    body: `<h1>My Journey Learning Rust</h1>
<p>After 6 months of learning Rust, here are my thoughts on the language and why I think every systems programmer should give it a try.</p>
<h2>The Good</h2>
<ul>
<li>Memory safety without garbage collection</li>
<li>Amazing error messages</li>
<li>Cargo is fantastic</li>
</ul>
<h2>The Challenging</h2>
<ul>
<li>The borrow checker learning curve</li>
<li>Async Rust complexity</li>
</ul>
<h2>What I Built</h2>
<p>I started with a simple CLI tool to parse and analyze log files, then moved on to building a small HTTP server. Currently working on a concurrent web scraper that uses async/await.</p>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'drafts',
    labels: [],
    threadId: generateThreadId(),
    isDraft: true,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: ucrRecipient,
    to: [{ name: 'CS Study Group', email: 'cs-study-group@groups.ucr.edu' }],
    subject: 'Study session for CS 171 Final',
    preview: 'Hey everyone! I wanted to organize a study session for the CS 171 final...',
    body: `<p>Hey everyone!</p>
<p>I wanted to organize a study session for the CS 171 final. Here's what I'm thinking:</p>
<p><strong>When:</strong> Saturday, 2pm - 6pm</p>
<p><strong>Where:</strong> Orbach Library, 3rd floor study rooms</p>
<p><strong>Topics to cover:</strong></p>
<ul>
<li>Neural networks and backpropagation</li>
<li>CNN architectures</li>
<li>Regularization techniques</li>
<li>Practice problems from past exams</li>
</ul>
<p>Let me know if you're interested!</p>`,
    date: hoursAgo(8),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'drafts',
    labels: [],
    threadId: generateThreadId(),
    isDraft: true,
  },
]

// Spam emails
const spamEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.web3spam,
    to: [personalRecipient],
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
    attachments: [],
    folder: 'spam',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.crypto,
    to: [personalRecipient],
    subject: 'GUARANTEED 1000% returns on your crypto investment',
    preview: 'Limited time offer! Invest $100 today and receive $1000 tomorrow with our AI trading bot...',
    body: `<p>LIMITED TIME OFFER!</p>
<p>Our proprietary AI trading bot guarantees 1000% returns on your cryptocurrency investment!</p>
<p>Invest just $100 today and receive $1000 tomorrow!</p>
<p>This is NOT a scam - we have thousands of satisfied customers!</p>
<p>Click here to start your journey to financial freedom...</p>`,
    date: daysAgo(4),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'spam',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.prince,
    to: [personalRecipient],
    subject: 'URGENT: $10,000,000 inheritance waiting for you',
    preview: 'Dear friend, I am Prince Abubakar and I need your help to transfer $10 million...',
    body: `<p>Dear Friend,</p>
<p>I am Prince Abubakar III, son of the late King of [COUNTRY]. I have $10,000,000 USD that I need to transfer out of the country urgently.</p>
<p>I found your email through divine providence. If you help me transfer this money, I will give you 40% ($4,000,000)!</p>
<p>All I need is your:</p>
<ul>
<li>Full name</li>
<li>Bank account number</li>
<li>Social security number</li>
</ul>
<p>Please respond urgently!</p>
<p>God bless,<br/>Prince Abubakar</p>`,
    date: daysAgo(7),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'spam',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'UCR IT Support', email: 'support@ucr-it-helpdesk.xyz' },
    to: [ucrRecipient],
    subject: 'URGENT: Your UCR account will be deactivated',
    preview: 'Your UCR email account will be deactivated in 24 hours. Click here to verify...',
    body: `<p>URGENT NOTICE</p>
<p>Your UCR email account will be DEACTIVATED in 24 hours due to suspicious activity.</p>
<p>To keep your account active, you must verify your credentials immediately:</p>
<p><a href="#">Click here to verify your account</a></p>
<p>Enter your UCR NetID and password to complete verification.</p>
<p>Failure to verify will result in permanent account deletion.</p>
<p>UCR IT Services</p>`,
    date: daysAgo(1),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'spam',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
]

// Trash emails
const trashEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Newsletter', email: 'news@techweekly.com' },
    to: [personalRecipient],
    subject: 'This week in tech: AI breakthroughs and more',
    preview: 'Your weekly tech roundup: New GPT model announced, Apple Vision Pro sales...',
    body: `<p>Your weekly tech roundup</p>
<ul>
<li>OpenAI announces GPT-5</li>
<li>Apple Vision Pro sales exceed expectations</li>
<li>Google's new quantum computing breakthrough</li>
</ul>`,
    date: daysAgo(10),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'trash',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'UCR Events', email: 'events@ucr.edu' },
    to: [ucrRecipient],
    subject: 'This weekend: Campus events you won\'t want to miss',
    preview: 'Check out these exciting events happening on campus this weekend...',
    body: `<p>Campus Events This Weekend</p>
<ul>
<li>Saturday: Outdoor movie night at the Bell Tower</li>
<li>Sunday: Farmers market at the HUB</li>
<li>All weekend: Art exhibition at the Culver Center</li>
</ul>`,
    date: daysAgo(8),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'trash',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
]

// Archive emails
const archiveEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.amazon,
    to: [personalRecipient],
    subject: 'Your Amazon.com order has shipped',
    preview: 'Your order of "Mechanical Keyboard" has shipped and is on its way...',
    body: `<p>Your order has shipped!</p>
<p><strong>Order #123-4567890</strong></p>
<p><strong>Item:</strong> Keychron K2 Mechanical Keyboard</p>
<p><strong>Estimated Delivery:</strong> December 28, 2024</p>
<p><a href="#">Track Package</a></p>`,
    date: daysAgo(20),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'archive',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.canvas,
    to: [ucrRecipient],
    subject: 'Fall 2024 Final Grades Posted',
    preview: 'Your final grades for Fall 2024 have been posted. View your grades in R\'Web...',
    body: `<p>Hi Michael,</p>
<p>Your final grades for Fall 2024 have been posted.</p>
<p>View your grades in R'Web to see your GPA and academic standing.</p>
<p><a href="#">View Grades</a></p>`,
    date: daysAgo(25),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'archive',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
]

// Generate bulk emails for pagination testing
const generateBulkEmails = (): Email[] => {
  const bulkEmails: Email[] = []

  // Various email subjects and previews for realistic variety
  const emailTemplates = [
    { subject: 'Weekly team sync notes', preview: 'Here are the notes from this week\'s team meeting...', sender: 'github' },
    { subject: 'Your subscription is expiring soon', preview: 'Your premium subscription will expire in 7 days...', sender: 'netflix' },
    { subject: 'New comment on your post', preview: 'Someone commented on your recent post about TypeScript...', sender: 'linkedin' },
    { subject: 'Deployment failed - action required', preview: 'The latest deployment to production has failed...', sender: 'vercel' },
    { subject: 'Your order has been delivered', preview: 'Your package was delivered today at 2:34 PM...', sender: 'amazon' },
    { subject: 'Security alert: New sign-in detected', preview: 'We detected a new sign-in to your account from Chrome on Mac...', sender: 'google' },
    { subject: 'Invitation to collaborate', preview: 'You\'ve been invited to collaborate on a new project...', sender: 'figma' },
    { subject: 'Your weekly activity summary', preview: 'Here\'s your activity summary for the past week...', sender: 'leetcode' },
    { subject: 'New assignment posted', preview: 'A new assignment has been posted in your course...', sender: 'canvas' },
    { subject: 'Meeting reminder', preview: 'Reminder: You have a meeting scheduled for tomorrow at 10 AM...', sender: 'slack' },
    { subject: 'Price drop alert', preview: 'An item on your wishlist is now on sale...', sender: 'amazon' },
    { subject: 'New follower', preview: 'You have a new follower on your profile...', sender: 'github' },
    { subject: 'Course completion certificate', preview: 'Congratulations! You\'ve completed the course...', sender: 'coursera' },
    { subject: 'Payment received', preview: 'We\'ve received your payment of $25.00...', sender: 'venmo' },
    { subject: 'New job recommendation', preview: 'Based on your profile, we think you\'d be a great fit for...', sender: 'linkedin' },
    { subject: 'Build successful', preview: 'Your latest build has completed successfully...', sender: 'vercel' },
    { subject: 'New review on your pull request', preview: 'A reviewer has left comments on your PR...', sender: 'github' },
    { subject: 'Upcoming event reminder', preview: 'Don\'t forget about the hackathon this weekend...', sender: 'acm' },
    { subject: 'Grade posted', preview: 'Your grade for the midterm exam has been posted...', sender: 'gradescope' },
    { subject: 'New message from support', preview: 'Our support team has responded to your ticket...', sender: 'stripe' },
    { subject: 'Daily digest', preview: 'Here are the top stories you might have missed...', sender: 'notion' },
    { subject: 'Workspace activity', preview: 'There\'s been new activity in your workspace...', sender: 'slack' },
    { subject: 'System maintenance scheduled', preview: 'We will be performing scheduled maintenance on...', sender: 'github' },
    { subject: 'New feature announcement', preview: 'We\'re excited to announce a new feature that...', sender: 'figma' },
    { subject: 'Your receipt', preview: 'Thank you for your purchase. Here\'s your receipt...', sender: 'uber' },
  ]

  // Generate 80 additional emails (40 per account) to ensure 50+ conversations per account
  for (let i = 0; i < 80; i++) {
    const template = emailTemplates[i % emailTemplates.length]
    // Alternate evenly between accounts - 50% each
    const isPersonal = i % 2 === 0
    const daysOffset = Math.floor(i / 4) + 1
    const hoursOffset = (i % 24)

    bulkEmails.push({
      id: generateId(),
      accountId: isPersonal ? 'personal' : 'ucr',
      accountColor: isPersonal ? colors.green : colors.blue,
      from: senders[template.sender as keyof typeof senders] || senders.github,
      to: [isPersonal ? personalRecipient : ucrRecipient],
      subject: `${template.subject} (#${i + 1})`,
      preview: template.preview,
      body: `<p>${template.preview}</p><p>This is email #${i + 1} in the pagination test set.</p>`,
      date: daysAgo(daysOffset, hoursOffset),
      isRead: i % 2 === 0,
      isStarred: i % 7 === 0,
      hasAttachment: i % 5 === 0,
      attachments: i % 5 === 0 ? [createAttachment(`document_${i + 1}.pdf`, 125000 + i * 1000, 'application/pdf')] : [],
      folder: 'inbox',
      labels: [],
      threadId: generateThreadId(),
      isDraft: false,
    })
  }

  return bulkEmails
}

const bulkEmails = generateBulkEmails()

// Additional inbox emails to reach 50+
const additionalInboxEmails: Email[] = [
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.github,
    to: [personalRecipient],
    subject: 'Your GitHub Copilot subscription will renew',
    preview: 'Your GitHub Copilot Individual subscription will automatically renew on January 15...',
    body: `<p>Hi Michael,</p>
<p>Your <strong>GitHub Copilot Individual</strong> subscription will automatically renew on <strong>January 15, 2025</strong>.</p>
<p><strong>Renewal amount:</strong> $10.00/month</p>
<p>Thank you for being a Copilot subscriber!</p>
<p><a href="#">Manage subscription</a></p>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'IEEE @ UCR', email: 'ieee@ucr.edu' },
    to: [ucrRecipient],
    subject: 'Workshop: Introduction to PCB Design',
    preview: 'Join us this Saturday for a hands-on workshop on PCB design using KiCad...',
    body: `<p>Hello IEEE Members!</p>
<p>Join us this Saturday for a hands-on workshop on <strong>PCB Design using KiCad</strong>.</p>
<p><strong>When:</strong> Saturday, January 11, 2-5 PM</p>
<p><strong>Where:</strong> Bourns Hall A265</p>
<p><strong>What you'll learn:</strong></p>
<ul>
<li>Schematic capture basics</li>
<li>PCB layout fundamentals</li>
<li>Design rule checks</li>
<li>Gerber file generation</li>
</ul>
<p>Bring your laptop with KiCad installed!</p>
<p><a href="#">RSVP Here</a></p>`,
    date: daysAgo(2),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Product Hunt', email: 'digest@producthunt.com' },
    to: [personalRecipient],
    subject: 'Daily Digest: Top products of the day',
    preview: 'Claude 3.5 Sonnet, Linear 2.0, and 8 more products launching today...',
    body: `<h2>Top Products Today</h2>
<ol>
<li><strong>Claude 3.5 Sonnet</strong> - Most intelligent AI model yet</li>
<li><strong>Linear 2.0</strong> - Project management reimagined</li>
<li><strong>Raycast AI</strong> - AI-powered productivity tool</li>
<li><strong>Arc Browser 2.0</strong> - The browser of the future</li>
</ol>
<p><a href="#">View all products</a></p>`,
    date: minutesAgo(30),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: { name: 'Hacker News', email: 'digest@hn.algolia.com' },
    to: [personalRecipient],
    subject: 'HN Daily: Top stories for January 8',
    preview: 'Show HN: I built a real-time collaborative code editor, The state of WebAssembly in 2025...',
    body: `<h2>Top Stories on Hacker News</h2>
<ol>
<li><strong>Show HN: I built a real-time collaborative code editor</strong> (423 points)</li>
<li><strong>The state of WebAssembly in 2025</strong> (312 points)</li>
<li><strong>PostgreSQL 17 is now available</strong> (287 points)</li>
<li><strong>Why we moved from Kubernetes to bare metal</strong> (256 points)</li>
</ol>
<p><a href="#">Read on HN</a></p>`,
    date: hoursAgo(2),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: { name: 'CNAS Advising', email: 'cnas-advising@ucr.edu' },
    to: [ucrRecipient],
    subject: 'Spring 2025 Registration Reminder',
    preview: 'Your enrollment appointment opens on January 13. Review your DPR and plan your schedule...',
    body: `<p>Dear Michael,</p>
<p>Your Spring 2025 enrollment appointment opens on <strong>January 13, 2025 at 8:00 AM</strong>.</p>
<p><strong>Before registration:</strong></p>
<ul>
<li>Review your Degree Progress Report (DPR)</li>
<li>Check your holds in R'Web</li>
<li>Plan your schedule using Schedule Planner</li>
<li>Meet with your faculty advisor if needed</li>
</ul>
<p><strong>Recommended courses for your major:</strong></p>
<ul>
<li>CS 161 - Design and Architecture of Computer Systems</li>
<li>CS 166 - Database Management Systems</li>
</ul>
<p><a href="#">Access R'Web</a></p>
<p>CNAS Academic Advising</p>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: generateThreadId(),
    isDraft: false,
  },
]

// Reply chain emails - additional messages in the top 5 threads to create visible reply chains
const replyChainEmails: Email[] = [
  // CS 171 Project thread - 3 previous messages
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.canvas,
    to: [ucrRecipient],
    subject: 'CS 171 Final Project - Initial Submission Open',
    preview: 'The submission portal for the CS 171 Final Project is now open...',
    body: `<p>Hi Michael,</p>
<p>The submission portal for your CS 171 Final Project is now open.</p>
<p><strong>Due:</strong> Friday, January 10 at 11:59 PM PST</p>
<p>You may submit multiple times - only your latest submission will be graded.</p>`,
    date: daysAgo(5),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CS171_PROJECT,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.canvas,
    to: [ucrRecipient],
    subject: 'RE: CS 171 Final Project - Clarification on Requirements',
    preview: 'Hi class, several students have asked about the model architecture requirements...',
    body: `<p>Hi class,</p>
<p>Several students have asked about the model architecture requirements. To clarify:</p>
<ul>
<li>You may use any CNN architecture (ResNet, VGG, custom)</li>
<li>Minimum accuracy requirement: 85% on test set</li>
<li>Include training curves in your report</li>
</ul>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CS171_PROJECT,
    isDraft: false,
  },
  // CS 153 Office Hours thread - 2 previous messages
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.salloum,
    to: [{ name: 'CS 153 Students', email: 'cs153-w25@ucr.edu' }],
    subject: 'CS 153 - Office Hours Schedule for Week 2',
    preview: 'Office hours for this week will be held Tuesday and Thursday 2-4 PM...',
    body: `<p>Hi everyone,</p>
<p>Office hours for this week:</p>
<ul>
<li>Tuesday 2-4 PM in WCH 217</li>
<li>Thursday 2-4 PM in WCH 217</li>
</ul>
<p>Best,<br/>Dr. Salloum</p>`,
    date: daysAgo(7),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CS153_OFFICE,
    isDraft: false,
  },
  // Career Fair thread - 2 previous messages
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.careercenter,
    to: [{ name: 'Engineering Students', email: 'bcoe-students@ucr.edu' }],
    subject: 'Save the Date: Winter Career Fair - January 9th',
    preview: 'Mark your calendars! The BCOE Winter Career Fair is coming up...',
    body: `<p>Dear Engineering Students,</p>
<p>Mark your calendars! The <strong>Bourns College of Engineering Winter Career Fair</strong> is scheduled for:</p>
<p><strong>Date:</strong> Thursday, January 9th</p>
<p><strong>Time:</strong> 10 AM - 3 PM</p>
<p><strong>Location:</strong> SRC Arena</p>
<p>More details coming soon!</p>`,
    date: daysAgo(14),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CAREER_FAIR,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'ucr',
    accountColor: colors.blue,
    from: senders.careercenter,
    to: [{ name: 'Engineering Students', email: 'bcoe-students@ucr.edu' }],
    subject: 'RE: Winter Career Fair - Company List Preview',
    preview: 'Excited to share a preview of companies attending the career fair...',
    body: `<p>Dear Engineering Students,</p>
<p>Here's an early preview of some confirmed companies:</p>
<ul>
<li>Google</li>
<li>Amazon</li>
<li>Meta</li>
<li>Qualcomm</li>
</ul>
<p>Full list coming next week!</p>`,
    date: daysAgo(7),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.CAREER_FAIR,
    isDraft: false,
  },
  // GitHub PR thread - 3 previous messages
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.github,
    to: [personalRecipient],
    subject: '[react-pdf-viewer] PR #847 opened: Add dark mode support',
    preview: '@nicholasyang opened a new pull request. This PR adds dark mode support to the PDF viewer...',
    body: `<p><strong>@nicholasyang</strong> opened this pull request:</p>
<h3>Add dark mode support to PDF viewer component</h3>
<p>This is the initial implementation of dark mode. Looking for feedback on the color choices.</p>`,
    date: daysAgo(3),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.GITHUB_PR,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.github,
    to: [personalRecipient],
    subject: '[react-pdf-viewer] PR #847: @mchen commented',
    preview: '@mchen left a comment: "Looks good! A few suggestions on the color palette..."',
    body: `<p><strong>@mchen</strong> commented:</p>
<blockquote>
<p>Looks good! A few suggestions:</p>
<ul>
<li>Consider using CSS custom properties for easier theming</li>
<li>The contrast ratio might need adjustment for accessibility</li>
</ul>
</blockquote>`,
    date: daysAgo(2),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.GITHUB_PR,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.github,
    to: [personalRecipient],
    subject: '[react-pdf-viewer] PR #847: @nicholasyang pushed new commits',
    preview: '@nicholasyang pushed 2 new commits addressing review feedback...',
    body: `<p><strong>@nicholasyang</strong> pushed 2 commits:</p>
<ul>
<li>fix: Update color contrast ratios for WCAG compliance</li>
<li>refactor: Use CSS custom properties for theming</li>
</ul>`,
    date: daysAgo(1),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.GITHUB_PR,
    isDraft: false,
  },
  // LeetCode thread - 2 previous messages
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.leetcode,
    to: [personalRecipient],
    subject: "40-day streak! You're on a roll!",
    preview: "Amazing! You've hit a 40-day streak. Keep the momentum going...",
    body: `<p>Hey Michael,</p>
<p>You're on a <strong>40-day streak</strong>! That's incredible dedication!</p>
<p>Today's challenge: <strong>LRU Cache</strong> (Medium)</p>
<p><a href="#">Solve Now</a></p>`,
    date: daysAgo(5),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.LEETCODE,
    isDraft: false,
  },
  {
    id: generateId(),
    accountId: 'personal',
    accountColor: colors.green,
    from: senders.leetcode,
    to: [personalRecipient],
    subject: "Congrats! You're in the Top 10% of problem solvers",
    preview: "You've solved 200+ problems and earned a spot in the Top 10%...",
    body: `<p>Hey Michael,</p>
<p>Congratulations! You've solved over <strong>200 problems</strong> and are now in the <strong>Top 10%</strong> of LeetCode problem solvers!</p>
<p>Current rating: <strong>1825</strong></p>
<p>Keep pushing to reach Knight rank!</p>`,
    date: daysAgo(10),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    folder: 'inbox',
    labels: [],
    threadId: THREAD_IDS.LEETCODE,
    isDraft: false,
  },
]

// Combine all emails
export const mockEmails: Email[] = [
  ...ucrEmails,
  ...personalEmails,
  ...moreUcrEmails,
  ...morePersonalEmails,
  ...bulkEmails,
  ...sentEmails,
  ...draftEmails,
  ...spamEmails,
  ...trashEmails,
  ...archiveEmails,
  ...additionalInboxEmails,
  ...replyChainEmails,
]

// Export email count for verification
export const MOCK_EMAIL_COUNT = mockEmails.length
