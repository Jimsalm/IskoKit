"use client"

import {
  CheckIcon,
  MessageSquareTextIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function AnnotationToolbar({
  highlightColor,
  highlightColors,
  selectedNoteText,
  hasSelectedNote,
  hasSelectedAnnotation,
  hasAnnotations,
  onHighlightColorChange,
  onSelectedNoteTextChange,
  onAddNote,
  onDeleteSelected,
  onSave,
}: {
  highlightColor: string
  highlightColors: readonly string[]
  selectedNoteText: string
  hasSelectedNote: boolean
  hasSelectedAnnotation: boolean
  hasAnnotations: boolean
  onHighlightColorChange: (color: string) => void
  onSelectedNoteTextChange: (text: string) => void
  onAddNote: () => void
  onDeleteSelected: () => void
  onSave: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annotations</CardTitle>
        <CardDescription>
          Add highlights and text notes to the selected page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel>Highlight color</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {highlightColors.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "grid size-8 place-items-center rounded-full border shadow-sm transition-transform hover:scale-105",
                  highlightColor === color && "ring-2 ring-ring ring-offset-2",
                )}
                style={{ backgroundColor: color }}
                aria-label={`Use highlight color ${color}`}
                onClick={() => onHighlightColorChange(color)}
              >
                {highlightColor === color ? (
                  <CheckIcon className="size-4 text-black" />
                ) : null}
              </button>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="note-text">Selected note text</FieldLabel>
          <Input
            id="note-text"
            value={selectedNoteText}
            disabled={!hasSelectedNote}
            placeholder="Add a comment or reminder"
            onChange={(event) => onSelectedNoteTextChange(event.target.value)}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onAddNote}>
            <MessageSquareTextIcon data-icon="inline-start" />
            Add note
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!hasSelectedAnnotation}
            onClick={onDeleteSelected}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete selected
          </Button>
          <Button type="button" disabled={!hasAnnotations} onClick={onSave}>
            <SaveIcon data-icon="inline-start" />
            Save annotated PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
