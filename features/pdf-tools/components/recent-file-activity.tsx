"use client"

import {
  ClockIcon,
  FileTextIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { useFileActivities } from "@/features/pdf-tools/hooks"
import { formatFileSize } from "@/features/pdf-tools/lib/file-validation"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function RecentFileActivity() {
  const activitiesQuery = useFileActivities()
  const activities = activitiesQuery.data ?? []

  return (
    <Card className="overflow-hidden rounded-md bg-card/70 [&_[data-slot=card-header]]:rounded-t-md">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClockIcon />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activitiesQuery.isPending ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : null}

        {activitiesQuery.isError ? (
          <div className="p-4">
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Could not load activity</AlertTitle>
              <AlertDescription>
                {pdfToolMutationError(activitiesQuery.error)}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        {activitiesQuery.isSuccess && !activities.length ? (
          <Empty className="p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClockIcon />
              </EmptyMedia>
              <EmptyTitle>No PDF activity yet</EmptyTitle>
              <EmptyDescription>
                Process a document and your recent activity will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {activitiesQuery.isSuccess && activities.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => {
                const tool = getPdfToolConfig(activity.toolUsed)
                const ToolIcon = tool.icon

                return (
                  <TableRow key={activity.id}>
                    <TableCell className="min-w-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
                          <FileTextIcon />
                        </span>
                        <span className="truncate">
                          {activity.outputFileName ??
                            activity.inputFileNames.join(", ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
                          <ToolIcon />
                        </span>
                        <span>{tool.label}</span>
                        {tool.isExternal ? (
                          <Badge variant="outline">External</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatFileSize(activity.originalSize)}
                      {activity.outputSize !== null
                        ? ` to ${formatFileSize(activity.outputSize)}`
                        : ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatActivityDate(activity.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  )
}
