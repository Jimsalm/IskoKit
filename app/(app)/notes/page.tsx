import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { NotesPageClient } from "@/features/notes/components/notes-page-client"

export const metadata: Metadata = {
  title: "Notes",
}

export default async function NotesPage() {
  await requireAuth()

  return <NotesPageClient />
}
