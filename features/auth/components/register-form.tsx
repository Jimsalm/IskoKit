"use client"

import Link from "next/link"
import { useActionState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import {
  registerAction,
  type RegisterActionState,
} from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IskoKitLogo } from "@/components/iskokit-logo"
import { Separator } from "@/components/ui/separator"

const initialState: RegisterActionState = {
  message: "",
  errors: {},
}

const inputClassName =
  "h-10 rounded-md border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus-visible:border-ring"

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  )

  const emailError = state.errors?.email?.[0]
  const passwordError = state.errors?.password?.[0]
  const confirmPasswordError = state.errors?.confirmPassword?.[0]

  return (
    <div className="flex w-full flex-col gap-7">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 lg:hidden">
          <IskoKitLogo />
          <span className="text-base font-semibold">IskoKit</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl leading-tight font-semibold">
            Create an account
          </h1>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Set up your IskoKit account to get started.
          </p>
        </div>
      </div>

      <div className="text-foreground">
        <form action={formAction} className="flex flex-col gap-5">
          <FieldGroup className="gap-4">
            <Field className="gap-2" data-invalid={Boolean(emailError)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                className={inputClassName}
                placeholder="m@example.com"
                autoComplete="email"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "email-error" : undefined}
                disabled={pending}
                required
              />
              <FieldError id="email-error">{emailError}</FieldError>
            </Field>
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
            state.success ? (
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {state.message}
              </p>
            ) : (
              <FieldError aria-live="polite">{state.message}</FieldError>
            )
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-md"
            disabled={pending || state.success}
          >
            {pending ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            Create account
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <Separator className="min-w-0 flex-1 shrink data-horizontal:w-auto" />
          <span className="shrink-0 text-xs text-muted-foreground">
            or
          </span>
          <Separator className="min-w-0 flex-1 shrink data-horizontal:w-auto" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full rounded-md"
          disabled
        >
          Google sign-in coming soon
        </Button>
      </div>

      <p className="border-t border-border pt-5 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button asChild variant="link" className="h-auto p-0">
          <Link href="/login">Sign in</Link>
        </Button>
      </p>
    </div>
  )
}
