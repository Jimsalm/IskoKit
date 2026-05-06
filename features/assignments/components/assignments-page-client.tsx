"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { assignmentMutationError } from "@/features/assignments/api"
import { AssignmentDeleteDialog } from "@/features/assignments/components/assignment-delete-dialog"
import { AssignmentFormDialog } from "@/features/assignments/components/assignment-form-dialog"
import {
  type AssignmentGroups,
  AssignmentList,
} from "@/features/assignments/components/assignment-list"
import {
  allAssignmentPrioritiesValue,
  allAssignmentStatusesValue,
  allAssignmentSubjectsValue,
  allAssignmentTypesValue,
  AssignmentToolbar,
} from "@/features/assignments/components/assignment-toolbar"
import { AssignmentsError } from "@/features/assignments/components/assignments-error"
import { AssignmentsLoading } from "@/features/assignments/components/assignments-loading"
import {
  getAssignmentDueDateTime,
  getAssignmentGroup,
  getAssignmentStats,
} from "@/features/assignments/lib/date-status"
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useSetAssignmentCompleted,
  useUpdateAssignment,
} from "@/features/assignments/hooks"
import type {
  Assignment,
  AssignmentFilters,
  AssignmentFormValues,
  AssignmentPriority,
  AssignmentStatus,
} from "@/features/assignments/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const defaultFilters: AssignmentFilters = {
  search: "",
  status: allAssignmentStatusesValue,
  subject: allAssignmentSubjectsValue,
  priority: allAssignmentPrioritiesValue,
  assignmentType: allAssignmentTypesValue,
  sort: "nearest_due",
}

const emptyGroups: AssignmentGroups = {
  overdue: [],
  due_today: [],
  upcoming: [],
  later: [],
  completed: [],
}

const priorityRank = {
  high: 0,
  medium: 1,
  low: 2,
} satisfies Record<AssignmentPriority, number>

const statusRank = {
  pending: 0,
  in_progress: 1,
  completed: 2,
} satisfies Record<AssignmentStatus, number>

function useNow() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    function updateNow() {
      setNow(new Date())
    }

    updateNow()

    const interval = window.setInterval(updateNow, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  return now
}

function getSearchTarget(assignment: Assignment) {
  return [
    assignment.title,
    assignment.description ?? "",
    assignment.subject ?? "",
    assignment.assignmentType,
  ]
    .join(" ")
    .toLowerCase()
}

function sortAssignments(assignments: Assignment[], filters: AssignmentFilters) {
  return [...assignments].sort((first, second) => {
    if (filters.sort === "newest") {
      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      )
    }

    if (filters.sort === "priority") {
      const priorityDifference =
        priorityRank[first.priority] - priorityRank[second.priority]

      if (priorityDifference) {
        return priorityDifference
      }
    }

    if (filters.sort === "status") {
      const statusDifference =
        statusRank[first.status] - statusRank[second.status]

      if (statusDifference) {
        return statusDifference
      }
    }

    return (
      getAssignmentDueDateTime(first).getTime() -
      getAssignmentDueDateTime(second).getTime()
    )
  })
}

function groupAssignments(assignments: Assignment[], now: Date) {
  return assignments.reduce<AssignmentGroups>(
    (groups, assignment) => {
      const group = getAssignmentGroup(assignment, now)

      groups[group].push(assignment)

      return groups
    },
    {
      overdue: [],
      due_today: [],
      upcoming: [],
      later: [],
      completed: [],
    },
  )
}

function getStatCards(assignments: Assignment[], now: Date) {
  const stats = getAssignmentStats(assignments, now)

  return [
    {
      label: "Overdue",
      value: stats.overdueCount,
    },
    {
      label: "Due today",
      value: stats.dueTodayCount,
    },
    {
      label: "Upcoming",
      value: stats.upcomingCount,
    },
    {
      label: "Completed",
      value: stats.completedCount,
    },
  ]
}

