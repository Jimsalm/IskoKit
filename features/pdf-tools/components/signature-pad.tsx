"use client"

import { useRef, useState } from "react"
import { EraserIcon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SignaturePad({
  signatureDataUrl,
  onSignatureChange,
}: {
  signatureDataUrl: string
  onSignatureChange: (value: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }

    onSignatureChange("")
  }

  function saveCanvasSignature() {
    const canvas = canvasRef.current

    if (canvas) {
      onSignatureChange(canvas.toDataURL("image/png"))
    }
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return
    }

    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      return
    }

    onSignatureChange(await new Promise<string>((resolve) => {
      const reader = new FileReader()

      reader.onload = () => resolve(String(reader.result ?? ""))
      reader.readAsDataURL(file)
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature</CardTitle>
        <CardDescription>
          Draw a signature or upload a PNG/JPG signature image.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <canvas
          ref={canvasRef}
          width={720}
          height={220}
          className="h-44 w-full touch-none rounded-xl border bg-white"
          onPointerDown={(event) => {
            const context = event.currentTarget.getContext("2d")
            const point = getPoint(event)

            if (!context) {
              return
            }

            event.currentTarget.setPointerCapture(event.pointerId)
            context.lineWidth = 4
            context.lineCap = "round"
            context.strokeStyle = "#111827"
            context.beginPath()
            context.moveTo(point.x, point.y)
            setIsDrawing(true)
          }}
          onPointerMove={(event) => {
            if (!isDrawing) {
              return
            }

            const context = event.currentTarget.getContext("2d")
            const point = getPoint(event)

            if (!context) {
              return
            }

            context.lineTo(point.x, point.y)
            context.stroke()
          }}
          onPointerUp={() => {
            setIsDrawing(false)
            saveCanvasSignature()
          }}
          onPointerCancel={() => setIsDrawing(false)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={clearSignature}>
            <EraserIcon data-icon="inline-start" />
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon data-icon="inline-start" />
            Upload image
          </Button>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(event) => {
              void handleImageUpload(event.target.files?.[0])
              event.target.value = ""
            }}
          />
        </div>
        {signatureDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signatureDataUrl}
            alt="Signature preview"
            className="max-h-24 max-w-xs object-contain"
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
