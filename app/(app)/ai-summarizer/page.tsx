import { ToolPlaceholder } from "@/features/app-shell/components/tool-placeholder"
import { getAppTool } from "@/features/app-shell/tools"

export default function AiSummarizerPage() {
  return <ToolPlaceholder tool={getAppTool("/ai-summarizer")} />
}
