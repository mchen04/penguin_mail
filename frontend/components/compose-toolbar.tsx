import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react"

interface ComposeToolbarProps {
  onInsertFormatting: (before: string, after?: string) => void
}

export function ComposeToolbar({ onInsertFormatting }: ComposeToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b px-3 py-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onInsertFormatting('**', '**')}
        className="h-8 w-8 p-0"
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onInsertFormatting('*', '*')}
        className="h-8 w-8 p-0"
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onInsertFormatting('<u>', '</u>')}
        className="h-8 w-8 p-0"
        aria-label="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-4 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onInsertFormatting('[', '](url)')}
        className="h-8 w-8 p-0"
        aria-label="Insert link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-4 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onInsertFormatting('- ', '')}
        className="h-8 w-8 p-0"
        aria-label="Bulleted list"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onInsertFormatting('1. ', '')}
        className="h-8 w-8 p-0"
        aria-label="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  )
}