"use client"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export function GwaRecordDetailsDialog({
  record,
  onOpenChange,
}: {
  record: GwaRecord | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      {record ? (
        <DialogContent className="max-h-[min(90vh,900px)] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {record.semester} {record.schoolYear}
            </DialogTitle>
            <DialogDescription>
              GWA {formatGwaValue(record.gwa)} across{" "}
              {formatUnitsValue(record.totalUnits)} units.
            </DialogDescription>
          </DialogHeader>

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
              <span className="text-xl font-semibold">
                {record.totalSubjects}
              </span>
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

          <DialogFooter showCloseButton />
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
