"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import {
  getPdfReadErrorMessage,
  renderPdfPageToCanvas,
} from "@/features/pdf-tools/lib/pdf-document"
import type { PdfPageRender } from "@/features/pdf-tools/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export function PdfPreviewCanvas({
  file,
  pageNumber,
  children,
  onRender,
}: {
  file: File | null
  pageNumber: number
  children?: (render: PdfPageRender) => ReactNode
  onRender?: (render: PdfPageRender) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [render, setRender] = useState<PdfPageRender | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function drawPage() {
      if (!file || !canvasRef.current) {
        return
      }

      setIsLoading(true)
      setError("")

      try {
        const nextRender = await renderPdfPageToCanvas({
          file,
          pageNumber,
          canvas: canvasRef.current,
        })

        if (isMounted) {
          setRender(nextRender)
          onRender?.(nextRender)
        }
      } catch (renderError) {
        if (isMounted) {
          setError(getPdfReadErrorMessage(renderError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void drawPage()

    return () => {
      isMounted = false
    }
  }, [file, onRender, pageNumber])

  if (!file) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? <Skeleton className="h-[520px] w-full" /> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not render PDF</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="overflow-auto rounded-xl border bg-background p-3">
        <div className="relative mx-auto w-fit">
          <canvas ref={canvasRef} className="block max-w-full bg-white" />
          {render ? children?.(render) : null}
        </div>
      </div>
    </div>
  )
}
