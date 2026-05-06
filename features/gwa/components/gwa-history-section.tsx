"use client"

import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GwaEmpty } from "@/features/gwa/components/gwa-empty"
import { GwaError } from "@/features/gwa/components/gwa-error"
import { GwaLoading } from "@/features/gwa/components/gwa-loading"
import { formatGwaValue, formatUnitsValue } from "@/features/gwa/lib/calculate"
import type { GwaRecord } from "@/features/gwa/types"

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export function GwaHistorySection({
  records,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: {
  records: GwaRecord[]
  isLoading: boolean
  isError: boolean
  errorMessage: string
  onRetry: () => void
  onCreate: () => void
  onView: (record: GwaRecord) => void
  onEdit: (record: GwaRecord) => void
  onDelete: (record: GwaRecord) => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">GWA history</h2>
          <p className="text-sm text-muted-foreground">
            Saved semester records and subject breakdowns.
          </p>
        </div>
        {records.length ? (
          <Badge variant="secondary">
            {records.length} {records.length === 1 ? "record" : "records"}
          </Badge>
        ) : null}
      </div>

      {isLoading ? <GwaLoading /> : null}
      {isError ? <GwaError message={errorMessage} onRetry={onRetry} /> : null}
      {!isLoading && !isError && records.length === 0 ? (
        <GwaEmpty onCreate={onCreate} />
      ) : null}
      {!isLoading && !isError && records.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <CardTitle className="truncate">
                      {record.semester}
                    </CardTitle>
                    <CardDescription>{record.schoolYear}</CardDescription>
                  </div>
                  <CardAction className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${record.semester} ${record.schoolYear}`}
                      onClick={() => onView(record)}
                    >
                      <EyeIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${record.semester} ${record.schoolYear}`}
                      onClick={() => onEdit(record)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${record.semester} ${record.schoolYear}`}
                      onClick={() => onDelete(record)}
                    >
                      <Trash2Icon />
                    </Button>
                  </CardAction>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">GWA</span>
                    <span className="text-lg font-semibold">
                      {formatGwaValue(record.gwa)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">Units</span>
                    <span className="text-lg font-semibold">
                      {formatUnitsValue(record.totalUnits)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">
                      Subjects
                    </span>
                    <span className="text-lg font-semibold">
                      {record.totalSubjects}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Saved {formatCreatedAt(record.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  )
}
