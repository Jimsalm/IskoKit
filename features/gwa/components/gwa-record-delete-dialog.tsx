"use client"

import { LoaderCircleIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { GwaRecordSummary } from "@/features/gwa/types"

export function GwaRecordDeleteDialog({
  record,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  record: GwaRecordSummary | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}) {
  return (
    <AlertDialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete GWA record?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the {record?.semester}{" "}
            {record?.schoolYear} record and its subject breakdown.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
          >
            {isDeleting ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            Delete record
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
