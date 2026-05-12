"use client"

import { useMemo, useRef, useState } from "react"
import {
  BookOpenTextIcon,
  ClipboardIcon,
  ListChecksIcon,
  LoaderCircleIcon,
  NotebookPenIcon,
  PlusIcon,
  SparkleIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UploadIcon,
  ZapIcon,
} from "lucide-react"
import { toast } from "sonner"

import { summaryMutationError } from "@/features/ai-summarizer/api"
import { SummaryDeleteDialog } from "@/features/ai-summarizer/components/summary-delete-dialog"
import { SummaryHistory } from "@/features/ai-summarizer/components/summary-history"
import {
  maxSourceTextLength,
  sourceTextPreviewLength,
} from "@/features/ai-summarizer/schemas"
import {
  useCreateSummary,
  useDeleteSummary,
  useExtractTextFromFile,
  useGenerateSummary,
  useSaveSummaryAsNote,
  useSummaries,
} from "@/features/ai-summarizer/hooks"
import {
  formatFileSize,
  validateSummaryFile,
} from "@/features/ai-summarizer/lib/file-validation"
import type {
  CreateSummaryValues,
  Summary,
  SummaryInputType,
  SummaryType,
} from "@/features/ai-summarizer/types"
import { parseTagsText } from "@/features/notes/schemas"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function getDefaultTitle(text: string, fileName?: string) {
  if (fileName) {
    return fileName.replace(/\.[^/.]+$/, "").slice(0, 120)
  }

  const firstLine = text
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean)

  return firstLine ? firstLine.slice(0, 120) : "Study summary"
}

function getGeneratedSummaryValues({
  title,
  inputType,
  summaryType,
  summary,
  sourceText,
}: {
  title: string
  inputType: SummaryInputType
  summaryType: SummaryType
  summary: string
  sourceText: string
}): CreateSummaryValues {
  return {
    title: title.trim() || "Study summary",
    inputType,
    summaryType,
    content: summary,
    sourceTextPreview: sourceText.trim().slice(0, sourceTextPreviewLength),
    fileId: null,
  }
}

const analysisModes: Array<{
  value: SummaryType
  label: string
  description: string
  Icon: typeof ZapIcon
}> = [
  {
    value: "quick_summary",
    label: "Quick Summary",
    description: "Fast extraction of core concepts.",
    Icon: ZapIcon,
  },
  {
    value: "exam_reviewer",
    label: "Exam Reviewer",
    description: "Structured notes for quiz prep.",
    Icon: BookOpenTextIcon,
  },
  {
    value: "key_points",
    label: "Key Points",
    description: "Actionable bullet points only.",
    Icon: ListChecksIcon,
  },
]

