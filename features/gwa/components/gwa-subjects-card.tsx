"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { numericGwaGrades } from "@/features/gwa/types"
import type {
  GwaGrade,
  GwaSubjectDraft,
  GwaSubjectDraftErrors,
} from "@/features/gwa/types"

export function GwaSubjectsCard({
  semester,
  schoolYear,
  subjects,
  subjectErrors,
  semesterError,
  schoolYearError,
  isDisabled,
  onSemesterChange,
  onSchoolYearChange,
  onSubjectChange,
  onAddSubject,
  onRemoveSubject,
}: {
  semester: string
  schoolYear: string
  subjects: GwaSubjectDraft[]
  subjectErrors: Record<string, GwaSubjectDraftErrors>
  semesterError?: string
  schoolYearError?: string
  isDisabled: boolean
  onSemesterChange: (value: string) => void
  onSchoolYearChange: (value: string) => void
  onSubjectChange: (
    rowId: string,
    field: keyof Omit<GwaSubjectDraft, "rowId">,
    value: string,
  ) => void
  onAddSubject: () => void
  onRemoveSubject: (rowId: string) => void
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Semester details</CardTitle>
        <CardDescription>
          Add the term, school year, and subjects to calculate your GWA.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(semesterError)}>
              <FieldLabel htmlFor="gwa-semester">Semester</FieldLabel>
              <Input
                id="gwa-semester"
                value={semester}
                placeholder="1st Semester"
                disabled={isDisabled}
                aria-invalid={Boolean(semesterError)}
                onChange={(event) => onSemesterChange(event.target.value)}
              />
              <FieldError>{semesterError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(schoolYearError)}>
              <FieldLabel htmlFor="gwa-school-year">School year</FieldLabel>
              <Input
                id="gwa-school-year"
                value={schoolYear}
                placeholder="2025-2026"
                disabled={isDisabled}
                aria-invalid={Boolean(schoolYearError)}
                onChange={(event) => onSchoolYearChange(event.target.value)}
              />
              <FieldError>{schoolYearError}</FieldError>
            </Field>
          </div>
        </FieldGroup>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-medium">Subjects</h2>
              <p className="text-sm text-muted-foreground">
                Numeric grades are included in the GWA calculation.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isDisabled}
              onClick={onAddSubject}
            >
              <PlusIcon data-icon="inline-start" />
              Add subject
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {subjects.map((subject, index) => {
              const errors = subjectErrors[subject.rowId] ?? {}

              return (
                <div
                  key={subject.rowId}
                  className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
                >
                  <Field data-invalid={Boolean(errors.subjectName)}>
                    <FieldLabel htmlFor={`${subject.rowId}-name`}>
                      Subject name
                    </FieldLabel>
                    <Input
                      id={`${subject.rowId}-name`}
                      value={subject.subjectName}
                      placeholder={`Subject ${index + 1}`}
                      disabled={isDisabled}
                      aria-invalid={Boolean(errors.subjectName)}
                      onChange={(event) =>
                        onSubjectChange(
                          subject.rowId,
                          "subjectName",
                          event.target.value,
                        )
                      }
                    />
                    <FieldError>{errors.subjectName}</FieldError>
                  </Field>

                  <Field data-invalid={Boolean(errors.subjectCode)}>
                    <FieldLabel htmlFor={`${subject.rowId}-code`}>
                      Code
                    </FieldLabel>
                    <Input
                      id={`${subject.rowId}-code`}
                      value={subject.subjectCode}
                      placeholder="Optional"
                      disabled={isDisabled}
                      aria-invalid={Boolean(errors.subjectCode)}
                      onChange={(event) =>
                        onSubjectChange(
                          subject.rowId,
                          "subjectCode",
                          event.target.value,
                        )
                      }
                    />
                    <FieldError>{errors.subjectCode}</FieldError>
                  </Field>

                  <Field data-invalid={Boolean(errors.units)}>
                    <FieldLabel htmlFor={`${subject.rowId}-units`}>
                      Units
                    </FieldLabel>
                    <Input
                      id={`${subject.rowId}-units`}
                      type="number"
                      min="0"
                      step="0.25"
                      inputMode="decimal"
                      value={subject.units}
                      disabled={isDisabled}
                      aria-invalid={Boolean(errors.units)}
                      onChange={(event) =>
                        onSubjectChange(
                          subject.rowId,
                          "units",
                          event.target.value,
                        )
                      }
                    />
                    <FieldError>{errors.units}</FieldError>
                  </Field>

                  <Field data-invalid={Boolean(errors.grade)}>
                    <FieldLabel htmlFor={`${subject.rowId}-grade`}>
                      Grade
                    </FieldLabel>
                    <Select
                      value={subject.grade}
                      disabled={isDisabled}
                      onValueChange={(grade) =>
                        onSubjectChange(
                          subject.rowId,
                          "grade",
                          grade as GwaGrade,
                        )
                      }
                    >
                      <SelectTrigger
                        id={`${subject.rowId}-grade`}
                        className="w-full"
                        aria-invalid={Boolean(errors.grade)}
                      >
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Numeric grades</SelectLabel>
                          {numericGwaGrades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError>{errors.grade}</FieldError>
                  </Field>

                  <div className="flex items-end sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isDisabled || subjects.length === 1}
                      aria-label={`Remove subject ${index + 1}`}
                      onClick={() => onRemoveSubject(subject.rowId)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
