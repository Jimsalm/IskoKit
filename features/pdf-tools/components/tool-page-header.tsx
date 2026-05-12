import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import type { PdfToolConfig } from "@/features/pdf-tools/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ToolPageHeader({ tool }: { tool: PdfToolConfig }) {
  const ToolIcon = tool.icon

  return (
    <div className="flex flex-col gap-5">
      <Button variant="ghost" size="sm" className="self-start" asChild>
        <Link href="/pdf-tools">
          <ArrowLeftIcon data-icon="inline-start" />
          PDF Tools
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Document tools
          </p>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <ToolIcon />
            </span>
            <h1 className="text-2xl font-semibold">{tool.label}</h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {tool.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{tool.category}</Badge>
          <Badge variant="outline">{tool.acceptedTypes}</Badge>
          {tool.status ? (
            <Badge variant={tool.status === "limited" ? "outline" : "secondary"}>
              {tool.status === "limited" ? "Limited" : "Experimental"}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  )
}
