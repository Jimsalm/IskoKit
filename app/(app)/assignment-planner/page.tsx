import type { Metadata } from "next"

import { AssignmentsPageClient } from "@/features/assignments/components/assignments-page-client"
import { requireAuth } from "@/features/auth/server"

export const metadata: Metadata = {
  title: "Assignment Planner",
}

export default async function AssignmentPlannerPage() {
  await requireAuth()

  return <AssignmentsPageClient />
}
