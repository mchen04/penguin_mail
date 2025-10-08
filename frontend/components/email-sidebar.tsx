"use client"

import { Button } from "@/components/ui/button"
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
      <div className="p-4 border-b border-border">
        <Button onClick={onCompose} className="w-full" size="lg">
          <PenSquare className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>
      <nav className="flex-1 p-2">
        {folders.map((folder) => {
          const Icon = folder.icon
          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                currentFolder === folder.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="font-medium">{folder.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">{folder.count}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
