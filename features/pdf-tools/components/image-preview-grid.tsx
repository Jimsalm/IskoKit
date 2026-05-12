"use client"

import { useEffect, useMemo, type ReactNode } from "react"

import { formatFileSize } from "@/features/pdf-tools/lib/file-validation"
import type { GeneratedFile } from "@/features/pdf-tools/types"

type PreviewItem = {
  key: string
  name: string
  size: number
  url: string
  file?: File
  generatedFile?: GeneratedFile
}

type ImagePreviewGridProps = {
  files?: File[]
  generatedFiles?: GeneratedFile[]
  renderAction?: (item: PreviewItem, index: number) => ReactNode
}

export function ImagePreviewGrid({
  files = [],
  generatedFiles = [],
  renderAction,
}: ImagePreviewGridProps) {
  const filePreviews = useMemo(() => {
    return files.map((file, index) => ({
      key: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      file,
    }))
  }, [files])

  useEffect(() => {
    return () => {
      for (const item of filePreviews) {
        URL.revokeObjectURL(item.url)
      }
    }
  }, [filePreviews])

  const previews = useMemo<PreviewItem[]>(() => {
    if (generatedFiles.length) {
      return generatedFiles.map((file) => ({
        key: file.fileName,
        name: file.fileName,
        size: file.size,
        url: file.previewUrl ?? "",
        generatedFile: file,
      }))
    }

    return filePreviews
  }, [filePreviews, generatedFiles])

  if (!previews.length) {
    return null
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {previews.map((item, index) => (
        <div key={item.key} className="overflow-hidden rounded-xl border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.name}
            className="aspect-[4/3] w-full object-contain bg-background"
          />
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(item.size)}
              </p>
            </div>
            {renderAction ? renderAction(item, index) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
