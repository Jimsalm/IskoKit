"use client"

import { PlusIcon, SearchIcon } from "lucide-react"

import type { NotesSort } from "@/features/notes/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const allSubjectsValue = "__all_subjects__"

export function NoteToolbar({
  search,
  subject,
  subjects,
  sort,
  onCreate,
  onSearchChange,
  onSubjectChange,
  onSortChange,
}: {
  search: string
  subject: string
  subjects: string[]
  sort: NotesSort
  onCreate: () => void
  onSearchChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onSortChange: (value: NotesSort) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search title, content, subject, or tags"
          className="pl-9"
        />
      </div>

      <div className="grid gap-2 sm:flex sm:items-center">
        <Select value={subject} onValueChange={onSubjectChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Subject</SelectLabel>
              <SelectItem value={allSubjectsValue}>All subjects</SelectItem>
              {subjects.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => onSortChange(value as NotesSort)}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort</SelectLabel>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          New note
        </Button>
      </div>
    </div>
  )
}
