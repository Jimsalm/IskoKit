import type { Metadata } from "next"

import { ToolPlaceholder } from "@/features/app-shell/components/tool-placeholder"
import { getAppTool } from "@/features/app-shell/tools"

export const metadata: Metadata = {
  title: "GPA Calculator",
}

export default function GpaCalculatorPage() {
  return <ToolPlaceholder tool={getAppTool("/gpa-calculator")} />
}
