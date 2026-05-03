import { ToolPlaceholder } from "@/features/app-shell/components/tool-placeholder"
import { getAppTool } from "@/features/app-shell/tools"

export default function GpaCalculatorPage() {
  return <ToolPlaceholder tool={getAppTool("/gpa-calculator")} />
}
