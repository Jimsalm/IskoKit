import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { FlashcardsPageClient } from "@/features/flashcards/components/flashcards-page-client"

export const metadata: Metadata = {
  title: "Flashcards",
}

export default async function FlashcardsPage() {
  await requireAuth()

  return <FlashcardsPageClient />
}
