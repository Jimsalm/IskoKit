"use client"

import { useMemo, useState } from "react"
import {
  CalculatorIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react"
import { toast } from "sonner"
import { ZodError } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { gwaMutationError } from "@/features/gwa/api"
import { GwaHistorySection } from "@/features/gwa/components/gwa-history-section"
import { GwaRecordDeleteDialog } from "@/features/gwa/components/gwa-record-delete-dialog"
import { GwaRecordDetailsDialog } from "@/features/gwa/components/gwa-record-details-dialog"
import { GwaResultCard } from "@/features/gwa/components/gwa-result-card"
import { GwaSubjectsCard } from "@/features/gwa/components/gwa-subjects-card"
import {
  useCreateGwaRecord,
  useDeleteGwaRecord,
  useGwaRecords,
  useUpdateGwaRecord,
} from "@/features/gwa/hooks"
import {
  calculateGwa,
  getGwaRemarks,
  isNumericGwaGrade,
} from "@/features/gwa/lib/calculate"
import { gwaCalculationSchema } from "@/features/gwa/schemas"
import type {
  GwaCalculationResult,
  GwaRecord,
  GwaSubjectDraft,
  GwaSubjectDraftErrors,
  SaveGwaRecordValues,
} from "@/features/gwa/types"

type GwaFormErrors = {
  semester?: string
  schoolYear?: string
  form?: string
  subjects: Record<string, GwaSubjectDraftErrors>
}

const emptyErrors: GwaFormErrors = {
  subjects: {},
}

function getDefaultSchoolYear() {
  const now = new Date()
  const year = now.getFullYear()
  const startYear = now.getMonth() >= 5 ? year : year - 1

  return `${startYear}-${startYear + 1}`
}

function createSubjectDraft(
  values: Partial<Omit<GwaSubjectDraft, "rowId">> = {},
  rowId?: string,
): GwaSubjectDraft {
  return {
    rowId:
      rowId ??
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random()}`,
    subjectName: values.subjectName ?? "",
    subjectCode: values.subjectCode ?? "",
    units: values.units ?? "",
    grade: values.grade ?? "",
  }
}

function getDefaultSubjects() {
  return [createSubjectDraft({}, "subject-1")]
}

function getSubjectDraftsFromRecord(record: GwaRecord) {
  if (!record.subjects.length) {
    return getDefaultSubjects()
  }

  return record.subjects.map((subject, index) =>
    createSubjectDraft(
      {
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode ?? "",
        units: String(subject.units),
        grade: subject.grade,
      },
      `record-${subject.id}-${index}`,
    ),
  )
}

function getResultFromRecord(record: GwaRecord): GwaCalculationResult {
  return {
    semester: record.semester,
    schoolYear: record.schoolYear,
    gwa: record.gwa,
    totalUnits: record.totalUnits,
    totalSubjects: record.totalSubjects,
    remarks: getGwaRemarks(record.gwa),
    subjects: record.subjects.map((subject) => {
      const isIncluded = subject.isIncluded && isNumericGwaGrade(subject.grade)

      return {
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode ?? undefined,
        units: subject.units,
        grade: subject.grade,
        isIncluded: subject.isIncluded,
        weightedGrade: isIncluded ? Number(subject.grade) * subject.units : null,
      }
    }),
  }
}

function getCalculationPayload({
  semester,
  schoolYear,
  subjects,
}: {
  semester: string
  schoolYear: string
  subjects: GwaSubjectDraft[]
}) {
  return {
    semester,
    schoolYear,
    subjects: subjects.map((subject) => ({
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      units: subject.units,
      grade: subject.grade,
    })),
  }
}

function getSavePayload(result: GwaCalculationResult): SaveGwaRecordValues {
  return {
    semester: result.semester,
    schoolYear: result.schoolYear,
    gwa: result.gwa,
    totalUnits: result.totalUnits,
    totalSubjects: result.totalSubjects,
    subjects: result.subjects.map((subject) => ({
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      units: subject.units,
      grade: subject.grade,
      isIncluded: subject.isIncluded,
    })),
  }
}

function getValidationErrors(
  error: ZodError,
  subjects: GwaSubjectDraft[],
): GwaFormErrors {
  const nextErrors: GwaFormErrors = {
    subjects: {},
  }

  error.issues.forEach((issue) => {
    const [field, index, childField] = issue.path

    if (field === "semester") {
      nextErrors.semester = issue.message
      return
    }

    if (field === "schoolYear") {
      nextErrors.schoolYear = issue.message
      return
    }

    if (field === "subjects" && typeof index === "number") {
      const subject = subjects[index]

      if (subject && typeof childField === "string") {
        nextErrors.subjects[subject.rowId] = {
          ...nextErrors.subjects[subject.rowId],
          [childField]: issue.message,
        }
      }
      return
    }

    nextErrors.form = issue.message
  })

  return nextErrors
}

export function GwaCalculatorPageClient() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [semester, setSemester] = useState("1st Semester")
  const [schoolYear, setSchoolYear] = useState(getDefaultSchoolYear)
  const [subjects, setSubjects] = useState(getDefaultSubjects)
  const [errors, setErrors] = useState<GwaFormErrors>(emptyErrors)
  const [result, setResult] = useState<GwaCalculationResult | null>(null)
  const [editingRecord, setEditingRecord] = useState<GwaRecord | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<GwaRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<GwaRecord | null>(null)
  const recordsQuery = useGwaRecords()
  const createMutation = useCreateGwaRecord()
  const updateMutation = useUpdateGwaRecord()
  const deleteMutation = useDeleteGwaRecord()
  const records = useMemo(() => recordsQuery.data ?? [], [recordsQuery.data])
  const isSaving = createMutation.isPending || updateMutation.isPending
  const calculatorTitle = editingRecord
    ? "Edit GWA record"
    : "New GWA calculation"
  const calculatorDescription = editingRecord
    ? "Fix the details, recalculate, then update this saved record."
    : "Add subjects, calculate your GWA, then save the semester record."

  function clearResult() {
    setResult(null)
  }

  function resetCalculator() {
    setSemester("1st Semester")
    setSchoolYear(getDefaultSchoolYear())
    setSubjects(getDefaultSubjects())
    setErrors(emptyErrors)
    setResult(null)
  }

  function openCreateCalculator() {
    setEditingRecord(null)
    resetCalculator()
    setIsCalculatorOpen(true)
  }

  function openEditCalculator(record: GwaRecord) {
    setEditingRecord(record)
    setSemester(record.semester)
    setSchoolYear(record.schoolYear)
    setSubjects(getSubjectDraftsFromRecord(record))
    setErrors(emptyErrors)
    setResult(getResultFromRecord(record))
    setIsCalculatorOpen(true)
  }

  function handleCalculatorOpenChange(open: boolean) {
    setIsCalculatorOpen(open)

    if (!open) {
      setEditingRecord(null)
      resetCalculator()
    }
  }

  function handleSemesterChange(value: string) {
    setSemester(value)
    clearResult()
  }

  function handleSchoolYearChange(value: string) {
    setSchoolYear(value)
    clearResult()
  }

  function handleSubjectChange(
    rowId: string,
    field: keyof Omit<GwaSubjectDraft, "rowId">,
    value: string,
  ) {
    setSubjects((current) =>
      current.map((subject) =>
        subject.rowId === rowId ? { ...subject, [field]: value } : subject,
      ),
    )
    clearResult()
  }

  function handleAddSubject() {
    setSubjects((current) => [...current, createSubjectDraft()])
    clearResult()
  }

  function handleRemoveSubject(rowId: string) {
    setSubjects((current) =>
      current.length === 1
        ? current
        : current.filter((subject) => subject.rowId !== rowId),
    )
    setErrors((current) => {
      const nextSubjectErrors = { ...current.subjects }

      delete nextSubjectErrors[rowId]

      return {
        ...current,
        subjects: nextSubjectErrors,
      }
    })
    clearResult()
  }

  function handleClearAll() {
    resetCalculator()
  }

  function handleCalculate() {
    const payload = getCalculationPayload({
      semester,
      schoolYear,
      subjects,
    })
    const parsed = gwaCalculationSchema.safeParse(payload)

    if (!parsed.success) {
      setErrors(getValidationErrors(parsed.error, subjects))
      toast.error("Check the highlighted fields.")
      return
    }

    try {
      const nextResult = calculateGwa(parsed.data)

      setErrors(emptyErrors)
      setResult(nextResult)
      toast.success("GWA calculated.")
    } catch (error) {
      setErrors({
        subjects: {},
        form:
          error instanceof Error
            ? error.message
            : "Could not calculate GWA. Please try again.",
      })
    }
  }

  async function handleSaveRecord() {
    if (!result) {
      toast.error("Calculate GWA before saving.")
      return
    }

    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({
          id: editingRecord.id,
          values: getSavePayload(result),
        })
        toast.success("GWA record updated.")
      } else {
        await createMutation.mutateAsync(getSavePayload(result))
        toast.success("GWA record saved.")
      }

      handleCalculatorOpenChange(false)
    } catch (error) {
      toast.error(gwaMutationError(error))
    }
  }

  async function handleDeleteRecord() {
    if (!deletingRecord) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deletingRecord.id)
      toast.success("GWA record deleted.")
      setDeletingRecord(null)
    } catch (error) {
      toast.error(gwaMutationError(error))
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Planning</p>
          <h1 className="text-2xl font-semibold">GWA Calculator</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Calculate and save your semester General Weighted Average.
          </p>
        </div>
        <Button type="button" onClick={openCreateCalculator}>
          <CalculatorIcon data-icon="inline-start" />
          Calculate GWA
        </Button>
      </div>

      <GwaHistorySection
        records={records}
        isLoading={recordsQuery.isPending}
        isError={recordsQuery.isError}
        errorMessage={gwaMutationError(recordsQuery.error)}
        onRetry={() => void recordsQuery.refetch()}
        onCreate={openCreateCalculator}
        onView={setSelectedRecord}
        onEdit={openEditCalculator}
        onDelete={setDeletingRecord}
      />

      <Dialog open={isCalculatorOpen} onOpenChange={handleCalculatorOpenChange}>
        <DialogContent className="grid max-h-[min(86vh,760px)] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{calculatorTitle}</DialogTitle>
            <DialogDescription>{calculatorDescription}</DialogDescription>
          </DialogHeader>

          <DialogBody>
            <GwaSubjectsCard
              semester={semester}
              schoolYear={schoolYear}
              subjects={subjects}
              subjectErrors={errors.subjects}
              semesterError={errors.semester}
              schoolYearError={errors.schoolYear}
              isDisabled={isSaving}
              onSemesterChange={handleSemesterChange}
              onSchoolYearChange={handleSchoolYearChange}
              onSubjectChange={handleSubjectChange}
              onAddSubject={handleAddSubject}
              onRemoveSubject={handleRemoveSubject}
            />

            {errors.form ? (
              <Alert variant="destructive">
                <AlertTitle>Could not calculate GWA</AlertTitle>
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            ) : null}

            <GwaResultCard result={result} />
          </DialogBody>

          <DialogFooter className="flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={handleClearAll}
            >
              <RotateCcwIcon data-icon="inline-start" />
              Clear All
            </Button>
            <Button type="button" disabled={isSaving} onClick={handleCalculate}>
              <CalculatorIcon data-icon="inline-start" />
              Calculate GWA
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!result || isSaving}
              onClick={() => void handleSaveRecord()}
            >
              {isSaving ? (
                <LoaderCircleIcon
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <SaveIcon data-icon="inline-start" />
              )}
              {editingRecord ? "Update Record" : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GwaRecordDetailsDialog
        record={selectedRecord}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecord(null)
          }
        }}
      />

      <GwaRecordDeleteDialog
        record={deletingRecord}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingRecord(null)
          }
        }}
        onConfirm={handleDeleteRecord}
      />
    </section>
  )
}
