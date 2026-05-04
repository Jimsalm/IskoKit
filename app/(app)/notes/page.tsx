import { requireAuth } from "@/features/auth/server"
import { NotesPageClient } from "@/features/notes/components/notes-page-client"

export default async function NotesPage() {
  await requireAuth()

  return <NotesPageClient />
}
