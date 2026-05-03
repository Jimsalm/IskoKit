import { ToolPlaceholder } from "@/features/app-shell/components/tool-placeholder"
import { getAppTool } from "@/features/app-shell/tools"

export default function PdfToolsPage() {
  return <ToolPlaceholder tool={getAppTool("/pdf-tools")} />
}
