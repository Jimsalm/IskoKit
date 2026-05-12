"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { toast } from "sonner"

import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { AnnotationToolbar } from "@/features/pdf-tools/components/annotation-toolbar"
import { DownloadResultCard } from "@/features/pdf-tools/components/download-result-card"
import { FileUploadArea } from "@/features/pdf-tools/components/file-upload-area"
import { PdfPageNavigator } from "@/features/pdf-tools/components/pdf-page-navigator"
import { PdfPreviewCanvas } from "@/features/pdf-tools/components/pdf-preview-canvas"
import { ProcessingState } from "@/features/pdf-tools/components/processing-state"
import { SelectedFileList } from "@/features/pdf-tools/components/selected-file-list"
import { ToolPageHeader } from "@/features/pdf-tools/components/tool-page-header"
import { useCreateFileActivity } from "@/features/pdf-tools/hooks"
import {
  getTotalFileSize,
  pdfExtensions,
  validateFileSelection,
} from "@/features/pdf-tools/lib/file-validation"
import { writeAnnotationsToPdf } from "@/features/pdf-tools/lib/pdf-overlays"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type {
  PdfHighlightAnnotation,
  PdfPageRender,
  PdfTextNoteAnnotation,
  PdfToolResult,
} from "@/features/pdf-tools/types"

const tool = getPdfToolConfig("pdf_annotator")
const highlightColors = [
  "#facc15",
  "#bef264",
  "#67e8f9",
  "#f9a8d4",
  "#c4b5fd",
] as const

type ActiveAnnotationDrag = {
  id: string
  kind: "highlight" | "note"
  containerHeight: number
  containerLeft: number
  containerTop: number
  containerWidth: number
  offsetX: number
  offsetY: number
}

type ActiveHighlightPaint = {
  id: string
  containerHeight: number
  containerLeft: number
  containerTop: number
  containerWidth: number
  startX: number
  startY: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function createNote(pageNumber: number): PdfTextNoteAnnotation {
  return {
    id: crypto.randomUUID(),
    pageNumber,
    text: "Note",
    x: 0.2,
    y: 0.35,
    fontSize: 14,
    color: "#1f2937",
    fontFamily: "helvetica",
    isBold: false,
    isItalic: false,
  }
}

function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA"
  )
}

