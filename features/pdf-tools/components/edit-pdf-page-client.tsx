"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { FilePenIcon } from "lucide-react"
import { toast } from "sonner"

import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { DownloadResultCard } from "@/features/pdf-tools/components/download-result-card"
import { FileUploadArea } from "@/features/pdf-tools/components/file-upload-area"
import { PdfEditorToolbar } from "@/features/pdf-tools/components/pdf-editor-toolbar"
import { PdfPageNavigator } from "@/features/pdf-tools/components/pdf-page-navigator"
import { PdfPreviewCanvas } from "@/features/pdf-tools/components/pdf-preview-canvas"
import { ProcessingState } from "@/features/pdf-tools/components/processing-state"
import { SelectedFileList } from "@/features/pdf-tools/components/selected-file-list"
import { TextOverlayEditor } from "@/features/pdf-tools/components/text-overlay-editor"
import { ToolPageHeader } from "@/features/pdf-tools/components/tool-page-header"
import { useCreateFileActivity } from "@/features/pdf-tools/hooks"
import {
  getTotalFileSize,
  pdfExtensions,
  validateFileSelection,
} from "@/features/pdf-tools/lib/file-validation"
import { writeTextOverlaysToPdf } from "@/features/pdf-tools/lib/pdf-overlays"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type {
  PdfPageRender,
  PdfTextFontFamily,
  PdfTextOverlay,
  PdfToolResult,
} from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"

const tool = getPdfToolConfig("edit_pdf")

type TextSettings = {
  text: string
  fontFamily: PdfTextFontFamily
  fontSize: number
  color: string
  isBold: boolean
  isItalic: boolean
}

const defaultTextSettings: TextSettings = {
  text: "Text",
  fontFamily: "helvetica",
  fontSize: 18,
  color: "#000000",
  isBold: false,
  isItalic: false,
}

function createTextOverlay({
  pageNumber,
  position,
  settings,
}: {
  pageNumber: number
  position: { x: number; y: number }
  settings: TextSettings
}): PdfTextOverlay {
  return {
    id: crypto.randomUUID(),
    pageNumber,
    ...settings,
    text: settings.text.trim() || "Text",
    x: position.x,
    y: position.y,
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

function isPdfTextInput(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("[data-pdf-text-input]"))
  )
}