export function AiSummarizerPageClient() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputType, setInputType] = useState<SummaryInputType>("pasted_text")
  const [sourceText, setSourceText] = useState("")
  const [summaryType, setSummaryType] = useState<SummaryType>("quick_summary")
  const [summaryTitle, setSummaryTitle] = useState("Study summary")
  const [generatedSummary, setGeneratedSummary] = useState("")
  const [savedSummaryId, setSavedSummaryId] = useState<string | null>(null)
  const [selectedFileLabel, setSelectedFileLabel] = useState("")
  const [sourceError, setSourceError] = useState("")
  const [noteSubject, setNoteSubject] = useState("")
  const [noteTagsText, setNoteTagsText] = useState("")
  const [isSourceDirty, setIsSourceDirty] = useState(false)
  const [showAllSummaries, setShowAllSummaries] = useState(false)
  const [deletingSummary, setDeletingSummary] = useState<Summary | null>(null)
  const summariesQuery = useSummaries()
  const extractMutation = useExtractTextFromFile()
  const generateMutation = useGenerateSummary()
  const createSummaryMutation = useCreateSummary()
  const deleteSummaryMutation = useDeleteSummary()
  const saveAsNoteMutation = useSaveSummaryAsNote()
  const sourceTextLength = sourceText.trim().length
  const hasGeneratedSummary = Boolean(generatedSummary)
  const isBusy = extractMutation.isPending || generateMutation.isPending
  const canGenerate = sourceTextLength > 0 && !isBusy
  const summaryValues = useMemo(
    () =>
      getGeneratedSummaryValues({
        title: summaryTitle,
        inputType,
        summaryType,
        summary: generatedSummary,
        sourceText,
      }),
    [generatedSummary, inputType, sourceText, summaryTitle, summaryType],
  )

  function clearGeneratedSummary() {
    setGeneratedSummary("")
    setSavedSummaryId(null)
    setIsSourceDirty(false)
  }

  function handleNewSummary() {
    setInputType("pasted_text")
    setSourceText("")
    setSummaryType("quick_summary")
    setSummaryTitle("Study summary")
    setGeneratedSummary("")
    setSavedSummaryId(null)
    setSelectedFileLabel("")
    setSourceError("")
    setNoteSubject("")
    setNoteTagsText("")
    setIsSourceDirty(false)
  }

  function handleSourceTextChange(
    value: string,
    {
      shouldClearSummary = false,
      shouldMarkDirty = false,
    }: {
      shouldClearSummary?: boolean
      shouldMarkDirty?: boolean
    } = {},
  ) {
    setSourceText(value)
    setSourceError("")

    if (shouldClearSummary) {
      clearGeneratedSummary()
    } else if (shouldMarkDirty) {
      setSavedSummaryId(null)
      setIsSourceDirty(true)
    } else {
      setSavedSummaryId(null)
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setInputType("uploaded_file")
    setSourceError("")
    clearGeneratedSummary()

    const validationError = validateSummaryFile(file)

    if (validationError) {
      setSourceError(validationError)
      return
    }

    setSelectedFileLabel(`${file.name} (${formatFileSize(file.size)})`)

    try {
      const result = await extractMutation.mutateAsync(file)

      setSourceText(result.text)
      setSummaryTitle(getDefaultTitle(result.text, result.fileName))
      toast.success("Text extracted.")
    } catch (error) {
      setSourceText("")
      setSourceError(summaryMutationError(error))
    }
  }

  async function handlePasteFromClipboard() {
    setInputType("pasted_text")
    setSelectedFileLabel("")
    setSourceError("")

    try {
      const text = await navigator.clipboard.readText()

      if (!text.trim()) {
        toast.error("Clipboard is empty.")
        return
      }

      handleSourceTextChange(text, {
        shouldMarkDirty: hasGeneratedSummary,
      })
      setSummaryTitle(getDefaultTitle(text))
    } catch {
      toast.error("Could not read from clipboard. Paste manually instead.")
    }
  }

  async function handleGenerate() {
    const content = sourceText.trim()

    if (!content) {
      setSourceError("Add source material first.")
      return
    }

    if (content.length > maxSourceTextLength) {
      setSourceError("Keep the source material under 30,000 characters.")
      return
    }

    setSourceError("")

    try {
      const result = await generateMutation.mutateAsync({
        inputType,
        content,
        summaryType,
      })
      const nextTitle =
        summaryTitle.trim() && summaryTitle !== "Study summary"
          ? summaryTitle
          : getDefaultTitle(content)

      setGeneratedSummary(result.summary)
      setSummaryTitle(nextTitle)
      setSavedSummaryId(null)
      setIsSourceDirty(false)
      toast.success("Summary generated.")
    } catch (error) {
      toast.error(summaryMutationError(error))
    }
  }

  async function handleCopy() {
    if (!generatedSummary) {
      return
    }

    try {
      await navigator.clipboard.writeText(generatedSummary)
      toast.success("Summary copied.")
    } catch {
      toast.error("Could not copy the summary.")
    }
  }

  async function ensureSummarySaved() {
    if (savedSummaryId) {
      return
    }

    const savedSummary = await createSummaryMutation.mutateAsync(summaryValues)
    setSavedSummaryId(savedSummary.id)
  }

  async function handleSaveToNotes() {
    if (!generatedSummary) {
      return
    }

    try {
      await ensureSummarySaved()
      await saveAsNoteMutation.mutateAsync({
        summary: summaryValues,
        subject: noteSubject.trim() || undefined,
        tags: parseTagsText(noteTagsText),
      })
      toast.success("Saved to Notes.")
    } catch (error) {
      toast.error(summaryMutationError(error))
    }
  }

  async function handleDeleteSummary() {
    if (!deletingSummary) {
      return
    }

    try {
      await deleteSummaryMutation.mutateAsync(deletingSummary.id)
      toast.success("Summary deleted.")
      setDeletingSummary(null)
    } catch (error) {
      toast.error(summaryMutationError(error))
    }
  }

  function handleUseSavedSummary(summary: Summary) {
    setInputType(summary.inputType)
    setSummaryType(summary.summaryType)
    setSummaryTitle(summary.title)
    setGeneratedSummary(summary.content)
    setSavedSummaryId(summary.id)
    setSourceText(summary.sourceTextPreview ?? "")
    setSourceError("")
    setIsSourceDirty(false)
    toast.success("Summary loaded.")
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 font-[var(--font-manrope)] lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-normal">
            AI Summarizer
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Turn readings, handouts, and class materials into study notes.
          </p>
        </div>

        <Card className="rounded-2xl border-border/70 bg-card/75 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Source Material
            </CardTitle>
            <CardAction>
              <Badge variant="secondary" className="font-normal">
                {sourceTextLength.toLocaleString()} /{" "}
                {maxSourceTextLength.toLocaleString()} chars
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="source-text" className="sr-only">
                  Source material
                </FieldLabel>
                <div className="relative">
                  <Textarea
                    id="source-text"
                    value={sourceText}
                    placeholder="Paste your text, URL, or raw transcript here..."
                    className="min-h-[20rem] resize-none rounded-lg border-border/70 bg-background/40 pb-16 leading-6"
                    disabled={extractMutation.isPending}
                    onChange={(event) =>
                      handleSourceTextChange(event.target.value, {
                        shouldClearSummary: false,
                        shouldMarkDirty: hasGeneratedSummary,
                      })
                    }
                  />
                  <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void handlePasteFromClipboard()}
                    >
                      <ClipboardIcon data-icon="inline-start" />
                      Paste
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={extractMutation.isPending}
                      onClick={() => {
                        setInputType("uploaded_file")
                        setSourceError("")
                        fileInputRef.current?.click()
                      }}
                    >
                      {extractMutation.isPending ? (
                        <LoaderCircleIcon
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                      ) : (
                        <UploadIcon data-icon="inline-start" />
                      )}
                      Upload
                    </Button>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    disabled={extractMutation.isPending}
                    onChange={handleFileChange}
                  />
                </div>
                <FieldDescription>
                  {selectedFileLabel
                    ? `Uploaded: ${selectedFileLabel}`
                    : "Supports TXT, DOCX, or text-based PDF up to 5 MB."}
                </FieldDescription>
              </Field>

              {sourceError ? (
                <Alert variant="destructive">
                  <TriangleAlertIcon />
                  <AlertTitle>Could not prepare material</AlertTitle>
                  <AlertDescription>{sourceError}</AlertDescription>
                </Alert>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Analysis Mode
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {analysisModes.map(({ Icon, ...mode }) => (
              <button
                key={mode.value}
                type="button"
                aria-pressed={summaryType === mode.value}
                className={cn(
                  "flex min-h-28 flex-col gap-2 rounded-lg border border-border/70 bg-card/65 p-4 text-left transition-all hover:border-primary/40 hover:bg-card/90",
                  summaryType === mode.value &&
                    "border-primary/60 bg-primary/10 text-primary ring-1 ring-primary/25",
                )}
                onClick={() => setSummaryType(mode.value)}
              >
                <Icon className="size-5" />
                <span className="text-sm font-semibold">{mode.label}</span>
                <span className="text-xs leading-5 text-muted-foreground">
                  {mode.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full shadow-lg shadow-primary/15 sm:w-fit"
          disabled={!canGenerate || hasGeneratedSummary}
          onClick={() => void handleGenerate()}
        >
          {isBusy ? (
            <LoaderCircleIcon
              data-icon="inline-start"
              className="animate-spin"
            />
          ) : (
            <SparklesIcon data-icon="inline-start" />
          )}
          Generate Summary
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
        <Card className="rounded-2xl border-border/70 bg-card/75 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Output Preview
            </CardTitle>
            {hasGeneratedSummary ? (
              <CardAction>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    isBusy ||
                    createSummaryMutation.isPending ||
                    saveAsNoteMutation.isPending
                  }
                  onClick={handleNewSummary}
                >
                  <PlusIcon data-icon="inline-start" />
                  Start new summary
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {hasGeneratedSummary ? (
              <>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="summary-title">Title</FieldLabel>
                    <Input
                      id="summary-title"
                      value={summaryTitle}
                      onChange={(event) => {
                        setSummaryTitle(event.target.value)
                        setSavedSummaryId(null)
                      }}
                    />
                  </Field>
                </FieldGroup>

                {isSourceDirty ? (
                  <Alert>
                    <TriangleAlertIcon />
                    <AlertTitle>Source changed</AlertTitle>
                    <AlertDescription>
                      Generate again before saving this summary to Notes.
                    </AlertDescription>
                  </Alert>
                ) : null}

                <ScrollArea className="h-[28rem] rounded-lg border border-border/70 bg-background/40">
                  <div className="whitespace-pre-wrap p-4 text-sm leading-6">
                    {generatedSummary}
                  </div>
                </ScrollArea>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="note-subject">
                      Optional subject
                    </FieldLabel>
                    <Input
                      id="note-subject"
                      value={noteSubject}
                      placeholder="Biology"
                      onChange={(event) => setNoteSubject(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="note-tags">Tags</FieldLabel>
                    <Input
                      id="note-tags"
                      value={noteTagsText}
                      placeholder="exam, reviewer"
                      onChange={(event) => setNoteTagsText(event.target.value)}
                    />
                  </Field>
                </div>
              </>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/70 bg-background/30 p-8 text-center">
                <span className="grid size-11 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <SparkleIcon />
                </span>
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="text-sm font-medium">
                    Your generated summary will appear here.
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Add source material, choose an analysis mode, then generate.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          {hasGeneratedSummary ? (
            <CardFooter className="flex flex-wrap gap-2 border-border/70 bg-transparent">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleCopy()}
              >
                <ClipboardIcon data-icon="inline-start" />
                Copy
              </Button>
              <Button
                type="button"
                disabled={
                  isBusy ||
                  isSourceDirty ||
                  createSummaryMutation.isPending ||
                  saveAsNoteMutation.isPending
                }
                onClick={() => void handleSaveToNotes()}
              >
                {createSummaryMutation.isPending ||
                saveAsNoteMutation.isPending ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <NotebookPenIcon data-icon="inline-start" />
                )}
                Save
              </Button>
            </CardFooter>
          ) : null}
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/75 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Summaries
            </CardTitle>
            {(summariesQuery.data?.length ?? 0) > 3 ? (
              <CardAction>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSummaries(!showAllSummaries)}
                >
                  {showAllSummaries ? "Latest" : "View All"}
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            {summariesQuery.isError ? (
              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>Could not load summaries</AlertTitle>
                <AlertDescription>
                  {summaryMutationError(summariesQuery.error)}
                </AlertDescription>
              </Alert>
            ) : (
              <SummaryHistory
                summaries={summariesQuery.data ?? []}
                isLoading={summariesQuery.isPending}
                showAll={showAllSummaries}
                onUse={handleUseSavedSummary}
                onDelete={setDeletingSummary}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <SummaryDeleteDialog
        summary={deletingSummary}
        isDeleting={deleteSummaryMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSummary(null)
          }
        }}
        onConfirm={handleDeleteSummary}
      />
    </section>
  )
}
