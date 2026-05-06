"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"

import {
  flashcardMutationError,
  getFlashcardNoteSourceContent,
  getFlashcardSummarySourceContent,
} from "@/features/flashcards/api"
import { FlashcardGenerator } from "@/features/flashcards/components/flashcard-generator"
import { FlashcardPreviewList } from "@/features/flashcards/components/flashcard-preview-list"
import { generateFlashcardsRequestSchema } from "@/features/flashcards/schemas"
import {
  useCreateGeneratedFlashcards,
  useFlashcardNoteSources,
  useFlashcardSummarySources,
  useGenerateFlashcards,
} from "@/features/flashcards/hooks"
import type {
  FlashcardCount,
  FlashcardDifficulty,
  FlashcardGenerationSourceType,
  FlashcardPreview,
  FlashcardType,
} from "@/features/flashcards/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function createPreviewId(index: number) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`
}

function getZodMessage(error: {
  issues: Array<{
    message: string
  }>
}) {
  return error.issues[0]?.message ?? "Invalid flashcard request."
}

function toGeneratedFlashcard(flashcard: FlashcardPreview) {
  return {
    question: flashcard.question,
    answer: flashcard.answer,
    difficulty: flashcard.difficulty,
    type: flashcard.type,
  }
}

export function AiFlashcardDialog({
  deckId,
  open,
  onOpenChange,
}: {
  deckId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [sourceType, setSourceType] =
    useState<FlashcardGenerationSourceType>("manual_text")
  const [manualText, setManualText] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState("")
  const [selectedSummaryId, setSelectedSummaryId] = useState("")
  const [cardType, setCardType] = useState<FlashcardType>("qa")
  const [difficulty, setDifficulty] =
    useState<FlashcardDifficulty>("medium")
  const [count, setCount] = useState<FlashcardCount>(10)
  const [sourceError, setSourceError] = useState("")
  const [previewCards, setPreviewCards] = useState<FlashcardPreview[]>([])
  const dialogSessionRef = useRef(0)
  const notesQuery = useFlashcardNoteSources({ enabled: open })
  const summariesQuery = useFlashcardSummarySources({ enabled: open })
  const generateMutation = useGenerateFlashcards()
  const createMutation = useCreateGeneratedFlashcards(deckId)
  const notes = notesQuery.data ?? []
  const summaries = summariesQuery.data ?? []
  const sourceId =
    sourceType === "note"
      ? selectedNoteId || null
      : sourceType === "summary"
        ? selectedSummaryId || null
        : null

  function clearGeneratedPreview() {
    setPreviewCards([])
    setSourceError("")
  }

  function resetDialogState() {
    dialogSessionRef.current += 1
    setSourceType("manual_text")
    setManualText("")
    setSelectedNoteId("")
    setSelectedSummaryId("")
    setCardType("qa")
    setDifficulty("medium")
    setCount(10)
    setSourceError("")
    setPreviewCards([])
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialogState()
    }

    onOpenChange(nextOpen)
  }

  async function getSourceContent() {
    if (sourceType === "manual_text") {
      return manualText
    }

    if (sourceType === "note") {
      if (!selectedNoteId) {
        return ""
      }

      const source = await getFlashcardNoteSourceContent(selectedNoteId)

      return source.content
    }

    if (!selectedSummaryId) {
      return ""
    }

    const source = await getFlashcardSummarySourceContent(selectedSummaryId)

    return source.content
  }

  function handleSourceTypeChange(nextSourceType: FlashcardGenerationSourceType) {
    setSourceType(nextSourceType)
    clearGeneratedPreview()
  }

  async function handleGenerate() {
    const dialogSession = dialogSessionRef.current

    try {
      const content = await getSourceContent()

      if (dialogSession !== dialogSessionRef.current) {
        return
      }

      const payload = {
        sourceType,
        sourceId,
        content,
        cardType,
        difficulty,
        count,
      }
      const parsed = generateFlashcardsRequestSchema.safeParse(payload)

      if (!parsed.success) {
        setSourceError(getZodMessage(parsed.error))
        return
      }

      setSourceError("")

      const result = await generateMutation.mutateAsync(parsed.data)

      if (dialogSession !== dialogSessionRef.current) {
        return
      }

      setPreviewCards(
        result.flashcards.map((flashcard, index) => ({
          ...flashcard,
          previewId: createPreviewId(index),
        })),
      )
      toast.success("Flashcards generated.")
    } catch (error) {
      if (dialogSession !== dialogSessionRef.current) {
        return
      }

      setSourceError(flashcardMutationError(error))
    }
  }

  function handlePreviewCardChange(
    previewId: string,
    field: "question" | "answer",
    value: string,
  ) {
    setPreviewCards((current) =>
      current.map((flashcard) =>
        flashcard.previewId === previewId
          ? {
              ...flashcard,
              [field]: value,
            }
          : flashcard,
      ),
    )
  }

  function handlePreviewCardRemove(previewId: string) {
    setPreviewCards((current) =>
      current.filter((flashcard) => flashcard.previewId !== previewId),
    )
  }

  async function handleSavePreviewCards() {
    try {
      await createMutation.mutateAsync({
        deckId,
        sourceType,
        sourceId,
        flashcards: previewCards.map(toGeneratedFlashcard),
      })
      toast.success("Flashcards saved to deck.")
      handleOpenChange(false)
    } catch (error) {
      toast.error(flashcardMutationError(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[min(90vh,900px)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generate AI flashcards</DialogTitle>
          <DialogDescription>
            Generate cards for this deck, then edit or remove cards before
            saving.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FlashcardGenerator
            sourceType={sourceType}
            manualText={manualText}
            selectedNoteId={selectedNoteId}
            selectedSummaryId={selectedSummaryId}
            notes={notes}
            summaries={summaries}
            isNotesLoading={notesQuery.isPending}
            isSummariesLoading={summariesQuery.isPending}
            cardType={cardType}
            difficulty={difficulty}
            count={count}
            sourceError={sourceError}
            isGenerating={generateMutation.isPending}
            onSourceTypeChange={handleSourceTypeChange}
            onManualTextChange={(value) => {
              setManualText(value)
              clearGeneratedPreview()
            }}
            onNoteChange={(id) => {
              setSelectedNoteId(id)
              clearGeneratedPreview()
            }}
            onSummaryChange={(id) => {
              setSelectedSummaryId(id)
              clearGeneratedPreview()
            }}
            onCardTypeChange={setCardType}
            onDifficultyChange={setDifficulty}
            onCountChange={setCount}
            onGenerate={() => void handleGenerate()}
          />

          <FlashcardPreviewList
            flashcards={previewCards}
            isSaving={createMutation.isPending}
            onFlashcardChange={handlePreviewCardChange}
            onRemove={handlePreviewCardRemove}
            onSave={() => void handleSavePreviewCards()}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
