"use client"

import {
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleIcon,
  EditIcon,
  Trash2Icon,
} from "lucide-react"

import {
  getAssignmentPriorityLabel,
  getAssignmentStatusLabel,
  getAssignmentTypeLabel,
} from "@/features/assignments/api"
import {
  formatAssignmentDate,
  formatAssignmentTime,
  formatTimeLeft,
} from "@/features/assignments/lib/date-status"
import type { Assignment } from "@/features/assignments/types"
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

function getPreview(value: string | null) {
  if (!value) {
    return null
  }

  const preview = value.replace(/\s+/g, " ").trim()

  return preview.length > 180 ? `${preview.slice(0, 180)}...` : preview
}

function getPriorityBadgeVariant(priority: Assignment["priority"]) {
  if (priority === "high") {
    return "destructive"
  }

  return priority === "medium" ? "default" : "secondary"
}

function getStatusBadgeVariant(status: Assignment["status"]) {
  if (status === "completed") {
    return "secondary"
  }

  return status === "in_progress" ? "default" : "outline"
}

export function AssignmentCard({
  assignment,
  now,
  isCompleting,
  onEdit,
  onDelete,
  onComplete,
}: {
  assignment: Assignment
  now: Date
  isCompleting: boolean
  onEdit: (assignment: Assignment) => void
  onDelete: (assignment: Assignment) => void
  onComplete: (assignment: Assignment) => void
}) {
  const preview = getPreview(assignment.description)
  const isCompleted = assignment.status === "completed"

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {isCompleted ? (
                <CheckCircle2Icon className="shrink-0 text-muted-foreground" />
              ) : (
                <CircleIcon className="shrink-0 text-muted-foreground" />
              )}
              <CardTitle className="truncate">{assignment.title}</CardTitle>
            </div>
            {preview ? (
              <CardDescription className="line-clamp-2">
                {preview}
              </CardDescription>
            ) : null}
          </div>
          <CardAction className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${assignment.title}`}
              onClick={() => onEdit(assignment)}
            >
              <EditIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${assignment.title}`}
              onClick={() => onDelete(assignment)}
            >
              <Trash2Icon />
            </Button>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {assignment.subject ? (
            <Badge variant="secondary">{assignment.subject}</Badge>
          ) : null}
          <Badge variant={getPriorityBadgeVariant(assignment.priority)}>
            {getAssignmentPriorityLabel(assignment.priority)}
          </Badge>
          <Badge variant={getStatusBadgeVariant(assignment.status)}>
            {getAssignmentStatusLabel(assignment.status)}
          </Badge>
          <Badge variant="outline">
            {getAssignmentTypeLabel(assignment.assignmentType)}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClockIcon />
            {formatAssignmentDate(assignment.dueDate)}
          </span>
          <span>{formatAssignmentTime(assignment.dueTime)}</span>
          <span>{formatTimeLeft(assignment, now)}</span>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          Updated {formatAssignmentDate(assignment.updatedAt.slice(0, 10))}
        </span>
        <Button
          type="button"
          variant={isCompleted ? "outline" : "secondary"}
          size="sm"
          disabled={isCompleting}
          onClick={() => onComplete(assignment)}
        >
          <CheckCircle2Icon data-icon="inline-start" />
          {isCompleted ? "Mark active" : "Complete"}
        </Button>
      </CardFooter>
    </Card>
  )
}
