"use client"

import {
  FileTextIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"

import {
  getInputTypeLabel,
  getSummaryTypeLabel,
} from "@/features/ai-summarizer/api"
import type { Summary } from "@/features/ai-summarizer/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

function formatSummaryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function getPreview(content: string) {
  const preview = content.replace(/\s+/g, " ").trim()

  return preview.length > 130 ? `${preview.slice(0, 130)}...` : preview
}

export function SummaryHistory({
  summaries,
  isLoading,
  showAll,
  onUse,
  onDelete,
}: {
  summaries: Summary[]
  isLoading: boolean
  showAll: boolean
  onUse: (summary: Summary) => void
  onDelete: (summary: Summary) => void
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/35 p-3"
          >
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!summaries.length) {
    return (
      <Empty className="min-h-0 border border-dashed bg-background/30 p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SparklesIcon />
          </EmptyMedia>
          <EmptyTitle>No saved summaries yet</EmptyTitle>
          <EmptyDescription>
            Save a generated result to keep it here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const visibleSummaries = showAll ? summaries : summaries.slice(0, 3)

  return (
    <div className="flex flex-col gap-2">
      {visibleSummaries.map((summary) => (
        <div
          key={summary.id}
          className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/35 p-3 transition-colors hover:bg-background/55 sm:flex-row sm:items-center"
        >
          <div className="shrink-0 text-primary">
            <FileTextIcon />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium">{summary.title}</p>
              <Badge variant="secondary">
                {getSummaryTypeLabel(summary.summaryType)}
              </Badge>
              <Badge variant="outline">{getInputTypeLabel(summary.inputType)}</Badge>
            </div>
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {getPreview(summary.content)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:justify-end">
            <span className="mr-2 hidden text-xs text-muted-foreground lg:inline">
              {formatSummaryDate(summary.createdAt)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Use ${summary.title}`}
              onClick={() => onUse(summary)}
            >
              <RotateCcwIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${summary.title}`}
              onClick={() => onDelete(summary)}
            >
              <Trash2Icon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
