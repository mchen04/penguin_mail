import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ComposeRecipientsProps {
  to: string
  setTo: (value: string) => void
  cc: string
  setCc: (value: string) => void
  bcc: string
  setBcc: (value: string) => void
  showCcBcc: boolean
  setShowCcBcc: (value: boolean) => void
}

export function ComposeRecipients({
  to,
  setTo,
  cc,
  setCc,
  bcc,
  setBcc,
  showCcBcc,
  setShowCcBcc,
}: ComposeRecipientsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="to">To</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCcBcc(!showCcBcc)}
            className="h-auto p-1 text-xs"
          >
            {showCcBcc ? (
              <>
                <ChevronUp className="mr-1 h-3 w-3" />
                Hide CC/BCC
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3 w-3" />
                Add CC/BCC
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
          className="bg-background"
        />
      </div>

      {showCcBcc && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="cc">CC</Label>
            <Input
              id="cc"
              type="email"
              placeholder="cc@example.com"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bcc">BCC</Label>
            <Input
              id="bcc"
              type="email"
              placeholder="bcc@example.com"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              className="bg-background"
            />
          </div>
        </>
      )}
    </>
  )
}