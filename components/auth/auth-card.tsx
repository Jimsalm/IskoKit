import { CodeIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const socialButtonClassName =
  "rounded-full border-border bg-secondary text-secondary-foreground shadow-md hover:bg-accent hover:text-accent-foreground"

const inputClassName =
  "h-9 rounded-full border-input bg-secondary px-3 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring"

export function AuthCard() {
  return (
    <Card className="w-full max-w-sm gap-5 rounded-3xl border-border bg-card px-6 py-7 text-card-foreground shadow-2xl ring-0">
      <CardHeader className="gap-2 px-0">
        <CardTitle className="text-2xl leading-tight font-semibold">
          Create an account
        </CardTitle>
        <CardDescription className="max-w-xs text-sm leading-5">
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-0">
        <div className="grid grid-cols-2 gap-5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={socialButtonClassName}
          >
            <CodeIcon data-icon="inline-start" />
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={socialButtonClassName}
          >
            <SearchIcon data-icon="inline-start" />
            Google
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Separator />
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            OR CONTINUE WITH
          </span>
          <Separator />
        </div>

        <form className="flex flex-col gap-5">
          <FieldGroup className="gap-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                className={inputClassName}
                placeholder="m@example.com"
                autoComplete="email"
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                className={inputClassName}
                autoComplete="new-password"
              />
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" className="rounded-full shadow-lg">
            Create account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
