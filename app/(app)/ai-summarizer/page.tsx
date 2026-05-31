import type { Metadata } from "next"

import { AiSummarizerPageClient } from "@/features/ai-summarizer/components/ai-summarizer-page-client"
import { requireAuth } from "@/features/auth/server"

export const metadata: Metadata = {
  title: "AI Summarizer",
}

export default async function AiSummarizerPage() {
  await requireAuth()

  return <AiSummarizerPageClient />
}
