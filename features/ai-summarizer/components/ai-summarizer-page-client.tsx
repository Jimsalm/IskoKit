"use client"

import { useMemo, useState } from "react"
import {
  ClipboardIcon,
  FileTextIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"

import { summaryMutationError } from "@/features/ai-summarizer/api"
import { SummaryDeleteDialog } from "@/features/ai-summarizer/components/summary-delete-dialog"
import { SummaryHistory } from "@/features/ai-summarizer/components/summary-history"
import {
  maxSourceTextLength,
  sourceTextPreviewLength,
  summaryTypeLabels,
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
import { summaryTypes } from "@/features/ai-summarizer/types"
import { parseTagsText } from "@/features/notes/schemas"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

function getPreview(content: string) {
  const preview = content.replace(/\s+/g, " ").trim()

  return preview.length > 520 ? `${preview.slice(0, 520)}...` : preview
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

export function AiSummarizerPageClient() {
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
  const [isEditingSource, setIsEditingSource] = useState(false)
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
  const shouldShowRecentSummaries =
    hasGeneratedSummary ||
    summariesQuery.isPending ||
    Boolean(summariesQuery.data?.length)
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
    setIsEditingSource(false)
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
      setIsEditingSource(false)
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
    setIsEditingSource(false)
    setIsSourceDirty(false)
    toast.success("Summary loaded.")
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-normal">
            AI Summarizer
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Create study-ready notes from readings, handouts, and class
            materials.
          </p>
        </div>
        {hasGeneratedSummary ? (
          <Button
            type="button"
            variant="outline"
            disabled={
              isBusy ||
              createSummaryMutation.isPending ||
              saveAsNoteMutation.isPending
            }
            onClick={handleNewSummary}
          >
            <PlusIcon data-icon="inline-start" />
            New summary
          </Button>
        ) : null}
      </div>

      {!hasGeneratedSummary ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Source material</CardTitle>
            <CardDescription>
              Start with pasted text or a readable class file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Input source</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={inputType === "pasted_text" ? "secondary" : "outline"}
                    aria-pressed={inputType === "pasted_text"}
                    onClick={() => {
                      setInputType("pasted_text")
                      setSelectedFileLabel("")
                      setSourceError("")
                    }}
                  >
                    <ClipboardIcon data-icon="inline-start" />
                    Paste text
                  </Button>
                  <Button
                    type="button"
                    variant={
                      inputType === "uploaded_file" ? "secondary" : "outline"
                    }
                    aria-pressed={inputType === "uploaded_file"}
                    onClick={() => {
                      setInputType("uploaded_file")
                      setSourceError("")
                    }}
                  >
                    <UploadIcon data-icon="inline-start" />
                    Upload file
                  </Button>
                </div>
              </Field>

              {inputType === "uploaded_file" ? (
                <Field>
                  <FieldLabel htmlFor="summary-file">File</FieldLabel>
                  <Input
                    id="summary-file"
                    type="file"
                    accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={extractMutation.isPending}
                    onChange={handleFileChange}
                  />
                  <FieldDescription>
                    TXT, DOCX, or text-based PDF up to 5 MB.
                  </FieldDescription>
                  {selectedFileLabel ? (
                    <p className="text-sm text-muted-foreground">
                      {selectedFileLabel}
                    </p>
                  ) : null}
                </Field>
              ) : null}

              <Field>
                <FieldLabel htmlFor="source-text">Material</FieldLabel>
                <Textarea
                  id="source-text"
                  value={sourceText}
                  placeholder="Paste your study material here."
                  className="min-h-80"
                  disabled={extractMutation.isPending}
                  onChange={(event) =>
                    handleSourceTextChange(event.target.value, {
                      shouldClearSummary: true,
                    })
                  }
                />
                <FieldDescription>
                  {sourceTextLength.toLocaleString()} /{" "}
                  {maxSourceTextLength.toLocaleString()} characters
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="summary-type">Summary mode</FieldLabel>
                <Select
                  value={summaryType}
                  onValueChange={(value) =>
                    setSummaryType(value as SummaryType)
                  }
                >
                  <SelectTrigger id="summary-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {summaryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {summaryTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
          <CardFooter>
            <Button
              type="button"
              disabled={!canGenerate}
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
              Generate summary
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <CardTitle>Source material</CardTitle>
                <CardDescription>
                  Original material used for this summary.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingSource((current) => !current)}
                >
                  <PencilIcon data-icon="inline-start" />
                  {isEditingSource ? "Done editing" : "Edit source"}
                </Button>
                {isSourceDirty ? (
                  <Badge variant="secondary">Regenerate before saving</Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingSource ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="review-source-text">Material</FieldLabel>
                    <Textarea
                      id="review-source-text"
                      value={sourceText}
                      className="min-h-56"
                      onChange={(event) =>
                        handleSourceTextChange(event.target.value, {
                          shouldMarkDirty: true,
                        })
                      }
                    />
                    <FieldDescription>
                      {sourceTextLength.toLocaleString()} /{" "}
                      {maxSourceTextLength.toLocaleString()} characters
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
              ) : (
                <div className="line-clamp-3 rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                  {getPreview(sourceText) || "Saved source preview unavailable."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Generated summary</CardTitle>
              <CardDescription>
                {isSourceDirty
                  ? "Regenerate after editing the source before saving."
                  : "Review the result, then copy it or save it to Notes."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
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

              <div className="min-h-80 whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm leading-6">
                {generatedSummary}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium">Save details</h3>
                  <p className="text-sm text-muted-foreground">
                    Add optional organization before saving to Notes.
                  </p>
                </div>
                <FieldGroup>
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
                      placeholder="exam, reviewer, week 4"
                      onChange={(event) => setNoteTagsText(event.target.value)}
                    />
                    <FieldDescription>
                      Separate tags with commas.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
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
                variant={isSourceDirty ? "secondary" : "outline"}
                disabled={!canGenerate}
                onClick={() => void handleGenerate()}
              >
                {generateMutation.isPending ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <RotateCcwIcon data-icon="inline-start" />
                )}
                Regenerate
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
                  <FileTextIcon data-icon="inline-start" />
                )}
                Save to Notes
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {shouldShowRecentSummaries ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Recent summaries</h2>
              <p className="text-sm text-muted-foreground">
                Your latest saved study summaries.
              </p>
            </div>
            {summariesQuery.data?.length ? (
              <Badge variant="secondary">
                {summariesQuery.data.length}{" "}
                {summariesQuery.data.length === 1 ? "summary" : "summaries"}
              </Badge>
            ) : null}
          </div>

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
              onShowAllChange={setShowAllSummaries}
              onUse={handleUseSavedSummary}
              onDelete={setDeletingSummary}
            />
          )}
        </section>
      ) : null}

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
