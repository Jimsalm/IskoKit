"use client"

import { CalculatorIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function GwaEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalculatorIcon />
        </EmptyMedia>
        <EmptyTitle>No saved GWA records</EmptyTitle>
        <EmptyDescription>
          Calculate and save a semester record to build your GWA history.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onCreate}>
          <CalculatorIcon data-icon="inline-start" />
          Calculate GWA
        </Button>
      </EmptyContent>
    </Empty>
  )
}
