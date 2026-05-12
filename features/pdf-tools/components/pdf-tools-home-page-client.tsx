"use client"

import { useMemo, useState } from "react"
import { Grid2X2Icon, ListIcon } from "lucide-react"

import { PdfToolCard } from "@/features/pdf-tools/components/pdf-tool-card"
import { RecentFileActivity } from "@/features/pdf-tools/components/recent-file-activity"
import { pdfToolConfigs } from "@/features/pdf-tools/tool-config"
import type { PdfToolCategory } from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const categoryFilters = ["All", "Convert", "Organize", "Edit"] as const
type CategoryFilter = (typeof categoryFilters)[number]
type ViewMode = "grid" | "list"

function matchesCategory(
  toolCategory: PdfToolCategory,
  category: CategoryFilter,
) {
  return category === "All" || toolCategory === category
}

export function PdfToolsHomePageClient() {
  const [category, setCategory] = useState<CategoryFilter>("All")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const visibleTools = useMemo(
    () => pdfToolConfigs.filter((tool) => matchesCategory(tool.category, category)),
    [category],
  )

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-normal">PDF Tools</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Convert, organize, edit, and manage documents locally.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          spacing={2}
          value={category}
          onValueChange={(value) => {
            if (value) {
              setCategory(value as CategoryFilter)
            }
          }}
          className="justify-start rounded-md border bg-card/60 p-1"
        >
          {categoryFilters.map((filter) => (
            <ToggleGroupItem
              key={filter}
              value={filter}
              className="rounded-md px-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {filter}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex w-fit rounded-md border bg-card/60 p-1">
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-md"
            aria-pressed={viewMode === "grid"}
            aria-label="Show tools as grid"
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2Icon />
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-md"
            aria-pressed={viewMode === "list"}
            aria-label="Show tools as list"
            onClick={() => setViewMode("list")}
          >
            <ListIcon />
          </Button>
        </div>
      </div>

      {visibleTools.length ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 xl:grid-cols-5"
              : "grid gap-3"
          }
        >
          {visibleTools.map((tool) => (
            <PdfToolCard key={tool.id} tool={tool} viewMode={viewMode} />
          ))}
        </div>
      ) : null}

      <RecentFileActivity />
    </section>
  )
}
