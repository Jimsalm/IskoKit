import type { Metadata } from "next"

import { PomodoroPageClient } from "@/features/pomodoro/components/pomodoro-page-client"
import { requireAuth } from "@/features/auth/server"

export const metadata: Metadata = {
  title: "Pomodoro Timer",
}

export default async function PomodoroPage() {
  await requireAuth()

  return <PomodoroPageClient />
}
