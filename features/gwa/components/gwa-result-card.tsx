"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatGwaValue, formatUnitsValue } from "@/features/gwa/lib/calculate"
import type { GwaCalculationResult } from "@/features/gwa/types"

function getRemarkBadgeVariant(gwa: number) {
  if (gwa <= 2) {
    return "default"
  }

  if (gwa <= 3) {
    return "secondary"
  }

  return "destructive"
}

export function GwaResultCard({
  result,
}: {
  result: GwaCalculationResult | null
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Result</CardTitle>
        <CardDescription>
          Your calculated General Weighted Average appears here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">GWA</span>
              <span className="text-2xl font-semibold">
                {formatGwaValue(result.gwa)}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Total units</span>
              <span className="text-2xl font-semibold">
                {formatUnitsValue(result.totalUnits)}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Subjects</span>
              <span className="text-2xl font-semibold">
                {result.totalSubjects}
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Remarks</span>
              <Badge
                variant={getRemarkBadgeVariant(result.gwa)}
                className="self-start"
              >
                {result.remarks}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Add your subjects and calculate GWA to see the result.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
