import { ToolPlaceholder } from "@/features/app-shell/components/tool-placeholder"
import { getAppTool } from "@/features/app-shell/tools"

export default function FlashcardsPage() {
  return <ToolPlaceholder tool={getAppTool("/flashcards")} />
}
