"use client"

import Link from "next/link"
import { useActionState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from "@/features/auth/actions"
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

const initialState: ResetPasswordActionState = {
  message: "",
  errors: {},
}

const inputClassName =
  "h-9 rounded-full border-input bg-secondary px-3 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring"

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  )

  const passwordError = state.errors?.password?.[0]
  const confirmPasswordError = state.errors?.confirmPassword?.[0]

  return (
    <Card className="w-full max-w-sm gap-5 rounded-3xl border-border bg-card px-6 py-7 text-card-foreground shadow-2xl ring-0">
      <CardHeader className="gap-2 px-0">
        <CardTitle className="text-2xl leading-tight font-semibold">
          Create new password
        </CardTitle>
        <CardDescription className="max-w-xs text-sm leading-5">
          Enter a new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form action={formAction} className="flex flex-col gap-5">
          <FieldGroup className="gap-4">
            <Field className="gap-2" data-invalid={Boolean(passwordError)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                className={inputClassName}
                autoComplete="new-password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={
                  passwordError ? "password-error" : undefined
                }
                disabled={pending}
                required
              />
              <FieldError id="password-error">{passwordError}</FieldError>
            </Field>
            <Field
              className="gap-2"
              data-invalid={Boolean(confirmPasswordError)}
            >
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={inputClassName}
                autoComplete="new-password"
                aria-invalid={Boolean(confirmPasswordError)}
                aria-describedby={
                  confirmPasswordError ? "confirm-password-error" : undefined
                }
                disabled={pending}
                required
              />
              <FieldError id="confirm-password-error">
                {confirmPasswordError}
              </FieldError>
            </Field>
          </FieldGroup>

          {state.message ? (
            <FieldError aria-live="polite">{state.message}</FieldError>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="rounded-full shadow-lg"
            disabled={pending}
          >
            {pending ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            Update password
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Need a new link?{" "}
          <Button asChild variant="link" className="h-auto p-0">
            <Link href="/forgot-password">Request reset</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}
