export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NETWORK"
  | "SETUP_REQUIRED"
  | "VALIDATION"
  | "UNKNOWN"

type AppErrorOptions = {
  code?: AppErrorCode
  cause?: unknown
}

type AppErrorMapping = {
  code?: AppErrorCode
  matches: string[]
  message: string
}

export type ToAppErrorOptions = {
  fallbackMessage: string
  code?: AppErrorCode
  permissionMessage?: string
  setupMessage?: string
  networkMessage?: string
  preferResponseMessage?: boolean
  mappings?: AppErrorMapping[]
}

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly cause?: unknown

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = "AppError"
    this.code = options.code ?? "UNKNOWN"
    this.cause = options.cause
  }
}

function getResponseErrorMessage(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return ""
  }

  const response = error.response

  if (!response || typeof response !== "object" || !("data" in response)) {
    return ""
  }

  const data = response.data

  if (!data || typeof data !== "object") {
    return ""
  }

  if ("error" in data && typeof data.error === "string") {
    return data.error
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message
  }

  return ""
}

export function getRawErrorMessage(error: unknown) {
  const responseMessage = getResponseErrorMessage(error)

  if (responseMessage) {
    return responseMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return ""
}

function includesAny(message: string, matches: string[]) {
  return matches.some((match) => message.includes(match))
}

export function toAppError(error: unknown, options: ToAppErrorOptions) {
  if (error instanceof AppError) {
    return error
  }

  const responseMessage = getResponseErrorMessage(error)
  const rawMessage = getRawErrorMessage(error)
  const normalizedMessage = rawMessage.toLowerCase()

  for (const mapping of options.mappings ?? []) {
    if (includesAny(normalizedMessage, mapping.matches)) {
      return new AppError(mapping.message, {
        code: mapping.code ?? options.code,
        cause: error,
      })
    }
  }

  if (
    includesAny(normalizedMessage, [
      "row-level security",
      "permission denied",
      "jwt",
      "not authenticated",
      "must be signed in",
      "unauthorized",
      "forbidden",
    ])
  ) {
    return new AppError(
      options.permissionMessage ??
        "You do not have permission to complete this action. Please sign in again.",
      {
        code: "FORBIDDEN",
        cause: error,
      },
    )
  }

  if (
    includesAny(normalizedMessage, [
      "could not find the table",
      "schema cache",
      "relation",
      "api key is not configured",
      "not configured",
    ])
  ) {
    return new AppError(
      options.setupMessage ??
        "This feature is not set up yet. Please run the database migration.",
      {
        code: "SETUP_REQUIRED",
        cause: error,
      },
    )
  }

  if (
    includesAny(normalizedMessage, [
      "failed to fetch",
      "fetch failed",
      "network",
      "timeout",
    ])
  ) {
    return new AppError(
      options.networkMessage ??
        "Could not reach the server. Check your connection and try again.",
      {
        code: "NETWORK",
        cause: error,
      },
    )
  }

  if (options.preferResponseMessage && responseMessage) {
    return new AppError(responseMessage, {
      code: options.code ?? "UNKNOWN",
      cause: error,
    })
  }

  return new AppError(options.fallbackMessage, {
    code: options.code ?? "UNKNOWN",
    cause: error,
  })
}

export function throwAppError(
  error: unknown,
  options: ToAppErrorOptions,
): never {
  throw toAppError(error, options)
}

export function getUserErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AppError) {
    return error.message
  }

  const responseMessage = getResponseErrorMessage(error)

  if (responseMessage) {
    return responseMessage
  }

  return fallbackMessage
}
