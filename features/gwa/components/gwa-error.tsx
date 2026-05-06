"use client"

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function GwaError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>Could not load GWA history</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={onRetry}
        >
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}
