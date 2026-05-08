"use client"

import { ClockIcon, ListChecksIcon, TimerIcon } from "lucide-react"

import type { PomodoroSummary } from "@/features/pomodoro/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const summaryItems = [
  {
    label: "Sessions Today",
    key: "sessionsToday",
    suffix: "",
    icon: ListChecksIcon,
  },
  {
    label: "Study Minutes Today",
    key: "studyMinutesToday",
    suffix: "min",
    icon: TimerIcon,
  },
  {
    label: "Study Minutes This Week",
    key: "studyMinutesThisWeek",
    suffix: "min",
    icon: ClockIcon,
  },
] as const

export function PomodoroSummaryCards({
  summary,
  isLoading,
}: {
  summary: PomodoroSummary
  isLoading: boolean
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {summaryItems.map((item) => {
        const SummaryIcon = item.icon
        const value = summary[item.key]

        return (
          <Card key={item.key}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                {item.label}
              </CardTitle>
              <SummaryIcon className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-semibold">
                  {value}
                  {item.suffix ? (
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      {item.suffix}
                    </span>
                  ) : null}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
