"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  Paperclip,
  Save,
  Clock,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  }, [isOpen, isFormValid, to, subject, message])

  const handleSend = () => {
    if (isFormValid) {
      onSend({ to: to.trim(), subject: subject.trim(), message: message.trim() })
      resetForm()
    }
  }

  const resetForm = () => {
    setTo("")
    setCc("")
    setBcc("")
    setSubject("")
    setMessage("")
    setShowCcBcc(false)
    setWordCount(0)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSaveDraft = () => {
    // TODO: Implement draft saving
    console.log("Save draft:", { to, cc, bcc, subject, message })
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
            {/* To Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="to" className="text-sm font-medium">
                  To
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showCcBcc ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide Cc/Bcc
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Add Cc/Bcc
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="to"
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                autoComplete="email"
                className="transition-all"
              />
            </div>

            {/* CC/BCC Fields - Collapsible */}
            {showCcBcc && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label htmlFor="cc" className="text-sm font-medium">
                    Cc
                  </Label>
                  <Input
                    id="cc"
                    type="email"
                    placeholder="cc@example.com"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    autoComplete="email"
                    className="transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bcc" className="text-sm font-medium">
                    Bcc
                  </Label>
                  <Input
                    id="bcc"
                    type="email"
                    placeholder="bcc@example.com"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    autoComplete="email"
                    className="transition-all"
                  />
                </div>
              </div>
            )}

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="transition-all"
              />
            </div>

            {/* Rich Text Toolbar */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 border border-border rounded-md bg-muted/30 dark:bg-muted/10">
                <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => insertFormatting("**", "**")}
                    className="h-7 w-7"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => insertFormatting("*", "*")}
                    className="h-7 w-7"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => insertFormatting("__", "__")}
                    className="h-7 w-7"
                    title="Underline (Ctrl+U)"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-0.5 pr-2 border-r border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => insertFormatting("- ")}
                    className="h-7 w-7"
                    title="Bulleted List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => insertFormatting("1. ")}
                    className="h-7 w-7"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => insertFormatting("[", "](url)")}
                    className="h-7 w-7"
                    title="Insert Link"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex-1" />

                {/* Word Count */}
                <span className="text-xs text-muted-foreground px-2">
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
              </div>

              {/* Message Textarea */}
              <Textarea
                ref={textareaRef}
                id="message"
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={20}
                className={cn(
                  "resize-none transition-all min-h-[400px] font-sans",
                  "focus-visible:ring-2"
                )}
                required
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 dark:bg-muted/5">
          <div className="flex items-center justify-between w-full gap-3">
            {/* Left side - Secondary actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="gap-2 text-muted-foreground hover:text-foreground"
                title="Attach files (coming soon)"
              >
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:inline">Attach</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleSaveDraft}
                className="gap-2 text-muted-foreground hover:text-foreground"
                title="Save as draft"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save Draft</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="gap-2 text-muted-foreground hover:text-foreground"
                title="Schedule send (coming soon)"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
            </div>

            {/* Right side - Primary actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                type="button"
                size="default"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!isFormValid}
                type="submit"
                size="default"
                className="gap-2 min-w-[100px]"
              >
                <Send className="h-4 w-4" />
                Send
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-1">
                  <span className="text-xs">⌘</span>↵
                </kbd>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
