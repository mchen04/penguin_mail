/**
 * Error handling utilities
 * Provides consistent error types and handling patterns across the application
 */

// --------------------------------------------------------------------------
// Error Types
// --------------------------------------------------------------------------

/**
 * Error codes for categorizing errors
 */
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Structured application error
 */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly details?: Record<string, unknown>
  readonly cause?: Error

  constructor(
    message: string,
    code: ErrorCode = 'UNKNOWN_ERROR',
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.cause = cause

    // Maintains proper stack trace for where our error was thrown (V8 only)
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AppError)
    }
  }
}

// --------------------------------------------------------------------------
// Error Handling Utilities
// --------------------------------------------------------------------------

/**
 * Check if an error is an AppError
 */
function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Convert an unknown error to an AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', undefined, error)
  }

  if (typeof error === 'string') {
    return new AppError(error)
  }

  return new AppError('An unexpected error occurred')
}
