"use client"

import { BoldIcon, ItalicIcon, SaveIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { PdfTextFontFamily } from "@/features/pdf-tools/types"

export function PdfEditorToolbar({
  fontFamily,
  fontSize,
  color,
  isBold,
  isItalic,
  hasSelection,
  hasOverlays,
  onFontFamilyChange,
  onFontSizeChange,
  onColorChange,
  onStyleChange,
  onDeleteSelected,
  onSave,
}: {
  fontFamily: PdfTextFontFamily
  fontSize: number
  color: string
  isBold: boolean
  isItalic: boolean
  hasSelection: boolean
  hasOverlays: boolean
  onFontFamilyChange: (fontFamily: PdfTextFontFamily) => void
  onFontSizeChange: (size: number) => void
  onColorChange: (color: string) => void
  onStyleChange: (style: { isBold: boolean; isItalic: boolean }) => void
  onDeleteSelected: () => void
  onSave: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Text tools</CardTitle>
        <CardDescription>
          Click the PDF to add text, then select and type directly on the text.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-[180px_110px_110px_auto]">
          <Field>
            <FieldLabel>Font</FieldLabel>
            <Select
              value={fontFamily}
              onValueChange={(value) =>
                onFontFamilyChange(value as PdfTextFontFamily)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose font" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                  <SelectItem value="times_roman">Times</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="pdf-edit-size">Size</FieldLabel>
            <Input
              id="pdf-edit-size"
              type="number"
              min={8}
              max={72}
              value={fontSize}
              onChange={(event) =>
                onFontSizeChange(Number(event.target.value) || 8)
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pdf-edit-color">Color</FieldLabel>
            <Input
              id="pdf-edit-color"
              type="color"
              value={color}
              onChange={(event) => onColorChange(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Style</FieldLabel>
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={[
                ...(isBold ? ["bold"] : []),
                ...(isItalic ? ["italic"] : []),
              ]}
              onValueChange={(values) =>
                onStyleChange({
                  isBold: values.includes("bold"),
                  isItalic: values.includes("italic"),
                })
              }
            >
              <ToggleGroupItem
                value="bold"
                aria-label="Bold"
                title="Bold (Ctrl+B)"
              >
                <BoldIcon data-icon="inline-start" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="italic"
                aria-label="Italic"
                title="Italic (Ctrl+I)"
              >
                <ItalicIcon data-icon="inline-start" />
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!hasSelection}
            onClick={onDeleteSelected}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete selected
          </Button>
          <Button type="button" disabled={!hasOverlays} onClick={onSave}>
            <SaveIcon data-icon="inline-start" />
            Save edited PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
