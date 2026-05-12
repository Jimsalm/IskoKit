"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PdfPageNavigator({
  pageNumber,
  pageCount,
  onPageChange,
}: {
  pageNumber: number
  pageCount: number
  onPageChange: (pageNumber: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        <ChevronLeftIcon data-icon="inline-start" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {pageNumber} of {pageCount || 1}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pageNumber >= pageCount}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Next
        <ChevronRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}
