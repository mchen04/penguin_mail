"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (email: { to: string; subject: string; message: string }) => void
}

export function ComposeModal({ isOpen, onClose, onSend }: ComposeModalProps) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const isFormValid = to.trim() && subject.trim() && message.trim()

  const handleSend = () => {
    if (isFormValid) {
      onSend({ to: to.trim(), subject: subject.trim(), message: message.trim() })
      // Reset form
      setTo("")
      setSubject("")
      setMessage("")
    }
  }

  const handleClose = () => {
    setTo("")
    setSubject("")
    setMessage("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent style={{ maxWidth: 'var(--modal-max-width)' }}>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 py-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          {/* To Field */}
          <div className="space-y-2">
            <Label htmlFor="to" className="text-label">
              To
            </Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-label">
              Subject
            </Label>
            <Input
              id="subject"
              type="text"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-label">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="resize-none"
              required
            />
          </div>
        </form>

        <DialogFooter className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!isFormValid}
            type="submit"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
