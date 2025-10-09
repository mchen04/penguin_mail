"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Menu, MoreVertical, Trash2 } from "lucide-react"
import type { Email } from "@/lib/mock-data"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EmailListProps {
  emails: Email[]
  selectedEmail: Email | null
  onEmailClick: (email: Email) => void
  onToggleRead: (emailId: string) => void
  onDelete: (emailId: string) => void
  currentFolder: string
  onMenuClick: () => void
  onBackToFolders: () => void
}

export function EmailList({
  emails,
  selectedEmail,
  onEmailClick,
  onToggleRead,
  onDelete,
  currentFolder,
  onMenuClick,
}: EmailListProps) {
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden touch-target"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold capitalize flex-1">{currentFolder}</h2>
      </header>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-muted-foreground space-y-2">
              <p className="text-lg font-medium">No emails</p>
              <p className="text-sm">This folder is empty</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id
              const isUnread = !email.isRead

              return (
                <article
                  key={email.id}
                  onClick={() => onEmailClick(email)}
                  className={`
                    p-3 md:p-4 cursor-pointer
                    transition-colors duration-[var(--transition-fast)]
                    hover:bg-accent/50
                    ${isSelected ? "bg-accent" : ""}
                    ${isUnread ? "bg-muted/30" : ""}
                  `}
                  aria-label={`Email from ${email.from}: ${email.subject}`}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(email.from)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Email Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header row: Sender & timestamp */}
                      <div className="flex items-start justify-between gap-1 md:gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                          <span
                            className={`
                              text-xs md:text-sm line-clamp-1 break-words
                              ${isUnread ? "font-semibold" : "font-medium"}
                            `}
                          >
                            {email.from}
                          </span>
                          {isUnread && (
                            <Badge
                              variant="default"
                              className="h-2 w-2 p-0 rounded-full flex-shrink-0"
                              aria-label="Unread"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                          <time
                            className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap"
                            dateTime={email.timestamp.toISOString()}
                          >
                            {formatDistanceToNow(email.timestamp, { addSuffix: true })}
                          </time>

                          {/* Actions dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 md:h-6 md:w-6"
                                aria-label="Email actions"
                              >
                                <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleRead(email.id)
                                }}
                              >
                                Mark as {email.isRead ? "unread" : "read"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(email.id)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Subject */}
                      <p
                        className={`
                          text-xs md:text-sm mb-1
                          line-clamp-2 md:line-clamp-1
                          text-balance break-words
                          ${isUnread ? "font-medium" : "text-muted-foreground"}
                        `}
                      >
                        {email.subject}
                      </p>

                      {/* Preview */}
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 break-words">
                        {email.preview}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
