"use client"

import { FormEvent, useState } from "react"
import { CalendarIcon, LoaderCircleIcon } from "lucide-react"

import {
  assignmentFormSchema,
  assignmentPriorityLabels,
  assignmentStatusLabels,
  assignmentTypeLabels,
} from "@/features/assignments/schemas"
import {
  assignmentPriorities,
  assignmentStatuses,
  assignmentTypes,
  type Assignment,
  type AssignmentFormValues,
} from "@/features/assignments/types"
import { normalizeDueTime } from "@/features/assignments/lib/date-status"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type AssignmentFormErrors = Partial<
  Record<
    | "title"
    | "description"
    | "subject"
    | "dueDate"
    | "dueTime"
    | "priority"
    | "status"
    | "assignmentType",
    string
  >
>

function getTodayInputValue() {
  const date = new Date()

  return getDateInputValue(date)
}

function getDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getDateFromInputValue(value: string) {
  const [year = "0", month = "1", day = "1"] = value.split("-")

  return new Date(Number(year), Number(month) - 1, Number(day))
}

const emptyFormState = {
  title: "",
  description: "",
  subject: "",
  dueDate: getTodayInputValue(),
  dueTime: "",
  priority: "medium",
  status: "pending",
  assignmentType: "homework",
} satisfies AssignmentFormValues

function getInitialFormState(assignment?: Assignment | null) {
  if (!assignment) {
    return emptyFormState
  }

  return {
    title: assignment.title,
    description: assignment.description ?? "",
    subject: assignment.subject ?? "",
    dueDate: assignment.dueDate,
    dueTime: normalizeDueTime(assignment.dueTime),
    priority: assignment.priority,
    status: assignment.status,
    assignmentType: assignment.assignmentType,
  } satisfies AssignmentFormValues
}

export function AssignmentFormDialog({
  open,
  assignment,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  assignment: Assignment | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AssignmentFormValues) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AssignmentFormDialogContent
          key={assignment?.id ?? "new"}
          assignment={assignment}
          isSubmitting={isSubmitting}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}

function AssignmentFormDialogContent({
  assignment,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  assignment: Assignment | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AssignmentFormValues) => Promise<void>
}) {
  const [formState, setFormState] = useState(() =>
    getInitialFormState(assignment),
  )
  const [errors, setErrors] = useState<AssignmentFormErrors>({})
  const [isDueDateOpen, setIsDueDateOpen] = useState(false)
  const title = assignment ? "Edit assignment" : "New assignment"
  const description = assignment
    ? "Update the task details and deadline."
    : "Add a school task with its deadline and priority."

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = assignmentFormSchema.safeParse(formState)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors

      setErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        subject: fieldErrors.subject?.[0],
        dueDate: fieldErrors.dueDate?.[0],
        dueTime: fieldErrors.dueTime?.[0],
        priority: fieldErrors.priority?.[0],
        status: fieldErrors.status?.[0],
        assignmentType: fieldErrors.assignmentType?.[0],
      })
      return
    }

    setErrors({})
    await onSubmit(parsed.data)
  }

  return (
    <DialogContent className="max-h-[min(90vh,900px)] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          <Field data-invalid={Boolean(errors.title)}>
            <FieldLabel htmlFor="assignment-title">Title</FieldLabel>
            <Input
              id="assignment-title"
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.title)}
            />
            <FieldError>{errors.title}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="assignment-description">
              Description
            </FieldLabel>
            <Textarea
              id="assignment-description"
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Optional"
              className="min-h-28 resize-y"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.description)}
            />
            <FieldError>{errors.description}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.subject)}>
              <FieldLabel htmlFor="assignment-subject">Subject</FieldLabel>
              <Input
                id="assignment-subject"
                value={formState.subject}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                placeholder="Optional"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.subject)}
              />
              <FieldError>{errors.subject}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.assignmentType)}>
              <FieldLabel htmlFor="assignment-type">Type</FieldLabel>
              <Select
                value={formState.assignmentType}
                onValueChange={(assignmentType) =>
                  setFormState((current) => ({
                    ...current,
                    assignmentType:
                      assignmentType as AssignmentFormValues["assignmentType"],
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="assignment-type"
                  className="w-full"
                  aria-invalid={Boolean(errors.assignmentType)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    {assignmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {assignmentTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors.assignmentType}</FieldError>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.dueDate)}>
              <FieldLabel htmlFor="assignment-due-date">Due date</FieldLabel>
              <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="assignment-due-date"
                    type="button"
                    variant="outline"
                    data-empty={!formState.dueDate}
                    className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.dueDate)}
                  >
                    <CalendarIcon data-icon="inline-start" />
                    {formState.dueDate
                      ? new Intl.DateTimeFormat(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }).format(getDateFromInputValue(formState.dueDate))
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={getDateFromInputValue(formState.dueDate)}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (!date) {
                        return
                      }

                      setFormState((current) => ({
                        ...current,
                        dueDate: getDateInputValue(date),
                      }))
                      setIsDueDateOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FieldError>{errors.dueDate}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.dueTime)}>
              <FieldLabel htmlFor="assignment-due-time">Due time</FieldLabel>
              <Input
                id="assignment-due-time"
                type="time"
                value={formState.dueTime}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    dueTime: event.target.value,
                  }))
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.dueTime)}
              />
              <FieldError>{errors.dueTime}</FieldError>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.priority)}>
              <FieldLabel htmlFor="assignment-priority">Priority</FieldLabel>
              <Select
                value={formState.priority}
                onValueChange={(priority) =>
                  setFormState((current) => ({
                    ...current,
                    priority: priority as AssignmentFormValues["priority"],
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="assignment-priority"
                  className="w-full"
                  aria-invalid={Boolean(errors.priority)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Priority</SelectLabel>
                    {assignmentPriorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {assignmentPriorityLabels[priority]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors.priority}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.status)}>
              <FieldLabel htmlFor="assignment-status">Status</FieldLabel>
              <Select
                value={formState.status}
                onValueChange={(status) =>
                  setFormState((current) => ({
                    ...current,
                    status: status as AssignmentFormValues["status"],
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="assignment-status"
                  className="w-full"
                  aria-invalid={Boolean(errors.status)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {assignmentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {assignmentStatusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors.status}</FieldError>
            </Field>
          </div>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            {assignment ? "Save changes" : "Create assignment"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
