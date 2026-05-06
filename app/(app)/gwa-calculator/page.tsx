import { GwaCalculatorPageClient } from "@/features/gwa/components/gwa-calculator-page-client"
import { requireAuth } from "@/features/auth/server"

export default async function GwaCalculatorPage() {
  await requireAuth()

  return <GwaCalculatorPageClient />
}
