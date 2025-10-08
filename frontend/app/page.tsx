"use client"

import { useState } from "react"
import { EmailSidebar } from "@/components/email-sidebar"
import { EmailList } from "@/components/email-list"
import { EmailPreview } from "@/components/email-preview"
import { ComposeModal } from "@/components/compose-modal"
import { mockEmails, type Email } from "@/lib/mock-data"

export default function EmailClient() {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [currentFolder, setCurrentFolder] = useState<"inbox" | "sent" | "trash">("inbox")
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"folders" | "list" | "preview">("folders")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const filteredEmails = emails.filter((email) => email.folder === currentFolder)

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
    setMobileView("preview")
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
        setMobileView("list")
      }
    } else {
      // Move to trash
      setEmails((prev) => prev.map((e) => (e.id === emailId ? { ...e, folder: "trash" } : e)))
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
        setMobileView("list")
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
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block md:w-64 lg:w-72 border-r border-border">
        <EmailSidebar
          currentFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onCompose={() => setIsComposeOpen(true)}
          emailCounts={{
            inbox: emails.filter((e) => e.folder === "inbox").length,
            sent: emails.filter((e) => e.folder === "sent").length,
            trash: emails.filter((e) => e.folder === "trash").length,
          }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background">
            <EmailSidebar
              currentFolder={currentFolder}
              onFolderChange={handleFolderChange}
              onCompose={() => {
                setIsComposeOpen(true)
                setIsSidebarOpen(false)
              }}
              emailCounts={{
                inbox: emails.filter((e) => e.folder === "inbox").length,
                sent: emails.filter((e) => e.folder === "sent").length,
                trash: emails.filter((e) => e.folder === "trash").length,
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile: Folders View */}
      <div className={`flex-1 md:hidden ${mobileView === "folders" ? "block" : "hidden"}`}>
        <EmailSidebar
          currentFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onCompose={() => setIsComposeOpen(true)}
          emailCounts={{
            inbox: emails.filter((e) => e.folder === "inbox").length,
            sent: emails.filter((e) => e.folder === "sent").length,
            trash: emails.filter((e) => e.folder === "trash").length,
          }}
        />
      </div>

      {/* Email List */}
      <div
        className={`flex-1 md:flex md:w-80 lg:w-96 border-r border-border ${
          mobileView === "list" ? "block" : "hidden md:block"
        }`}
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
      </div>

      {/* Email Preview */}
      <div className={`flex-1 ${mobileView === "preview" ? "block" : "hidden md:block"}`}>
        <EmailPreview email={selectedEmail} onBack={handleBackToList} onDelete={handleDelete} />
      </div>

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
