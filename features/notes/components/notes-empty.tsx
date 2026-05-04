"use client"

import { NotebookTabsIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NotesEmpty({
  hasNotes,
  onCreate,
}: {
  hasNotes: boolean
  onCreate: () => void
}) {
  return (
    <Empty className="border border-border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {hasNotes ? <SearchIcon /> : <NotebookTabsIcon />}
        </EmptyMedia>
        <EmptyTitle>{hasNotes ? "No notes found" : "No notes yet"}</EmptyTitle>
        <EmptyDescription>
          {hasNotes
            ? "Try another search term or subject filter."
            : "Create your first study note and keep everything in one place."}
        </EmptyDescription>
      </EmptyHeader>
      {!hasNotes ? (
        <EmptyContent>
          <Button onClick={onCreate}>
            <PlusIcon data-icon="inline-start" />
            New note
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
