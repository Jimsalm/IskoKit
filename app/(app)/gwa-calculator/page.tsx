import type { Metadata } from "next"

import { GwaCalculatorPageClient } from "@/features/gwa/components/gwa-calculator-page-client"
import { requireAuth } from "@/features/auth/server"

export const metadata: Metadata = {
  title: "GWA Calculator",
}

export default async function GwaCalculatorPage() {
  await requireAuth()

  return <GwaCalculatorPageClient />
}
