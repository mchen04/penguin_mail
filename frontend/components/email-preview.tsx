"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { Email } from "@/lib/mock-data"
import { format } from "date-fns"

interface EmailPreviewProps {
  email: Email | null
  onBack: () => void
  onDelete: (emailId: string) => void
}

export function EmailPreview({ email, onBack, onDelete }: EmailPreviewProps) {
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <div className="text-muted-foreground space-y-2">
          <p className="text-lg font-medium">No email selected</p>
          <p className="text-sm">Select an email to view its contents</p>
        </div>
      </div>
    )
  }

  const getInitials = (emailAddress: string) => {
    return emailAddress.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden touch-target"
          onClick={onBack}
          aria-label="Back to email list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="touch-target"
          onClick={() => onDelete(email.id)}
          aria-label="Delete email"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </header>

      {/* Email Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <article className="mx-auto max-w-3xl">
          {/* Subject */}
          <h1 className="text-2xl font-bold mb-6 text-balance">{email.subject}</h1>

          {/* Sender Info */}
          <section className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback>{getInitials(email.from)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-semibold truncate">{email.from}</p>
                <time
                  className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0"
                  dateTime={email.timestamp.toISOString()}
                >
                  {format(email.timestamp, "MMM d, yyyy 'at' h:mm a")}
                </time>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                To: {email.to}
              </p>
            </div>
          </section>

          {/* Email Body */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {email.body}
            </p>
          </div>
        </article>
      </main>
    </div>
  )
}
