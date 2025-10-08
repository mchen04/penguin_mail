export interface Email {
  id: string
  from: string
  to: string
  subject: string
  body: string
  preview: string
  timestamp: Date
  isRead: boolean
  folder: "inbox" | "sent" | "trash"
}

export const mockEmails: Email[] = [
  {
    id: "1",
    from: "sarah.johnson@company.com",
    to: "me@example.com",
    subject: "Q4 Project Update - Action Required",
    body: "Hi team,\n\nI wanted to provide an update on our Q4 project timeline. We've made significant progress on the frontend implementation, but we need to discuss the API integration timeline.\n\nCould we schedule a meeting this week to align on priorities? I've attached the latest project roadmap for your review.\n\nBest regards,\nSarah",
    preview: "Hi team, I wanted to provide an update on our Q4 project timeline. We've made significant progress...",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    folder: "inbox",
  },
  {
    id: "2",
    from: "notifications@github.com",
    to: "me@example.com",
    subject: "[Repository] New pull request opened",
    body: "A new pull request has been opened in your repository.\n\nPull Request: #142 - Add email client component\nAuthor: @developer123\nDescription: This PR adds a new responsive email client component with full mobile support.\n\nView on GitHub: https://github.com/...",
    preview: "A new pull request has been opened in your repository. Pull Request: #142 - Add email client...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    folder: "inbox",
  },
  {
    id: "3",
    from: "marketing@newsletter.com",
    to: "me@example.com",
    subject: "Weekly Design Inspiration - Issue #47",
    body: "Hello!\n\nWelcome to this week's design inspiration newsletter. We've curated the best UI/UX designs from around the web.\n\nThis week's highlights:\n- Minimalist dashboard designs\n- Creative navigation patterns\n- Innovative form interactions\n\nEnjoy!\nThe Newsletter Team",
    preview: "Hello! Welcome to this week's design inspiration newsletter. We've curated the best UI/UX designs...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
    folder: "inbox",
  },
  {
    id: "4",
    from: "michael.chen@client.com",
    to: "me@example.com",
    subject: "Re: Website Redesign Proposal",
    body: "Thanks for sending over the proposal. The team has reviewed it and we're impressed with your approach.\n\nWe'd like to move forward with Phase 1 as outlined. Can you send over the contract and timeline details?\n\nLooking forward to working together!\n\nMichael",
    preview: "Thanks for sending over the proposal. The team has reviewed it and we're impressed with your approach...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    folder: "inbox",
  },
  {
    id: "5",
    from: "support@service.com",
    to: "me@example.com",
    subject: "Your subscription has been renewed",
    body: "Hi there,\n\nThis is a confirmation that your annual subscription has been successfully renewed.\n\nSubscription: Pro Plan\nAmount: $99.00\nNext billing date: December 15, 2025\n\nThank you for being a valued customer!\n\nBest,\nSupport Team",
    preview: "Hi there, This is a confirmation that your annual subscription has been successfully renewed...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: false,
    folder: "inbox",
  },
  {
    id: "6",
    from: "emily.rodriguez@partner.com",
    to: "me@example.com",
    subject: "Collaboration Opportunity",
    body: "Hello,\n\nI came across your work and I'm really impressed with your portfolio. We're looking for a frontend developer to collaborate on an exciting new project.\n\nWould you be interested in a quick call next week to discuss the details?\n\nBest regards,\nEmily Rodriguez",
    preview: "Hello, I came across your work and I'm really impressed with your portfolio. We're looking for...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true,
    folder: "inbox",
  },
  {
    id: "7",
    from: "team@slack.com",
    to: "me@example.com",
    subject: "You've been added to a new workspace",
    body: "Hi,\n\nYou've been added to the 'Design Team' workspace on Slack.\n\nWorkspace: Design Team\nInvited by: john.doe@company.com\n\nClick here to join: https://slack.com/...\n\nWelcome aboard!\nSlack Team",
    preview: "Hi, You've been added to the 'Design Team' workspace on Slack. Workspace: Design Team...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    isRead: true,
    folder: "inbox",
  },
  {
    id: "8",
    from: "alex.thompson@vendor.com",
    to: "me@example.com",
    subject: "Invoice #2024-1156",
    body: "Dear Customer,\n\nPlease find attached invoice #2024-1156 for services rendered in November 2024.\n\nAmount due: $2,450.00\nDue date: December 20, 2024\n\nPayment instructions are included in the attached PDF.\n\nThank you,\nAlex Thompson\nAccounts Receivable",
    preview: "Dear Customer, Please find attached invoice #2024-1156 for services rendered in November 2024...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    isRead: false,
    folder: "inbox",
  },
  {
    id: "9",
    from: "me@example.com",
    to: "client@business.com",
    subject: "Project Delivery - Final Files",
    body: "Hi,\n\nI'm pleased to deliver the final project files as discussed. All assets have been uploaded to the shared drive.\n\nDeliverables include:\n- Source files\n- Exported assets\n- Documentation\n- Style guide\n\nPlease let me know if you need any revisions.\n\nBest regards",
    preview: "Hi, I'm pleased to deliver the final project files as discussed. All assets have been uploaded...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: true,
    folder: "sent",
  },
  {
    id: "10",
    from: "me@example.com",
    to: "team@company.com",
    subject: "Meeting Notes - Design Review",
    body: "Team,\n\nHere are the notes from today's design review meeting:\n\n1. Homepage redesign approved\n2. Color palette needs adjustment\n3. Mobile navigation to be revised\n4. Next review scheduled for Friday\n\nAction items have been added to the project board.\n\nThanks,\nMe",
    preview: "Team, Here are the notes from today's design review meeting: 1. Homepage redesign approved...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true,
    folder: "sent",
  },
  {
    id: "11",
    from: "spam@marketing.com",
    to: "me@example.com",
    subject: "Limited Time Offer - 50% Off!",
    body: "Don't miss out on this amazing deal! Get 50% off all products for the next 24 hours only!\n\nClick here to shop now: [link]\n\nThis offer expires soon!",
    preview: "Don't miss out on this amazing deal! Get 50% off all products for the next 24 hours only!...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    isRead: true,
    folder: "trash",
  },
  {
    id: "12",
    from: "old-client@business.com",
    to: "me@example.com",
    subject: "Old Project Files",
    body: "Hi, do you still have the files from our 2023 project? I need to reference them for a new initiative.\n\nThanks!",
    preview: "Hi, do you still have the files from our 2023 project? I need to reference them for a new...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    isRead: true,
    folder: "trash",
  },
  {
    id: "13",
    from: "jessica.lee@startup.com",
    to: "me@example.com",
    subject: "Quick Question About Your Services",
    body: "Hi,\n\nI'm reaching out from a startup that's looking to revamp our web presence. I saw your work on Dribbble and would love to learn more about your process and availability.\n\nDo you have time for a brief call this week?\n\nThanks,\nJessica",
    preview: "Hi, I'm reaching out from a startup that's looking to revamp our web presence. I saw your work...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    isRead: false,
    folder: "inbox",
  },
  {
    id: "14",
    from: "calendar@google.com",
    to: "me@example.com",
    subject: "Reminder: Team Standup in 1 hour",
    body: "This is a reminder that you have an upcoming event:\n\nEvent: Team Standup\nTime: Today at 10:00 AM\nLocation: Zoom Meeting\n\nJoin URL: https://zoom.us/...\n\nSee you there!",
    preview: "This is a reminder that you have an upcoming event: Team Standup at 10:00 AM...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    isRead: true,
    folder: "inbox",
  },
  {
    id: "15",
    from: "david.park@agency.com",
    to: "me@example.com",
    subject: "Freelance Opportunity - E-commerce Project",
    body: "Hello,\n\nWe're an agency working on a large e-commerce project and we're looking for an experienced frontend developer to join our team on a contract basis.\n\nProject duration: 3 months\nRate: Competitive\nStart date: January 2025\n\nInterested? Let's chat!\n\nDavid",
    preview: "Hello, We're an agency working on a large e-commerce project and we're looking for an experienced...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
    isRead: false,
    folder: "inbox",
  },
]
