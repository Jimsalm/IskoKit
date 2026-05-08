"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import { pomodoroMutationError } from "@/features/pomodoro/api"
import {
  useCreateCompletedFocusSession,
  usePomodoroStatsRows,
} from "@/features/pomodoro/hooks"
import {
  formatPomodoroMode,
  getPomodoroModeDurationMinutes,
  getPomodoroModeDurationSeconds,
  getPomodoroSummary,
  getSuggestedNextPomodoroMode,
  getWeekRange,
} from "@/features/pomodoro/lib/timer"
import type {
  CreatePomodoroSessionValues,
  PomodoroMode,
  PomodoroSummary,
  PomodoroTimerCompletion,
  PomodoroTimerStatus,
} from "@/features/pomodoro/types"
import { pomodoroModes } from "@/features/pomodoro/types"

const STORAGE_KEY = "iskokit:pomodoro-timer:v1"
const STORAGE_VERSION = 1

type PendingSessionSave = {
  payload: CreatePomodoroSessionValues
  completedFocusSessionsToday: number
}

type PomodoroTimerState = {
  mode: PomodoroMode
  subject: string
  taskLabel: string
  suggestedMode: PomodoroMode
  status: PomodoroTimerStatus
  startedAt: string | null
  deadlineMs: number | null
  pausedTimeRemaining: number | null
}

type StoredPomodoroSnapshot = {
  version: typeof STORAGE_VERSION
  timer: PomodoroTimerState
  pendingSessionSave: PendingSessionSave | null
}

type PomodoroTimerContextValue = {
  mode: PomodoroMode
  subject: string
  taskLabel: string
  suggestedMode: PomodoroMode
  status: PomodoroTimerStatus
  timeRemaining: number
  summary: PomodoroSummary
  isSummaryLoading: boolean
  summaryErrorMessage: string | null
  isSaving: boolean
  pendingSessionSave: PendingSessionSave | null
  setMode: (mode: PomodoroMode) => void
  setSubject: (value: string) => void
  setTaskLabel: (value: string) => void
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  selectSuggestedMode: (mode: PomodoroMode) => void
  retryPendingSessionSave: () => void
}

const emptySummary: PomodoroSummary = {
  sessionsToday: 0,
  studyMinutesToday: 0,
  studyMinutesThisWeek: 0,
}

const defaultTimerState: PomodoroTimerState = {
  mode: "focus",
  subject: "",
  taskLabel: "",
  suggestedMode: "focus",
  status: "idle",
  startedAt: null,
  deadlineMs: null,
  pausedTimeRemaining: null,
}

const PomodoroTimerContext =
  createContext<PomodoroTimerContextValue | null>(null)

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

function isPomodoroMode(value: unknown): value is PomodoroMode {
  return pomodoroModes.includes(value as PomodoroMode)
}

function isTimerStatus(value: unknown): value is PomodoroTimerStatus {
  return (
    value === "idle" ||
    value === "running" ||
    value === "paused" ||
    value === "completed"
  )
}

function isActiveStatus(status: PomodoroTimerStatus) {
  return status === "running" || status === "paused"
}

function normalizeStoredTimer(value: unknown): PomodoroTimerState | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const timer = value as Partial<PomodoroTimerState>

  if (!isPomodoroMode(timer.mode) || !isTimerStatus(timer.status)) {
    return null
  }

  return {
    mode: timer.mode,
    subject: typeof timer.subject === "string" ? timer.subject : "",
    taskLabel: typeof timer.taskLabel === "string" ? timer.taskLabel : "",
    suggestedMode: isPomodoroMode(timer.suggestedMode)
      ? timer.suggestedMode
      : "focus",
    status: timer.status,
    startedAt: typeof timer.startedAt === "string" ? timer.startedAt : null,
    deadlineMs:
      typeof timer.deadlineMs === "number" && Number.isFinite(timer.deadlineMs)
        ? timer.deadlineMs
        : null,
    pausedTimeRemaining:
      typeof timer.pausedTimeRemaining === "number" &&
      Number.isFinite(timer.pausedTimeRemaining)
        ? timer.pausedTimeRemaining
        : null,
  }
}

