export const assignmentPriorities = ["low", "medium", "high"] as const

export const assignmentStatuses = [
  "pending",
  "in_progress",
  "completed",
] as const

export const assignmentTypes = [
  "homework",
  "quiz",
  "project",
  "exam",
  "activity",
  "report",
  "other",
] as const

export const assignmentSorts = [
  "nearest_due",
  "newest",
  "priority",
  "status",
] as const

export const assignmentGroups = [
  "overdue",
  "due_today",
  "upcoming",
  "later",
  "completed",
] as const

export type AssignmentPriority = (typeof assignmentPriorities)[number]

export type AssignmentStatus = (typeof assignmentStatuses)[number]

export type AssignmentType = (typeof assignmentTypes)[number]

export type AssignmentSort = (typeof assignmentSorts)[number]

export type AssignmentGroup = (typeof assignmentGroups)[number]

export type Assignment = {
  id: string
  userId: string
  subject: string | null
  title: string
  description: string | null
  dueDate: string
  dueTime: string | null
  priority: AssignmentPriority
  status: AssignmentStatus
  assignmentType: AssignmentType
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AssignmentRow = {
  id: string
  user_id: string
  subject: string | null
  title: string
  description: string | null
  due_date: string
  due_time: string | null
  priority: AssignmentPriority
  status: AssignmentStatus
  type: AssignmentType
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type AssignmentStatsRow = {
  status: AssignmentStatus
  due_date: string
  due_time: string | null
}

export type AssignmentFormValues = {
  title: string
  description?: string
  subject?: string
  dueDate: string
  dueTime?: string
  priority: AssignmentPriority
  status: AssignmentStatus
  assignmentType: AssignmentType
}

export type AssignmentFilters = {
  search: string
  status: string
  subject: string
  priority: string
  assignmentType: string
  sort: AssignmentSort
}

export type AssignmentStats = {
  dueTodayCount: number
  upcomingCount: number
  overdueCount: number
  completedCount: number
}