export function AnnotatorPageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [highlights, setHighlights] = useState<PdfHighlightAnnotation[]>([])
  const [notes, setNotes] = useState<PdfTextNoteAnnotation[]>([])
  const [highlightColor, setHighlightColor] = useState<string>(
    highlightColors[0],
  )
  const [isHighlightMode, setIsHighlightMode] = useState(false)
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(
    null,
  )
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const activeDragRef = useRef<ActiveAnnotationDrag | null>(null)
  const activeHighlightPaintRef = useRef<ActiveHighlightPaint | null>(null)
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const createActivityMutation = useCreateFileActivity()
  const selectedHighlight = useMemo(
    () =>
      highlights.find((highlight) => highlight.id === selectedHighlightId) ??
      null,
    [highlights, selectedHighlightId],
  )
  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  )
  const handleRender = useCallback((render: PdfPageRender) => {
    setPageCount(render.pageCount)
  }, [])

  function handleAddNote() {
    const note = createNote(pageNumber)

    setNotes((current) => [...current, note])
    setIsHighlightMode(false)
    setSelectedNoteId(note.id)
    setSelectedHighlightId(null)
    setResult(null)
  }

  function updateHighlightColor(color: string) {
    setHighlightColor(color)
    setIsHighlightMode(true)
    setSelectedNoteId(null)

    if (selectedHighlightId) {
      setHighlights((current) =>
        current.map((highlight) =>
          highlight.id === selectedHighlightId
            ? {
                ...highlight,
                color,
              }
            : highlight,
        ),
      )
    }

    setResult(null)
  }

  function updateSelectedNote(text: string) {
    if (!selectedNoteId) {
      return
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === selectedNoteId ? { ...note, text } : note,
      ),
    )
  }

  function handleDeleteSelectedAnnotation() {
    if (selectedHighlightId) {
      setHighlights((current) =>
        current.filter((highlight) => highlight.id !== selectedHighlightId),
      )
      setSelectedHighlightId(null)
      setResult(null)
      return
    }

    if (selectedNoteId) {
      setNotes((current) =>
        current.filter((note) => note.id !== selectedNoteId),
      )
      setSelectedNoteId(null)
      setResult(null)
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Backspace" && event.key !== "Delete") {
        return
      }

      if (!selectedHighlightId && !selectedNoteId) {
        return
      }

      if (isEditableKeyboardTarget(event.target)) {
        return
      }

      event.preventDefault()
      handleDeleteSelectedAnnotation()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  })

  function startDrag({
    event,
    kind,
    id,
    x,
    y,
  }: {
    event: ReactMouseEvent<HTMLElement>
    kind: ActiveAnnotationDrag["kind"]
    id: string
    x: number
    y: number
  }) {
    const container = event.currentTarget.parentElement

    if (!container) {
      return
    }

    const rect = container.getBoundingClientRect()
    const pointerX = (event.clientX - rect.left) / rect.width
    const pointerY = (event.clientY - rect.top) / rect.height

    event.preventDefault()
    const nextDrag = {
      id,
      kind,
      containerHeight: rect.height,
      containerLeft: rect.left,
      containerTop: rect.top,
      containerWidth: rect.width,
      offsetX: pointerX - x,
      offsetY: pointerY - y,
    }

    activeDragRef.current = nextDrag
    setResult(null)

    function updateAnnotationPosition(clientX: number, clientY: number) {
      const drag = activeDragRef.current

      if (!drag) {
        return
      }

      const pointerX =
        (clientX - drag.containerLeft) / drag.containerWidth
      const pointerY =
        (clientY - drag.containerTop) / drag.containerHeight

      if (drag.kind === "highlight") {
        setHighlights((current) =>
          current.map((highlight) => {
            if (highlight.id !== drag.id) {
              return highlight
            }

            return {
              ...highlight,
              x: clamp(pointerX - drag.offsetX, 0, 1 - highlight.width),
              y: clamp(pointerY - drag.offsetY, 0, 1 - highlight.height),
            }
          }),
        )
        return
      }

      setNotes((current) =>
        current.map((note) =>
          note.id === drag.id
            ? {
                ...note,
                x: clamp(pointerX - drag.offsetX, 0, 0.9),
                y: clamp(pointerY - drag.offsetY, 0, 0.95),
              }
            : note,
        ),
      )
    }

    function handleMouseMove(moveEvent: MouseEvent) {
      updateAnnotationPosition(moveEvent.clientX, moveEvent.clientY)
    }

    function stopDrag() {
      activeDragRef.current = null
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", stopDrag)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", stopDrag)
  }

  function startHighlightPaint({
    event,
    pageNumber,
  }: {
    event: ReactMouseEvent<HTMLDivElement>
    pageNumber: number
  }) {
    if (!isHighlightMode || event.button !== 0) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const startX = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const startY = clamp((event.clientY - rect.top) / rect.height, 0, 1)
    const id = crypto.randomUUID()

    event.preventDefault()
    setSelectedHighlightId(id)
    setSelectedNoteId(null)
    setResult(null)
    activeHighlightPaintRef.current = {
      id,
      containerHeight: rect.height,
      containerLeft: rect.left,
      containerTop: rect.top,
      containerWidth: rect.width,
      startX,
      startY,
    }
    setHighlights((current) => [
      ...current,
      {
        id,
        pageNumber,
        x: startX,
        y: startY,
        width: 0.001,
        height: 0.001,
        color: highlightColor,
      },
    ])

    function updateHighlightPaint(clientX: number, clientY: number) {
      const paint = activeHighlightPaintRef.current

      if (!paint) {
        return
      }

      const pointerX = clamp(
        (clientX - paint.containerLeft) / paint.containerWidth,
        0,
        1,
      )
      const pointerY = clamp(
        (clientY - paint.containerTop) / paint.containerHeight,
        0,
        1,
      )
      const x = Math.min(paint.startX, pointerX)
      const y = Math.min(paint.startY, pointerY)
      const width = Math.abs(pointerX - paint.startX)
      const height = Math.abs(pointerY - paint.startY)

      setHighlights((current) =>
        current.map((highlight) =>
          highlight.id === paint.id
            ? {
                ...highlight,
                x,
                y,
                width,
                height,
              }
            : highlight,
        ),
      )
    }

    function handleMouseMove(moveEvent: MouseEvent) {
      updateHighlightPaint(moveEvent.clientX, moveEvent.clientY)
    }

    function stopHighlightPaint() {
      const paint = activeHighlightPaintRef.current

      if (paint) {
        setHighlights((current) =>
          current.filter(
            (highlight) =>
              highlight.id !== paint.id ||
              (highlight.width >= 0.01 && highlight.height >= 0.008),
          ),
        )
      }

      activeHighlightPaintRef.current = null
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", stopHighlightPaint)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", stopHighlightPaint)
  }

  async function handleSave() {
    const validationError = validateFileSelection(files, {
      acceptedExtensions: pdfExtensions,
      minFiles: 1,
      maxFiles: 1,
      fileTypeLabel: "PDF",
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const output = await writeAnnotationsToPdf({
        file: files[0],
        highlights,
        notes,
      })

      setResult(output)
      toast.success("Annotated PDF ready.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "pdf_annotator",
          inputFileNames: files.map((file) => file.name),
          outputFileName: output.files[0]?.fileName ?? null,
          fileCount: files.length,
          originalSize: getTotalFileSize(files),
          outputSize: output.outputSize,
        })
        .catch((activityError) => {
          toast.error(pdfToolMutationError(activityError))
        })
    } catch (processError) {
      setError(pdfToolMutationError(processError))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <ToolPageHeader tool={tool} />
      <FileUploadArea
        files={files}
        config={{
          acceptedExtensions: pdfExtensions,
          maxFiles: 1,
          fileTypeLabel: "PDF",
        }}
        disabled={isProcessing}
        onFilesChange={(nextFiles) => {
          setFiles(nextFiles)
          setPageNumber(1)
          setHighlights([])
          setNotes([])
          setIsHighlightMode(false)
          setSelectedHighlightId(null)
          setSelectedNoteId(null)
          setResult(null)
          setError("")
        }}
        onValidationError={setError}
      />
      <SelectedFileList
        files={files}
        onRemove={() => {
          setFiles([])
          setHighlights([])
          setNotes([])
          setIsHighlightMode(false)
          setSelectedHighlightId(null)
          setSelectedNoteId(null)
          setResult(null)
        }}
        onClear={() => {
          setFiles([])
          setHighlights([])
          setNotes([])
          setIsHighlightMode(false)
          setSelectedHighlightId(null)
          setSelectedNoteId(null)
          setResult(null)
          setError("")
        }}
      />
      {files[0] ? (
        <>
          <AnnotationToolbar
            highlightColor={highlightColor}
            highlightColors={highlightColors}
            selectedNoteText={selectedNote?.text ?? ""}
            hasSelectedNote={Boolean(selectedNote)}
            hasSelectedAnnotation={Boolean(selectedHighlight || selectedNote)}
            hasAnnotations={Boolean(highlights.length || notes.length)}
            onHighlightColorChange={updateHighlightColor}
            onSelectedNoteTextChange={updateSelectedNote}
            onAddNote={handleAddNote}
            onDeleteSelected={handleDeleteSelectedAnnotation}
            onSave={handleSave}
          />
          <PdfPageNavigator
            pageNumber={pageNumber}
            pageCount={pageCount}
            onPageChange={setPageNumber}
          />
          <PdfPreviewCanvas
            file={files[0]}
            pageNumber={pageNumber}
            onRender={handleRender}
          >
            {(render) => (
              <div
                className="absolute inset-0"
                style={{
                  width: render.width,
                  height: render.height,
                  cursor: isHighlightMode ? "crosshair" : undefined,
                }}
                onMouseDown={(event) =>
                  startHighlightPaint({
                    event,
                    pageNumber: render.pageNumber,
                  })
                }
              >
                {highlights
                  .filter((highlight) => highlight.pageNumber === render.pageNumber)
                  .map((highlight) => (
                    <button
                      key={highlight.id}
                      type="button"
                      className="absolute cursor-move border transition-shadow"
                      draggable={false}
                      style={{
                        left: `${highlight.x * 100}%`,
                        top: `${highlight.y * 100}%`,
                        width: `${highlight.width * 100}%`,
                        height: `${highlight.height * 100}%`,
                        backgroundColor: `${highlight.color}66`,
                        mixBlendMode: "multiply",
                        borderColor:
                          selectedHighlightId === highlight.id
                            ? highlight.color
                            : "transparent",
                        boxShadow:
                          selectedHighlightId === highlight.id
                            ? "0 0 0 2px var(--ring)"
                            : undefined,
                      }}
                      aria-label="Move highlight annotation"
                      onClick={() => {
                        setSelectedHighlightId(highlight.id)
                        setSelectedNoteId(null)
                        setHighlightColor(highlight.color)
                      }}
                      onMouseDown={(event) => {
                        event.stopPropagation()
                        setSelectedHighlightId(highlight.id)
                        setSelectedNoteId(null)
                        setHighlightColor(highlight.color)
                        startDrag({
                          event,
                          kind: "highlight",
                          id: highlight.id,
                          x: highlight.x,
                          y: highlight.y,
                        })
                      }}
                    />
                  ))}
                {notes
                  .filter((note) => note.pageNumber === render.pageNumber)
                  .map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className="absolute cursor-move bg-transparent px-2 py-1 text-left transition-shadow"
                      draggable={false}
                      style={{
                        left: `${note.x * 100}%`,
                        top: `${note.y * 100}%`,
                        color: note.color,
                        fontSize: note.fontSize,
                        boxShadow:
                          selectedNoteId === note.id
                            ? "0 0 0 2px var(--ring)"
                            : undefined,
                      }}
                      aria-label="Move note annotation"
                      onClick={() => {
                        setSelectedNoteId(note.id)
                        setSelectedHighlightId(null)
                      }}
                      onMouseDown={(event) => {
                        event.stopPropagation()
                        setSelectedNoteId(note.id)
                        setSelectedHighlightId(null)
                        startDrag({
                          event,
                          kind: "note",
                          id: note.id,
                          x: note.x,
                          y: note.y,
                        })
                      }}
                    >
                      {note.text || "Note"}
                    </button>
                  ))}
              </div>
            )}
          </PdfPreviewCanvas>
        </>
      ) : null}
      <ProcessingState isProcessing={isProcessing} error={error} />
      <DownloadResultCard result={result} />
    </section>
  )
}