function normalizePendingSessionSave(value: unknown): PendingSessionSave | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const pending = value as Partial<PendingSessionSave>

  if (!pending.payload || typeof pending.payload !== "object") {
    return null
  }

  if (typeof pending.completedFocusSessionsToday !== "number") {
    return null
  }

  return pending as PendingSessionSave
}

function readStoredSnapshot(): StoredPomodoroSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<StoredPomodoroSnapshot>

    if (parsed.version !== STORAGE_VERSION) {
      return null
    }

    const timer = normalizeStoredTimer(parsed.timer)

    if (!timer) {
      return null
    }

    return {
      version: STORAGE_VERSION,
      timer,
      pendingSessionSave: normalizePendingSessionSave(
        parsed.pendingSessionSave,
      ),
    }
  } catch {
    return null
  }
}

function shouldStoreSnapshot({
  timer,
  pendingSessionSave,
}: {
  timer: PomodoroTimerState
  pendingSessionSave: PendingSessionSave | null
}) {
  return (
    timer.status !== "idle" ||
    timer.mode !== "focus" ||
    timer.subject.length > 0 ||
    timer.taskLabel.length > 0 ||
    timer.suggestedMode !== "focus" ||
    Boolean(pendingSessionSave)
  )
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const now = useNow()
  const [hasRestoredSnapshot, setHasRestoredSnapshot] = useState(false)
  const [timer, setTimer] = useState<PomodoroTimerState>(defaultTimerState)
  const [timeRemaining, setTimeRemaining] = useState(
    getPomodoroModeDurationSeconds(defaultTimerState.mode),
  )
  const [pendingSessionSave, setPendingSessionSave] =
    useState<PendingSessionSave | null>(null)
  const timerRef = useRef(timer)
  const timeRemainingRef = useRef(timeRemaining)
  const summaryRef = useRef(emptySummary)
  const completionHandledRef = useRef(false)
  const weekRange = useMemo(() => (now ? getWeekRange(now) : null), [now])
  const statsQuery = usePomodoroStatsRows(weekRange)
  const createSessionMutation = useCreateCompletedFocusSession()
  const summary = useMemo(() => {
    if (!now) {
      return emptySummary
    }

    return getPomodoroSummary({
      rows: statsQuery.data ?? [],
      now,
    })
  }, [now, statsQuery.data])
  const isSummaryLoading = !now || statsQuery.isPending
  const summaryErrorMessage = statsQuery.isError
    ? pomodoroMutationError(statsQuery.error)
    : null
  const isActive = isActiveStatus(timer.status)
  const shouldWarnBeforeUnload =
    isActive || Boolean(pendingSessionSave) || createSessionMutation.isPending

  useEffect(() => {
    timerRef.current = timer
  }, [timer])

  useEffect(() => {
    timeRemainingRef.current = timeRemaining
  }, [timeRemaining])

  useEffect(() => {
    summaryRef.current = summary
  }, [summary])

  useEffect(() => {
    function restoreSnapshot() {
      const snapshot = readStoredSnapshot()

      if (!snapshot) {
        setHasRestoredSnapshot(true)
        return
      }

      const durationSeconds = getPomodoroModeDurationSeconds(
        snapshot.timer.mode,
      )
      const nextTimer = { ...snapshot.timer }
      let nextTimeRemaining = durationSeconds

      if (nextTimer.status === "running" && nextTimer.deadlineMs) {
        nextTimeRemaining = Math.max(
          0,
          Math.ceil((nextTimer.deadlineMs - Date.now()) / 1000),
        )
      } else if (nextTimer.status === "paused") {
        nextTimeRemaining =
          nextTimer.pausedTimeRemaining ?? getPomodoroModeDurationSeconds(
            nextTimer.mode,
          )
      } else if (nextTimer.status === "completed") {
        nextTimer.status = "idle"
        nextTimer.startedAt = null
        nextTimer.deadlineMs = null
        nextTimer.pausedTimeRemaining = null
      }

      setTimer(nextTimer)
      setTimeRemaining(nextTimeRemaining)
      setPendingSessionSave(snapshot.pendingSessionSave)
      setHasRestoredSnapshot(true)
    }

    restoreSnapshot()
  }, [])

  useEffect(() => {
    if (!hasRestoredSnapshot) {
      return
    }

    if (
      !shouldStoreSnapshot({
        timer,
        pendingSessionSave,
      })
    ) {
      window.sessionStorage.removeItem(STORAGE_KEY)
      return
    }

    const snapshot: StoredPomodoroSnapshot = {
      version: STORAGE_VERSION,
      timer,
      pendingSessionSave,
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }, [hasRestoredSnapshot, pendingSessionSave, timer])

  const reset = useCallback(() => {
    const currentMode = timerRef.current.mode

    completionHandledRef.current = false
    setTimer((currentTimer) => ({
      ...currentTimer,
      status: "idle",
      startedAt: null,
      deadlineMs: null,
      pausedTimeRemaining: null,
    }))
    setTimeRemaining(getPomodoroModeDurationSeconds(currentMode))
  }, [])

  const saveCompletedFocusSession = useCallback(
    async ({
      payload,
      completedFocusSessionsToday,
    }: PendingSessionSave) => {
      try {
        await createSessionMutation.mutateAsync(payload)
        setPendingSessionSave(null)
        setTimer((currentTimer) => ({
          ...currentTimer,
          suggestedMode: getSuggestedNextPomodoroMode({
            completedMode: "focus",
            completedFocusSessionsToday,
          }),
        }))
        toast.success("Focus session saved.")
      } catch (error) {
        setPendingSessionSave({
          payload,
          completedFocusSessionsToday,
        })
        toast.error(pomodoroMutationError(error))
      }
    },
    [createSessionMutation],
  )

  const handleTimerComplete = useCallback(
    async (completion: PomodoroTimerCompletion) => {
      if (completion.mode !== "focus") {
        setTimer((currentTimer) => ({
          ...currentTimer,
          suggestedMode: "focus",
        }))
        toast.success(`${formatPomodoroMode(completion.mode)} complete.`)
        return
      }

      const completedFocusSessionsToday = summaryRef.current.sessionsToday + 1

      await saveCompletedFocusSession({
        payload: {
          subject: completion.subject,
          taskLabel: completion.taskLabel,
          durationMinutes: completion.durationMinutes,
          actualMinutes: completion.actualMinutes,
          startedAt: completion.startedAt,
          completedAt: completion.completedAt,
        },
        completedFocusSessionsToday,
      })
    },
    [saveCompletedFocusSession],
  )

  const completeTimer = useCallback(() => {
    if (completionHandledRef.current) {
      return
    }

    const currentTimer = timerRef.current
    const durationSeconds = getPomodoroModeDurationSeconds(currentTimer.mode)
    const durationMinutes = getPomodoroModeDurationMinutes(currentTimer.mode)

    completionHandledRef.current = true

    const completedAtDate = new Date()
    const fallbackStartedAt = new Date(
      completedAtDate.getTime() - durationSeconds * 1000,
    ).toISOString()
    const completion: PomodoroTimerCompletion = {
      mode: currentTimer.mode,
      subject: currentTimer.subject,
      taskLabel: currentTimer.taskLabel,
      durationMinutes,
      actualMinutes: durationMinutes,
      startedAt: currentTimer.startedAt ?? fallbackStartedAt,
      completedAt: completedAtDate.toISOString(),
    }

    setTimer((existingTimer) => ({
      ...existingTimer,
      status: "completed",
      deadlineMs: null,
      pausedTimeRemaining: null,
    }))
    setTimeRemaining(0)

    void Promise.resolve(handleTimerComplete(completion)).finally(reset)
  }, [handleTimerComplete, reset])

  useEffect(() => {
    if (timer.status !== "running" || !timer.deadlineMs) {
      return
    }

    const deadline = timer.deadlineMs

    function tick() {
      const nextRemaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      )

      setTimeRemaining(nextRemaining)

      if (nextRemaining <= 0) {
        completeTimer()
      }
    }

    tick()

    const interval = window.setInterval(tick, 250)

    return () => window.clearInterval(interval)
  }, [completeTimer, timer.deadlineMs, timer.status])

  useEffect(() => {
    if (!shouldWarnBeforeUnload) {
      return
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [shouldWarnBeforeUnload])

  const setMode = useCallback((mode: PomodoroMode) => {
    const currentTimer = timerRef.current

    if (isActiveStatus(currentTimer.status)) {
      return
    }

    completionHandledRef.current = false
    setTimer((existingTimer) => ({
      ...existingTimer,
      mode,
      status: "idle",
      startedAt: null,
      deadlineMs: null,
      pausedTimeRemaining: null,
    }))
    setTimeRemaining(getPomodoroModeDurationSeconds(mode))
  }, [])

  const setSubject = useCallback((value: string) => {
    const currentTimer = timerRef.current

    if (isActiveStatus(currentTimer.status) || currentTimer.mode !== "focus") {
      return
    }

    setTimer((existingTimer) => ({
      ...existingTimer,
      subject: value,
    }))
  }, [])

  const setTaskLabel = useCallback((value: string) => {
    const currentTimer = timerRef.current

    if (isActiveStatus(currentTimer.status) || currentTimer.mode !== "focus") {
      return
    }

    setTimer((existingTimer) => ({
      ...existingTimer,
      taskLabel: value,
    }))
  }, [])

  const start = useCallback(() => {
    const currentTimer = timerRef.current
    const remaining = Math.max(0, timeRemainingRef.current)

    if (currentTimer.status === "running" || remaining <= 0) {
      return
    }

    completionHandledRef.current = false
    setTimer((existingTimer) => ({
      ...existingTimer,
      status: "running",
      startedAt: existingTimer.startedAt ?? new Date().toISOString(),
      deadlineMs: Date.now() + remaining * 1000,
      pausedTimeRemaining: null,
    }))
  }, [])

  const pause = useCallback(() => {
    const currentTimer = timerRef.current

    if (currentTimer.status !== "running" || !currentTimer.deadlineMs) {
      return
    }

    const remaining = Math.max(
      0,
      Math.ceil((currentTimer.deadlineMs - Date.now()) / 1000),
    )

    setTimeRemaining(remaining)
    setTimer((existingTimer) => ({
      ...existingTimer,
      status: "paused",
      deadlineMs: null,
      pausedTimeRemaining: remaining,
    }))
  }, [])

  const resume = useCallback(() => {
    const currentTimer = timerRef.current

    if (currentTimer.status !== "paused") {
      return
    }

    const remaining = Math.max(
      0,
      currentTimer.pausedTimeRemaining ?? timeRemainingRef.current,
    )

    if (remaining <= 0) {
      completeTimer()
      return
    }

    setTimer((existingTimer) => ({
      ...existingTimer,
      status: "running",
      deadlineMs: Date.now() + remaining * 1000,
      pausedTimeRemaining: null,
    }))
  }, [completeTimer])

  const selectSuggestedMode = useCallback(
    (mode: PomodoroMode) => {
      setMode(mode)
    },
    [setMode],
  )

  const retryPendingSessionSave = useCallback(() => {
    const currentPendingSessionSave = pendingSessionSave

    if (!currentPendingSessionSave) {
      return
    }

    void saveCompletedFocusSession(currentPendingSessionSave)
  }, [pendingSessionSave, saveCompletedFocusSession])

  const value = useMemo<PomodoroTimerContextValue>(
    () => ({
      mode: timer.mode,
      subject: timer.subject,
      taskLabel: timer.taskLabel,
      suggestedMode: timer.suggestedMode,
      status: timer.status,
      timeRemaining,
      summary,
      isSummaryLoading,
      summaryErrorMessage,
      isSaving: createSessionMutation.isPending,
      pendingSessionSave,
      setMode,
      setSubject,
      setTaskLabel,
      start,
      pause,
      resume,
      reset,
      selectSuggestedMode,
      retryPendingSessionSave,
    }),
    [
      createSessionMutation.isPending,
      isSummaryLoading,
      pause,
      pendingSessionSave,
      reset,
      resume,
      retryPendingSessionSave,
      selectSuggestedMode,
      setMode,
      setSubject,
      setTaskLabel,
      start,
      summary,
      summaryErrorMessage,
      timeRemaining,
      timer.mode,
      timer.status,
      timer.subject,
      timer.suggestedMode,
      timer.taskLabel,
    ],
  )

  return (
    <PomodoroTimerContext.Provider value={value}>
      {children}
    </PomodoroTimerContext.Provider>
  )
}

export function usePomodoroTimer() {
  const context = useContext(PomodoroTimerContext)

  if (!context) {
    throw new Error("usePomodoroTimer must be used inside PomodoroProvider.")
  }

  return context
}
