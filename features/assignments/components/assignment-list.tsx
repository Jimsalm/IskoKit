"use client"

import { CalendarCheckIcon, PlusIcon } from "lucide-react"

import { AssignmentCard } from "@/features/assignments/components/assignment-card"
import type { Assignment, AssignmentGroup } from "@/features/assignments/types"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export type AssignmentGroups = Record<AssignmentGroup, Assignment[]>

const groupMeta = {
  overdue: {
    title: "Overdue",
    description: "Past due and not completed",
  },
  due_today: {
    title: "Due Today",
    description: "Needs attention before the day ends",
  },
  upcoming: {
    title: "Upcoming",
    description: "Due within the next 7 days",
  },
  later: {
    title: "Later",
    description: "Future assignments outside the next week",
  },
  completed: {
    title: "Completed",
    description: "Finished assignments",
  },
} satisfies Record<AssignmentGroup, { title: string; description: string }>

const groupOrder = [
  "overdue",
  "due_today",
  "upcoming",
  "later",
  "completed",
] as const satisfies readonly AssignmentGroup[]

export function AssignmentList({
  groups,
  hasAssignments,
  now,
  isCompleting,
  onCreate,
  onEdit,
  onDelete,
  onComplete,
}: {
  groups: AssignmentGroups
  hasAssignments: boolean
  now: Date
  isCompleting: boolean
  onCreate: () => void
  onEdit: (assignment: Assignment) => void
  onDelete: (assignment: Assignment) => void
  onComplete: (assignment: Assignment) => void
}) {
  const visibleCount = groupOrder.reduce(
    (count, group) => count + groups[group].length,
    0,
  )

  if (!hasAssignments) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarCheckIcon />
          </EmptyMedia>
          <EmptyTitle>No assignments yet</EmptyTitle>
          <EmptyDescription>
            Add your first school task and keep deadlines in one place.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" onClick={onCreate}>
            <PlusIcon data-icon="inline-start" />
            New assignment
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!visibleCount) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarCheckIcon />
          </EmptyMedia>
          <EmptyTitle>No matching assignments</EmptyTitle>
          <EmptyDescription>
            Try changing your search or filters.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {groupOrder.map((group) => {
        const assignments = groups[group]

        if (!assignments.length) {
          return null
        }

        return (
          <section key={group} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">
                  {groupMeta[group].title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {groupMeta[group].description}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {assignments.length}{" "}
                {assignments.length === 1 ? "assignment" : "assignments"}
              </p>
            </div>

            <div className="grid gap-3">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  now={now}
                  isCompleting={isCompleting}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onComplete={onComplete}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
