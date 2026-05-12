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
import { cn } from "@/lib/utils"

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
    <Card
      className={cn(
        "border-border/70 bg-card/75 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/95 hover:shadow-sm",
        note.isPinned && "border-primary/25 bg-primary/5",
      )}
    >
      <CardHeader className="gap-2">
        <CardTitle className="flex min-w-0 items-center gap-2 pr-3 text-base font-semibold">
          {note.isPinned ? (
            <PinIcon className="shrink-0 text-primary" />
          ) : null}
          <span className="truncate">{note.title}</span>
        </CardTitle>
        <CardDescription className="line-clamp-3 leading-6 text-muted-foreground">
          {getPreview(note.content)}
        </CardDescription>
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
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {note.subject ? (
            <Badge variant="secondary" className="rounded-full">
              {note.subject}
            </Badge>
          ) : null}
          {note.source === "ai_summary" ? (
            <Badge
              variant="outline"
              className="rounded-full border-primary/25 bg-primary/10 text-primary"
            >
              <SparklesIcon data-icon="inline-start" />
              AI Summary
            </Badge>
          ) : null}
          {note.source === "imported" ? (
            <Badge variant="outline" className="rounded-full">
              Imported
            </Badge>
          ) : null}
        </div>

        {note.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
            {hiddenTagsCount ? (
              <Badge variant="ghost" className="rounded-full">
                +{hiddenTagsCount}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between gap-3 border-border/70 bg-transparent text-xs text-muted-foreground">
        <span>Created {formatNoteDate(note.createdAt)}</span>
        <span>Updated {formatNoteDate(note.updatedAt)}</span>
      </CardFooter>
    </Card>
  )
}