export function EditPdfPageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [overlays, setOverlays] = useState<PdfTextOverlay[]>([])
  const [textSettings, setTextSettings] =
    useState<TextSettings>(defaultTextSettings)
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const createActivityMutation = useCreateFileActivity()
  const selectedOverlay = useMemo(
    () => overlays.find((overlay) => overlay.id === selectedOverlayId) ?? null,
    [overlays, selectedOverlayId],
  )
  const handleRender = useCallback((render: PdfPageRender) => {
    setPageCount(render.pageCount)
  }, [])
  const activeTextSettings = selectedOverlay
    ? {
        text: selectedOverlay.text,
        fontFamily: selectedOverlay.fontFamily,
        fontSize: selectedOverlay.fontSize,
        color: selectedOverlay.color,
        isBold: selectedOverlay.isBold,
        isItalic: selectedOverlay.isItalic,
      }
    : textSettings

  function updateTextSettings(values: Partial<TextSettings>) {
    setResult(null)

    if (!selectedOverlayId) {
      setTextSettings((current) => ({ ...current, ...values }))
      return
    }

    setOverlays((current) =>
      current.map((overlay) =>
        overlay.id === selectedOverlayId ? { ...overlay, ...values } : overlay,
      ),
    )
  }

  const deleteSelectedOverlay = useCallback(() => {
    if (!selectedOverlayId) {
      return
    }

    setOverlays((current) =>
      current.filter((overlay) => overlay.id !== selectedOverlayId),
    )
    setSelectedOverlayId(null)
    setResult(null)
  }, [selectedOverlayId])

  const toggleSelectedTextStyle = useCallback(
    (style: "isBold" | "isItalic") => {
      if (!selectedOverlayId) {
        return
      }

      setResult(null)
      setOverlays((current) =>
        current.map((overlay) =>
          overlay.id === selectedOverlayId
            ? { ...overlay, [style]: !overlay[style] }
            : overlay,
        ),
      )
    },
    [selectedOverlayId],
  )

  function handlePlaceText(position: { x: number; y: number }) {
    const overlay = createTextOverlay({
      pageNumber,
      position,
      settings: {
        ...activeTextSettings,
        text: defaultTextSettings.text,
      },
    })

    setOverlays((current) => [...current, overlay])
    setSelectedOverlayId(overlay.id)
    setResult(null)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      const isShortcut = event.ctrlKey || event.metaKey

      if (
        selectedOverlayId &&
        isShortcut &&
        !event.altKey &&
        (key === "b" || key === "i") &&
        (!isEditableKeyboardTarget(event.target) ||
          isPdfTextInput(event.target))
      ) {
        event.preventDefault()
        toggleSelectedTextStyle(key === "b" ? "isBold" : "isItalic")
        return
      }

      if (
        !selectedOverlayId ||
        isEditableKeyboardTarget(event.target) ||
        (event.key !== "Backspace" && event.key !== "Delete")
      ) {
        return
      }

      event.preventDefault()
      deleteSelectedOverlay()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [deleteSelectedOverlay, selectedOverlayId, toggleSelectedTextStyle])

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
      const output = await writeTextOverlaysToPdf({
        file: files[0],
        overlays,
      })

      setResult(output)
      toast.success("Edited PDF ready.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "edit_pdf",
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
          setOverlays([])
          setTextSettings(defaultTextSettings)
          setSelectedOverlayId(null)
          setResult(null)
          setError("")
        }}
        onValidationError={setError}
      />
      <SelectedFileList
        files={files}
        onRemove={() => {
          setFiles([])
          setOverlays([])
          setTextSettings(defaultTextSettings)
          setResult(null)
        }}
        onClear={() => {
          setFiles([])
          setOverlays([])
          setTextSettings(defaultTextSettings)
          setResult(null)
          setError("")
        }}
      />
      {files[0] ? (
        <>
          <PdfEditorToolbar
            fontFamily={activeTextSettings.fontFamily}
            fontSize={activeTextSettings.fontSize}
            color={activeTextSettings.color}
            isBold={activeTextSettings.isBold}
            isItalic={activeTextSettings.isItalic}
            hasSelection={Boolean(selectedOverlay)}
            hasOverlays={overlays.length > 0}
            onFontFamilyChange={(fontFamily) =>
              updateTextSettings({ fontFamily })
            }
            onFontSizeChange={(fontSize) => updateTextSettings({ fontSize })}
            onColorChange={(color) => updateTextSettings({ color })}
            onStyleChange={(style) => updateTextSettings(style)}
            onDeleteSelected={deleteSelectedOverlay}
            onSave={handleSave}
          />
          <PdfPageNavigator
            pageNumber={pageNumber}
            pageCount={pageCount}
            onPageChange={(nextPage) => {
              setPageNumber(nextPage)
              setSelectedOverlayId(null)
            }}
          />
          <PdfPreviewCanvas
            file={files[0]}
            pageNumber={pageNumber}
            onRender={handleRender}
          >
            {(render) => (
              <TextOverlayEditor
                render={render}
                overlays={overlays}
                selectedOverlayId={selectedOverlayId}
                onPlace={handlePlaceText}
                onSelect={setSelectedOverlayId}
                onChange={(nextOverlays) => {
                  setOverlays(nextOverlays)
                  setResult(null)
                }}
              />
            )}
          </PdfPreviewCanvas>
        </>
      ) : (
        <Button type="button" disabled className="self-start">
          <FilePenIcon data-icon="inline-start" />
          Upload a PDF to edit
        </Button>
      )}
      <ProcessingState isProcessing={isProcessing} error={error} />
      <DownloadResultCard result={result} />
    </section>
  )
}
