"use client"

import { useRef, useState } from "react"
import { UploadIcon } from "lucide-react"

import {
  appendValidatedFiles,
  formatFileSize,
  getAcceptAttribute,
  type FileValidationConfig,
} from "@/features/pdf-tools/lib/file-validation"
import { maxPdfToolFileSizeBytes } from "@/features/pdf-tools/schemas"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type FileUploadAreaProps = {
  title?: string
  description?: string
  files: File[]
  multiple?: boolean
  disabled?: boolean
  config: FileValidationConfig
  onFilesChange: (files: File[]) => void
  onValidationError: (message: string) => void
}

export function FileUploadArea({
  title = "Upload files",
  description,
  files,
  multiple = false,
  disabled = false,
  config,
  onFilesChange,
  onValidationError,
}: FileUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const accept = getAcceptAttribute(config.acceptedExtensions)

  function addFiles(fileList: FileList | null) {
    const incomingFiles = Array.from(fileList ?? [])

    if (!incomingFiles.length) {
      return
    }

    const result = appendValidatedFiles({
      currentFiles: multiple ? files : [],
      incomingFiles: multiple ? incomingFiles : incomingFiles.slice(0, 1),
      config,
    })

    if (result.error) {
      onValidationError(result.error)
      return
    }

    onFilesChange(result.files)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)

    if (!disabled) {
      addFiles(event.dataTransfer.files)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ??
            `Upload ${config.fileTypeLabel} files. Max ${formatFileSize(
              config.maxSizeBytes ?? maxPdfToolFileSizeBytes,
            )} each.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-background p-6 text-center transition-colors",
            isDragging && "border-primary bg-accent",
            disabled && "opacity-60",
          )}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
          onDrop={handleDrop}
        >
          <div className="grid size-12 place-items-center rounded-full border bg-card">
            <UploadIcon />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              Drop files here or choose from your device
            </p>
            <p className="text-xs text-muted-foreground">
              Supports {config.fileTypeLabel}. Up to{" "}
              {config.maxFiles ?? 10} files.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon data-icon="inline-start" />
            Choose files
          </Button>
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(event) => {
              addFiles(event.target.files)
              event.target.value = ""
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
