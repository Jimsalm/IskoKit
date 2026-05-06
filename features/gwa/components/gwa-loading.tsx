"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function GwaLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-col gap-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-20 rounded-4xl" />
            <Skeleton className="h-5 w-24 rounded-4xl" />
            <Skeleton className="h-5 w-16 rounded-4xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
