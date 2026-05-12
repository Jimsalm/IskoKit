"use client"

import { useCallback, useState } from "react"

import type { PdfPageRender, PdfTextOverlay } from "@/features/pdf-tools/types"
import { cn } from "@/lib/utils"

type DragState = {
  id: string
  offsetX: number
  offsetY: number
}

type ResizeState = {
  id: string
  startFontSize: number
  startX: number
  startY: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCssFontFamily(fontFamily: PdfTextOverlay["fontFamily"]) {
  if (fontFamily === "times_roman") {
    return "Times New Roman, Times, serif"
  }

  if (fontFamily === "courier") {
    return "Courier New, Courier, monospace"
  }

  return "Arial, Helvetica, sans-serif"
}

export function TextOverlayEditor({
  render,
  overlays,
  selectedOverlayId,
  onPlace,
  onSelect,
  onChange,
}: {
  render: PdfPageRender
  overlays: PdfTextOverlay[]
  selectedOverlayId: string | null
  onPlace: (position: { x: number; y: number }) => void
  onSelect: (id: string) => void
  onChange: (overlays: PdfTextOverlay[]) => void
}) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [resizeState, setResizeState] = useState<ResizeState | null>(null)

  const updateActiveOverlay = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (resizeState) {
        const delta = Math.max(
          event.clientX - resizeState.startX,
          event.clientY - resizeState.startY,
        )
        const fontSize = clamp(
          Math.round(resizeState.startFontSize + delta / 2),
          8,
          96,
        )

        onChange(
          overlays.map((overlay) =>
            overlay.id === resizeState.id ? { ...overlay, fontSize } : overlay,
          ),
        )
        return
      }

      if (!dragState) {
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const x = clamp(
        (event.clientX - rect.left - dragState.offsetX) / rect.width,
        0,
        0.95,
      )
      const y = clamp(
        (event.clientY - rect.top - dragState.offsetY) / rect.height,
        0,
        0.95,
      )

      onChange(
        overlays.map((overlay) =>
          overlay.id === dragState.id ? { ...overlay, x, y } : overlay,
        ),
      )
    },
    [dragState, onChange, overlays, resizeState],
  )

  function updateOverlay(id: string, values: Partial<PdfTextOverlay>) {
    onChange(
      overlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...values } : overlay,
      ),
    )
  }

  function placeText(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    onPlace({
      x: clamp((event.clientX - rect.left) / rect.width, 0, 0.95),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 0.95),
    })
  }

  return (
    <div
      className="absolute inset-0 cursor-text"
      style={{ width: render.width, height: render.height }}
      onPointerDown={placeText}
      onPointerMove={updateActiveOverlay}
      onPointerUp={() => {
        setDragState(null)
        setResizeState(null)
      }}
      onPointerCancel={() => {
        setDragState(null)
        setResizeState(null)
      }}
    >
      {overlays
        .filter((overlay) => overlay.pageNumber === render.pageNumber)
        .map((overlay) => (
          <div
            key={overlay.id}
            role="button"
            tabIndex={0}
            className={cn(
              "absolute border border-transparent bg-transparent p-0.5 text-left leading-none",
              selectedOverlayId === overlay.id &&
                "cursor-move border-ring",
            )}
            style={{
              left: `${overlay.x * 100}%`,
              top: `${overlay.y * 100}%`,
              color: overlay.color,
              fontSize: overlay.fontSize,
              fontFamily: getCssFontFamily(overlay.fontFamily),
              fontStyle: overlay.isItalic ? "italic" : "normal",
              fontWeight: overlay.isBold ? 700 : 400,
            }}
            onPointerDown={(event) => {
              if (
                event.target instanceof HTMLElement &&
                event.target.closest("[data-pdf-text-input]")
              ) {
                onSelect(overlay.id)
                return
              }

              const targetRect = event.currentTarget.getBoundingClientRect()
              event.currentTarget.setPointerCapture(event.pointerId)
              onSelect(overlay.id)
              setDragState({
                id: overlay.id,
                offsetX: event.clientX - targetRect.left,
                offsetY: event.clientY - targetRect.top,
              })
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                onSelect(overlay.id)
              }
            }}
          >
            {selectedOverlayId === overlay.id ? (
              <input
                data-pdf-text-input
                aria-label="Edit PDF text"
                autoFocus
                className="border-none bg-transparent p-0 outline-none"
                size={Math.max(overlay.text.length, 4)}
                value={overlay.text}
                style={{
                  color: "inherit",
                  font: "inherit",
                  minWidth: `${Math.max(overlay.fontSize * 2, 32)}px`,
                }}
                onChange={(event) =>
                  updateOverlay(overlay.id, { text: event.target.value })
                }
                onPointerDown={(event) => {
                  event.stopPropagation()
                  onSelect(overlay.id)
                }}
              />
            ) : (
              <span>{overlay.text || "Text"}</span>
            )}
            {selectedOverlayId === overlay.id ? (
              <span
                className="absolute -right-1 -bottom-1 size-2.5 cursor-nwse-resize border border-ring bg-background"
                aria-hidden="true"
                onPointerDown={(event) => {
                  event.stopPropagation()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDragState(null)
                  setResizeState({
                    id: overlay.id,
                    startFontSize: overlay.fontSize,
                    startX: event.clientX,
                    startY: event.clientY,
                  })
                }}
              />
            ) : null}
          </div>
        ))}
    </div>
  )
}
