"use client"

import { PlusIcon, SearchIcon } from "lucide-react"

import {
  assignmentPriorityLabels,
  assignmentSortLabels,
  assignmentStatusLabels,
  assignmentTypeLabels,
} from "@/features/assignments/schemas"
import {
  assignmentPriorities,
  assignmentSorts,
  assignmentStatuses,
  assignmentTypes,
  type AssignmentFilters,
  type AssignmentSort,
} from "@/features/assignments/types"
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

export const allAssignmentStatusesValue = "__all_assignment_statuses__"
export const allAssignmentSubjectsValue = "__all_assignment_subjects__"
export const allAssignmentPrioritiesValue = "__all_assignment_priorities__"
export const allAssignmentTypesValue = "__all_assignment_types__"

export function AssignmentToolbar({
  filters,
  subjects,
  onCreate,
  onFiltersChange,
}: {
  filters: AssignmentFilters
  subjects: string[]
  onCreate: () => void
  onFiltersChange: (filters: AssignmentFilters) => void
}) {
  function updateFilters(nextFilters: Partial<AssignmentFilters>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder="Search title, description, subject, or type"
            className="pl-9"
          />
        </div>

        <Button type="button" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          New assignment
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          value={filters.status}
          onValueChange={(status) => updateFilters({ status })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value={allAssignmentStatusesValue}>
                All statuses
              </SelectItem>
              {assignmentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {assignmentStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filters.subject}
          onValueChange={(subject) => updateFilters({ subject })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Subject</SelectLabel>
              <SelectItem value={allAssignmentSubjectsValue}>
                All subjects
              </SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(priority) => updateFilters({ priority })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Priority</SelectLabel>
              <SelectItem value={allAssignmentPrioritiesValue}>
                All priorities
              </SelectItem>
              {assignmentPriorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {assignmentPriorityLabels[priority]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filters.assignmentType}
          onValueChange={(assignmentType) => updateFilters({ assignmentType })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              <SelectItem value={allAssignmentTypesValue}>All types</SelectItem>
              {assignmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {assignmentTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(sort) =>
            updateFilters({ sort: sort as AssignmentSort })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort</SelectLabel>
              {assignmentSorts.map((sort) => (
                <SelectItem key={sort} value={sort}>
                  {assignmentSortLabels[sort]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
