"use client"

import { RotateCcwIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatGwaValue, formatUnitsValue } from "@/features/gwa/lib/calculate"
import type { GwaRecord } from "@/features/gwa/types"

function GwaRecordDetailsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}

function GwaRecordDetailsContent({ record }: { record: GwaRecord }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">GWA</span>
          <span className="text-xl font-semibold">
            {formatGwaValue(record.gwa)}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Total units</span>
          <span className="text-xl font-semibold">
            {formatUnitsValue(record.totalUnits)}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Subjects</span>
          <span className="text-xl font-semibold">{record.totalSubjects}</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Included</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {record.subjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell className="font-medium">
                {subject.subjectName}
              </TableCell>
              <TableCell>{subject.subjectCode ?? "-"}</TableCell>
              <TableCell className="text-right">
                {formatUnitsValue(subject.units)}
              </TableCell>
              <TableCell>{subject.grade}</TableCell>
              <TableCell>
                <Badge variant={subject.isIncluded ? "default" : "outline"}>
                  {subject.isIncluded ? "Yes" : "No"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export function GwaRecordDetailsDialog({
  open,
  record,
  isLoading,
  errorMessage,
  onRetry,
  onOpenChange,
}: {
  open: boolean
  record: GwaRecord | null
  isLoading: boolean
  errorMessage?: string
  onRetry: () => void
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[min(86vh,760px)] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {record ? `${record.semester} ${record.schoolYear}` : "GWA details"}
          </DialogTitle>
          <DialogDescription>
            {record
              ? `GWA ${formatGwaValue(record.gwa)} across ${formatUnitsValue(
                  record.totalUnits,
                )} units.`
              : "Loading the saved subject breakdown."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {isLoading ? <GwaRecordDetailsLoading /> : null}
          {!isLoading && errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load GWA details</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <span>{errorMessage}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  onClick={onRetry}
                >
                  <RotateCcwIcon data-icon="inline-start" />
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {!isLoading && !errorMessage && record ? (
            <GwaRecordDetailsContent record={record} />
          ) : null}
        </DialogBody>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
