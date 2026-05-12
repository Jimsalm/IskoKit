import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export function ProcessingState({
  isProcessing,
  error,
}: {
  isProcessing: boolean
  error: string
}) {
  return (
    <>
      {isProcessing ? (
        <Alert>
          <LoaderCircleIcon className="animate-spin" />
          <AlertTitle>Processing files</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>Keep this tab open while IskoKit prepares your output.</span>
            <Progress value={70} />
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Could not process files</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </>
  )
}
