"use client"

import { useState } from "react"
import { EmailSidebar } from "@/components/email-sidebar"
import { EmailList } from "@/components/email-list"
import { EmailPreview } from "@/components/email-preview"
import { ComposeModal } from "@/components/compose-modal"
import { mockEmails, type Email } from "@/lib/mock-data"
import { useBreakpoint } from "@/lib/hooks/use-breakpoint"

type MobileView = "folders" | "list" | "preview"

export default function EmailClient() {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [currentFolder, setCurrentFolder] = useState<"inbox" | "sent" | "trash">("inbox")
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>("list")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { isMobile } = useBreakpoint()
  const filteredEmails = emails.filter((email) => email.folder === currentFolder)

  // Calculate email counts once
  const emailCounts = {
    inbox: emails.filter((e) => e.folder === "inbox").length,
    sent: emails.filter((e) => e.folder === "sent").length,
    trash: emails.filter((e) => e.folder === "trash").length,
  }

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
    if (isMobile) {
      setMobileView("preview")
    }
    // Mark as read
    setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e)))
  }

  const handleToggleRead = (emailId: string) => {
    setEmails((prev) => prev.map((e) => (e.id === emailId ? { ...e, isRead: !e.isRead } : e)))
  }

  const handleDelete = (emailId: string) => {
    const emailToDelete = emails.find((e) => e.id === emailId)
    if (emailToDelete?.folder === "trash") {
      // Permanently delete
      setEmails((prev) => prev.filter((e) => e.id !== emailId))
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
        if (isMobile) setMobileView("list")
      }
    } else {
      // Move to trash
      setEmails((prev) => prev.map((e) => (e.id === emailId ? { ...e, folder: "trash" } : e)))
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
        if (isMobile) setMobileView("list")
      }
    }
  }

  const handleFolderChange = (folder: "inbox" | "sent" | "trash") => {
    setCurrentFolder(folder)
    setSelectedEmail(null)
    setMobileView("list")
    setIsSidebarOpen(false)
  }

  const handleBackToList = () => {
    setMobileView("list")
  }

  const handleBackToFolders = () => {
    setMobileView("folders")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop & Tablet Sidebar - Hidden on mobile */}
      <aside
        className="hidden md:block border-r border-border"
        style={{
          width: 'var(--sidebar-width-desktop)',
        }}
      >
        <EmailSidebar
          currentFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onCompose={() => setIsComposeOpen(true)}
          emailCounts={emailCounts}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 md:hidden"
          style={{ zIndex: 'var(--sidebar-backdrop, 40)' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />

          {/* Sidebar Panel */}
          <aside
            className="absolute left-0 top-0 bottom-0 bg-background shadow-lg transition-transform"
            style={{ width: 'var(--sidebar-width-mobile)' }}
          >
            <EmailSidebar
              currentFolder={currentFolder}
              onFolderChange={handleFolderChange}
              onCompose={() => {
                setIsComposeOpen(true)
                setIsSidebarOpen(false)
              }}
              emailCounts={emailCounts}
            />
          </aside>
        </div>
      )}

      {/* Mobile: Folders View - Only visible on mobile */}
      <div className={`flex-1 md:hidden ${mobileView === "folders" ? "block" : "hidden"}`}>
        <EmailSidebar
          currentFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onCompose={() => setIsComposeOpen(true)}
          emailCounts={emailCounts}
        />
      </div>

      {/* Email List - Responsive width */}
      <section
        className={`
          flex-1 md:w-80 lg:w-96 border-r border-border
          ${mobileView === "list" ? "block" : "hidden md:block"}
        `}
      >
        <EmailList
          emails={filteredEmails}
          selectedEmail={selectedEmail}
          onEmailClick={handleEmailClick}
          onToggleRead={handleToggleRead}
          onDelete={handleDelete}
          currentFolder={currentFolder}
          onMenuClick={() => setIsSidebarOpen(true)}
          onBackToFolders={handleBackToFolders}
        />
      </section>

      {/* Email Preview - Takes remaining space */}
      <main
        className={`
          flex-1
          ${mobileView === "preview" ? "block" : "hidden"}
          md:block
        `}
      >
        <EmailPreview email={selectedEmail} onBack={handleBackToList} onDelete={handleDelete} />
      </main>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={(email) => {
          const newEmail: Email = {
            id: Date.now().toString(),
            from: "me@example.com",
            to: email.to,
            subject: email.subject,
            body: email.message,
            preview: email.message.substring(0, 100),
            timestamp: new Date(),
            isRead: true,
            folder: "sent",
          }
          setEmails((prev) => [newEmail, ...prev])
          setIsComposeOpen(false)
        }}
      />
    </div>
  )
}
