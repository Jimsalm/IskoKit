"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  FileIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { formatFileSize } from "@/features/pdf-tools/lib/file-validation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SelectedFileListProps = {
  files: File[]
  title?: string
  canReorder?: boolean
  onRemove: (index: number) => void
  onClear: () => void
  onMove?: (fromIndex: number, toIndex: number) => void
}

export function SelectedFileList({
  files,
  title = "Selected files",
  canReorder = false,
  onRemove,
  onClear,
  onMove,
}: SelectedFileListProps) {
  if (!files.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {files.length} file{files.length === 1 ? "" : "s"} selected
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}-${index}`}
            className="flex items-center gap-3 rounded-lg border bg-background p-3"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-card">
              <FileIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            {canReorder && onMove ? (
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  aria-label={`Move ${file.name} up`}
                  onClick={() => onMove(index, index - 1)}
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === files.length - 1}
                  aria-label={`Move ${file.name} down`}
                  onClick={() => onMove(index, index + 1)}
                >
                  <ArrowDownIcon />
                </Button>
              </div>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${file.name}`}
              onClick={() => onRemove(index)}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={onClear}
        >
          <XIcon data-icon="inline-start" />
          Clear all
        </Button>
      </CardContent>
    </Card>
  )
}
