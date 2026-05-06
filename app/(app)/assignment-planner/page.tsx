import { AssignmentsPageClient } from "@/features/assignments/components/assignments-page-client"
import { requireAuth } from "@/features/auth/server"

export default async function AssignmentPlannerPage() {
  await requireAuth()

  return <AssignmentsPageClient />
}
