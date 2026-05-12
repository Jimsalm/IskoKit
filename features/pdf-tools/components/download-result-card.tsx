"use client"

import { CheckCircle2Icon, DownloadIcon } from "lucide-react"

import { downloadGeneratedFile } from "@/features/pdf-tools/lib/download"
import { formatFileSize } from "@/features/pdf-tools/lib/file-validation"
import type { PdfToolResult } from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DownloadResultCard({ result }: { result: PdfToolResult | null }) {
  if (!result) {
    return null
  }

  const hasMultipleFiles = result.files.length > 1

  return (
    <Card>
      <CardHeader>
        <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <CheckCircle2Icon />
        </div>
        <CardTitle>Output ready</CardTitle>
        <CardDescription>
          {result.message ??
            `Download ${hasMultipleFiles ? "your generated files" : "the generated file"}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Original size</p>
            <p className="mt-1 text-sm font-medium">
              {formatFileSize(result.originalSize)}
            </p>
          </div>
          {result.outputSize !== null ? (
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Output size</p>
              <p className="mt-1 text-sm font-medium">
                {formatFileSize(result.outputSize)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          {result.files.map((file) => (
            <div
              key={file.fileName}
              className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadGeneratedFile(file)}
              >
                <DownloadIcon data-icon="inline-start" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      {hasMultipleFiles ? (
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            ZIP download is skipped for the MVP. Download images individually.
          </p>
        </CardFooter>
      ) : null}
    </Card>
  )
}
