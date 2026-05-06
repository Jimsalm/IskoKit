import type {
  Assignment,
  AssignmentGroup,
  AssignmentStats,
  AssignmentStatsRow,
  AssignmentStatus,
} from "@/features/assignments/types"

type DueFields = Pick<Assignment, "dueDate" | "dueTime" | "status">

const minuteMs = 60 * 1000
const hourMs = 60 * minuteMs
const dayMs = 24 * hourMs

function parseDueDate(value: string) {
  const [year = "0", month = "1", day = "1"] = value.split("-")

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  }
}

function parseDueTime(value: string | null) {
  if (!value) {
    return {
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    }
  }

  const [hours = "0", minutes = "0", seconds = "0"] = value.split(":")

  return {
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
    milliseconds: 0,
  }
}

export function getAssignmentDueDateTime(assignment: DueFields) {
  const date = parseDueDate(assignment.dueDate)
  const time = parseDueTime(assignment.dueTime)

  return new Date(
    date.year,
    date.month - 1,
    date.day,
    time.hours,
    time.minutes,
    time.seconds,
    time.milliseconds,
  )
}

function getAssignmentStartOfDay(assignment: DueFields) {
  const date = parseDueDate(assignment.dueDate)

  return new Date(date.year, date.month - 1, date.day)
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function addDays(value: Date, days: number) {
  const nextDate = new Date(value)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function isCompleted(status: AssignmentStatus) {
  return status === "completed"
}

export function isAssignmentOverdue(assignment: DueFields, now: Date) {
  return (
    !isCompleted(assignment.status) &&
    getAssignmentDueDateTime(assignment).getTime() < now.getTime()
  )
}

export function isAssignmentDueToday(assignment: DueFields, now: Date) {
  return (
    !isCompleted(assignment.status) &&
    isSameDay(getAssignmentStartOfDay(assignment), now)
  )
}

export function isAssignmentUpcoming(assignment: DueFields, now: Date) {
  if (isCompleted(assignment.status) || isAssignmentOverdue(assignment, now)) {
    return false
  }

  const dueStart = getAssignmentStartOfDay(assignment)
  const todayStart = startOfDay(now)
  const nextWeekEnd = addDays(todayStart, 7)

  return dueStart > todayStart && dueStart <= nextWeekEnd
}

export function getAssignmentGroup(
  assignment: DueFields,
  now: Date,
): AssignmentGroup {
  if (isCompleted(assignment.status)) {
    return "completed"
  }

  if (isAssignmentOverdue(assignment, now)) {
    return "overdue"
  }

  if (isAssignmentDueToday(assignment, now)) {
    return "due_today"
  }

  if (isAssignmentUpcoming(assignment, now)) {
    return "upcoming"
  }

  return "later"
}

export function formatAssignmentDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(getAssignmentStartOfDay({
    dueDate: value,
    dueTime: null,
    status: "pending",
  }))
}

export function formatAssignmentTime(value: string | null) {
  if (!value) {
    return "No time"
  }

  const [hours = "0", minutes = "0"] = value.split(":")
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function normalizeDueTime(value: string | null) {
  return value ? value.slice(0, 5) : ""
}

export function formatTimeLeft(assignment: Assignment, now: Date) {
  if (assignment.status === "completed") {
    return assignment.completedAt
      ? `Completed ${new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
        }).format(new Date(assignment.completedAt))}`
      : "Completed"
  }

  const dueTime = getAssignmentDueDateTime(assignment).getTime()
  const difference = dueTime - now.getTime()
  const absoluteDifference = Math.abs(difference)

  if (absoluteDifference < minuteMs) {
    return difference < 0 ? "Just overdue" : "Due now"
  }

  const days = Math.floor(absoluteDifference / dayMs)
  const hours = Math.floor((absoluteDifference % dayMs) / hourMs)
  const minutes = Math.floor((absoluteDifference % hourMs) / minuteMs)
  const prefix = difference < 0 ? "Overdue by" : "Due in"

  if (days > 0) {
    return `${prefix} ${days} ${days === 1 ? "day" : "days"}`
  }

  if (hours > 0) {
    return `${prefix} ${hours} ${hours === 1 ? "hour" : "hours"}`
  }

  return `${prefix} ${minutes} ${minutes === 1 ? "minute" : "minutes"}`
}

export function getAssignmentStats(
  rows: Array<AssignmentStatsRow | DueFields>,
  now: Date,
): AssignmentStats {
  return rows.reduce<AssignmentStats>(
    (stats, row) => {
      const assignment = {
        status: row.status,
        dueDate: "dueDate" in row ? row.dueDate : row.due_date,
        dueTime: "dueTime" in row ? row.dueTime : row.due_time,
      }

      if (assignment.status === "completed") {
        stats.completedCount += 1
        return stats
      }

      if (isAssignmentOverdue(assignment, now)) {
        stats.overdueCount += 1
      }

      if (isAssignmentDueToday(assignment, now)) {
        stats.dueTodayCount += 1
      }

      if (isAssignmentUpcoming(assignment, now)) {
        stats.upcomingCount += 1
      }

      return stats
    },
    {
      dueTodayCount: 0,
      upcomingCount: 0,
      overdueCount: 0,
      completedCount: 0,
    },
  )
}
