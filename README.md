# Penguin Mail

A modern, self-hosted webmail client designed for simplicity and privacy.

## Overview

Penguin Mail provides a clean, intuitive interface for managing email on any standard IMAP/SMTP server. Built with modern web technologies, it delivers an application-like experience without the complexity of traditional self-hosted solutions.

## Features

- **Easy Self-Hosting**: Simple setup and deployment process
- **Modern Interface**: Clean, responsive design that works across devices
- **Standard Protocol Support**: Compatible with any IMAP/SMTP server
- **Core Email Features**: Compose, reply, forward, and organize emails
- **Folder Management**: Organize your inbox with folder support
- **Privacy-Focused**: Full control over your data with self-hosting

## Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/penguin_mail.git

# Navigate to frontend directory
cd penguin_mail/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and mock data
├── public/          # Static assets
└── package.json     # Project dependencies
```

## Team

- Mark Ghebrial - mgheb003@ucr.edu
- Charlie Knox - cknox008@ucr.edu
- Danny Topete - dtope004@ucr.edu
- Michael Chen - mchen356@ucr.edu

## License

Open source - details to be added.

## Acknowledgments

Inspired by existing webmail solutions including RoundCube, Mailpile, SquirrelMail, and Rainloop, with a focus on modern architecture and simplified self-hosting.
