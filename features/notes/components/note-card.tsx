"use client"

import { EditIcon, PinIcon, SparklesIcon, Trash2Icon } from "lucide-react"

import type { Note } from "@/features/notes/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function getPreview(content: string) {
  const preview = content.replace(/\s+/g, " ").trim()

  return preview.length > 180 ? `${preview.slice(0, 180)}...` : preview
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}) {
  const visibleTags = note.tags.slice(0, 4)
  const hiddenTagsCount = Math.max(note.tags.length - visibleTags.length, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {note.isPinned ? (
                <PinIcon className="shrink-0 text-primary" />
              ) : null}
              <CardTitle className="truncate">{note.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {getPreview(note.content)}
            </CardDescription>
          </div>
          <CardAction className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${note.title}`}
              onClick={() => onEdit(note)}
            >
              <EditIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${note.title}`}
              onClick={() => onDelete(note)}
            >
              <Trash2Icon />
            </Button>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {note.subject ? (
            <Badge variant="secondary">{note.subject}</Badge>
          ) : null}
          {note.source === "ai_summary" ? (
            <Badge>
              <SparklesIcon data-icon="inline-start" />
              AI Summary
            </Badge>
          ) : null}
          {note.source === "imported" ? (
            <Badge variant="outline">Imported</Badge>
          ) : null}
        </div>

        {note.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {hiddenTagsCount ? (
              <Badge variant="ghost">+{hiddenTagsCount}</Badge>
            ) : null}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between text-xs text-muted-foreground">
        <span>Created {formatNoteDate(note.createdAt)}</span>
        <span>Updated {formatNoteDate(note.updatedAt)}</span>
      </CardFooter>
    </Card>
  )
}
