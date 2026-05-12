import Link from "next/link"
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react"

import type { PdfToolConfig } from "@/features/pdf-tools/types"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PdfToolCard({
  tool,
  viewMode = "grid",
}: {
  tool: PdfToolConfig
  viewMode?: "grid" | "list"
}) {
  const ToolIcon = tool.icon
  const ActionIcon = tool.isExternal ? ExternalLinkIcon : ArrowRightIcon
  const linkProps = tool.isExternal
    ? {
        rel: "noreferrer",
        target: "_blank",
      }
    : {}
  const ariaLabel = tool.isExternal
    ? `Open ${tool.label} on iLovePDF`
    : `Open ${tool.label}`

  return (
    <Link
      href={tool.href}
      aria-label={ariaLabel}
      className="group/card block rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      {...linkProps}
    >
      <Card
        className={cn(
          "overflow-hidden rounded-md bg-card/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg [&_[data-slot=card-footer]]:rounded-b-md [&_[data-slot=card-header]]:rounded-t-md",
          viewMode === "grid" ? "min-h-48" : "min-h-0",
        )}
      >
        <CardHeader className={viewMode === "list" ? "flex-row items-center" : ""}>
          <span className="grid size-11 place-items-center rounded-md border bg-primary/10 text-primary">
            <ToolIcon />
          </span>
          {viewMode === "list" ? (
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">{tool.label}</CardTitle>
              <p className="truncate text-sm text-muted-foreground">
                {tool.description}
              </p>
            </div>
          ) : null}
          <CardAction>
            <span className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover/card:text-foreground">
              <ActionIcon />
            </span>
          </CardAction>
        </CardHeader>
        {viewMode === "grid" ? (
          <CardContent className="flex flex-1 flex-col gap-2">
            <CardTitle className="text-lg">{tool.label}</CardTitle>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {tool.description}
            </p>
          </CardContent>
        ) : null}
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{tool.category}</Badge>
            <Badge variant="outline">{tool.acceptedTypes}</Badge>
            {tool.isExternal ? <Badge variant="outline">External</Badge> : null}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
