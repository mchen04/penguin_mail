"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Inbox, Send, Trash2, PenSquare } from "lucide-react"

interface EmailSidebarProps {
  currentFolder: "inbox" | "sent" | "trash"
  onFolderChange: (folder: "inbox" | "sent" | "trash") => void
  onCompose: () => void
  emailCounts: {
    inbox: number
    sent: number
    trash: number
  }
}

export function EmailSidebar({ currentFolder, onFolderChange, onCompose, emailCounts }: EmailSidebarProps) {
  const folders = [
    { id: "inbox" as const, label: "Inbox", icon: Inbox, count: emailCounts.inbox },
    { id: "sent" as const, label: "Sent", icon: Send, count: emailCounts.sent },
    { id: "trash" as const, label: "Trash", icon: Trash2, count: emailCounts.trash },
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Compose & Theme Toggle */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Button onClick={onCompose} className="flex-1" size="lg">
          <PenSquare />
          Compose
        </Button>
        <ThemeToggle />
      </div>

      {/* Folder Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {folders.map((folder) => {
          const Icon = folder.icon
          const isActive = currentFolder === folder.id

          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={`
                w-full flex items-center justify-between
                px-4 py-3 rounded-lg text-left
                transition-colors duration-[var(--transition-base)]
                ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50 text-foreground"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{folder.label}</span>
              </div>
              {folder.count > 0 && (
                <span
                  className={`
                    text-sm tabular-nums
                    ${isActive ? "text-accent-foreground/70" : "text-muted-foreground"}
                  `}
                >
                  {folder.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