export function AssignmentsPageClient() {
  const [filters, setFilters] = useState<AssignmentFilters>(defaultFilters)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] =
    useState<Assignment | null>(null)
  const [deletingAssignment, setDeletingAssignment] =
    useState<Assignment | null>(null)
  const now = useNow()
  const assignmentsQuery = useAssignments()
  const createMutation = useCreateAssignment()
  const updateMutation = useUpdateAssignment()
  const completeMutation = useSetAssignmentCompleted()
  const deleteMutation = useDeleteAssignment()
  const assignments = useMemo(
    () => assignmentsQuery.data ?? [],
    [assignmentsQuery.data],
  )
  const isSaving = createMutation.isPending || updateMutation.isPending

  const subjects = useMemo(() => {
    return Array.from(
      new Set(
        assignments
          .map((assignment) => assignment.subject)
          .filter(Boolean) as string[],
      ),
    ).sort((first, second) => first.localeCompare(second))
  }, [assignments])

  const visibleAssignments = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const filteredAssignments = assignments.filter((assignment) => {
      const matchesSearch = search
        ? getSearchTarget(assignment).includes(search)
        : true
      const matchesStatus =
        filters.status === allAssignmentStatusesValue ||
        assignment.status === filters.status
      const matchesSubject =
        filters.subject === allAssignmentSubjectsValue ||
        assignment.subject === filters.subject
      const matchesPriority =
        filters.priority === allAssignmentPrioritiesValue ||
        assignment.priority === filters.priority
      const matchesType =
        filters.assignmentType === allAssignmentTypesValue ||
        assignment.assignmentType === filters.assignmentType

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSubject &&
        matchesPriority &&
        matchesType
      )
    })

    return sortAssignments(filteredAssignments, filters)
  }, [assignments, filters])

  const groups = useMemo(() => {
    if (!now) {
      return emptyGroups
    }

    return groupAssignments(visibleAssignments, now)
  }, [now, visibleAssignments])

  const statCards = useMemo(() => {
    return now ? getStatCards(assignments, now) : []
  }, [assignments, now])

  function openCreateDialog() {
    setEditingAssignment(null)
    setIsFormOpen(true)
  }

  function openEditDialog(assignment: Assignment) {
    setEditingAssignment(assignment)
    setIsFormOpen(true)
  }

  async function handleSubmit(values: AssignmentFormValues) {
    try {
      if (editingAssignment) {
        await updateMutation.mutateAsync({
          id: editingAssignment.id,
          values,
        })
        toast.success("Assignment updated.")
      } else {
        await createMutation.mutateAsync(values)
        toast.success("Assignment created.")
      }

      setIsFormOpen(false)
      setEditingAssignment(null)
    } catch (error) {
      toast.error(assignmentMutationError(error))
    }
  }

  async function handleComplete(assignment: Assignment) {
    try {
      const nextCompleted = assignment.status !== "completed"

      await completeMutation.mutateAsync({
        id: assignment.id,
        completed: nextCompleted,
      })
      toast.success(
        nextCompleted ? "Assignment completed." : "Assignment marked active.",
      )
    } catch (error) {
      toast.error(assignmentMutationError(error))
    }
  }

  async function handleDelete() {
    if (!deletingAssignment) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deletingAssignment.id)
      toast.success("Assignment deleted.")
      setDeletingAssignment(null)
    } catch (error) {
      toast.error(assignmentMutationError(error))
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Planning</p>
        <h1 className="text-2xl font-semibold">Assignment Planner</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Track school tasks by subject, priority, status, and due date.
        </p>
      </div>

      {now ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <AssignmentToolbar
        filters={filters}
        subjects={subjects}
        onCreate={openCreateDialog}
        onFiltersChange={setFilters}
      />

      {assignmentsQuery.isPending || !now ? <AssignmentsLoading /> : null}
      {assignmentsQuery.isError ? (
        <AssignmentsError
          message={assignmentMutationError(assignmentsQuery.error)}
          onRetry={() => void assignmentsQuery.refetch()}
        />
      ) : null}
      {assignmentsQuery.isSuccess && now ? (
        <AssignmentList
          groups={groups}
          hasAssignments={assignments.length > 0}
          now={now}
          isCompleting={completeMutation.isPending}
          onCreate={openCreateDialog}
          onEdit={openEditDialog}
          onDelete={setDeletingAssignment}
          onComplete={handleComplete}
        />
      ) : null}

      <AssignmentFormDialog
        open={isFormOpen}
        assignment={editingAssignment}
        isSubmitting={isSaving}
        onOpenChange={(open) => {
          setIsFormOpen(open)

          if (!open) {
            setEditingAssignment(null)
          }
        }}
        onSubmit={handleSubmit}
      />

      <AssignmentDeleteDialog
        assignment={deletingAssignment}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingAssignment(null)
          }
        }}
        onConfirm={handleDelete}
      />
    </section>
  )
}
