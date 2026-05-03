"use client"

import Link from "next/link"
import { useActionState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import { loginAction, type LoginActionState } from "@/features/auth/actions"
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

const initialState: LoginActionState = {
  message: "",
  errors: {},
}

const inputClassName =
  "h-9 rounded-full border-input bg-secondary px-3 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  )

  const emailError = state.errors?.email?.[0]
  const passwordError = state.errors?.password?.[0]

  return (
    <Card className="w-full max-w-sm gap-5 rounded-3xl border-border bg-card px-6 py-7 text-card-foreground shadow-2xl ring-0">
      <CardHeader className="gap-2 px-0">
        <CardTitle className="text-2xl leading-tight font-semibold">
          Welcome back
        </CardTitle>
        <CardDescription className="max-w-xs text-sm leading-5">
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
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
                autoComplete="current-password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={
                  passwordError ? "password-error" : undefined
                }
                disabled={pending}
                required
              />
              <FieldError id="password-error">{passwordError}</FieldError>
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
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button asChild variant="link" className="h-auto p-0">
            <Link href="/register">Create one</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}
