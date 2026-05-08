import { PomodoroPageClient } from "@/features/pomodoro/components/pomodoro-page-client"
import { requireAuth } from "@/features/auth/server"

export default async function PomodoroPage() {
  await requireAuth()

  return <PomodoroPageClient />
}
