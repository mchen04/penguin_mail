"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Save, Clock, X } from "lucide-react"
import { ComposeToolbar } from "@/components/compose-toolbar"
import { ComposeRecipients } from "@/components/compose-recipients"

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (email: { to: string; subject: string; message: string }) => void
}

export function ComposeModal({ isOpen, onClose, onSend }: ComposeModalProps) {
  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isFormValid = to.trim() && subject.trim() && message.trim()

  // Update word count when message changes
  useEffect(() => {
    const words = message.trim().split(/\s+/).filter(word => word.length > 0).length
    setWordCount(words)
  }, [message])

  const resetForm = useCallback(() => {
    setTo("")
    setCc("")
    setBcc("")
    setSubject("")
    setMessage("")
    setShowCcBcc(false)
    setWordCount(0)
  }, [])

  const handleSend = useCallback(() => {
    if (isFormValid) {
      onSend({ to: to.trim(), subject: subject.trim(), message: message.trim() })
      resetForm()
    }
  }, [isFormValid, to, subject, message, onSend, resetForm])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to send
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && isFormValid) {
        e.preventDefault()
        handleSend()
      }
      // Escape to close
      if (e.key === "Escape" && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
        handleClose()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isFormValid, handleClose, handleSend])

  const handleSaveDraft = () => {
    // TODO: Implement draft saving
    // Draft data: { to, cc, bcc, subject, message }
  }

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = message.substring(start, end)
    const newText = message.substring(0, start) + before + selectedText + after + message.substring(end)

    setMessage(newText)

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[var(--modal-max-width)] h-[85vh] max-h-[900px] flex flex-col p-0 gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">New Message</DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              className="hover:bg-accent"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <ComposeRecipients
              to={to}
              setTo={setTo}
              cc={cc}
              setCc={setCc}
              bcc={bcc}
              setBcc={setBcc}
              showCcBcc={showCcBcc}
              setShowCcBcc={setShowCcBcc}
            />

            {/* Subject Field */}
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            {/* Message Field with Toolbar */}
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <div className="border rounded-lg overflow-hidden bg-background">
                <ComposeToolbar onInsertFormatting={insertFormatting} />
                <Textarea
                  ref={textareaRef}
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="min-h-[300px] border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="px-3 py-2 border-t text-xs text-muted-foreground">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border flex-row items-center gap-2">
          <Button
            onClick={handleSend}
            disabled={!isFormValid}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSaveDraft}
            aria-label="Save draft"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Schedule send"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}