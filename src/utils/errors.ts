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
// Specific Error Classes
// --------------------------------------------------------------------------

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred', cause?: Error) {
    super(message, 'NETWORK_ERROR', undefined, cause)
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', cause?: Error) {
    super(message, 'UNAUTHORIZED', undefined, cause)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied', cause?: Error) {
    super(message, 'FORBIDDEN', undefined, cause)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', cause?: Error) {
    super(`${resource} not found`, 'NOT_FOUND', { resource }, cause)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>, cause?: Error) {
    super(message, 'VALIDATION_ERROR', fields ? { fields } : undefined, cause)
    this.name = 'ValidationError'
  }
}

export class RateLimitError extends AppError {
  readonly retryAfter?: number

  constructor(message = 'Too many requests', retryAfter?: number, cause?: Error) {
    super(message, 'RATE_LIMITED', retryAfter ? { retryAfter } : undefined, cause)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class ServerError extends AppError {
  constructor(message = 'Internal server error', cause?: Error) {
    super(message, 'SERVER_ERROR', undefined, cause)
    this.name = 'ServerError'
  }
}

// --------------------------------------------------------------------------
// Error Handling Utilities
// --------------------------------------------------------------------------

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
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

/**
 * Get a user-friendly message for an error code
 */
export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    UNAUTHORIZED: 'Please sign in to continue.',
    FORBIDDEN: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  }
  return messages[code]
}

/**
 * Async wrapper that catches errors and converts them to AppError
 * Useful for wrapping async operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const appError = toAppError(error)
    if (context) {
      return {
        data: null,
        error: new AppError(
          `${context}: ${appError.message}`,
          appError.code,
          appError.details,
          appError
        ),
      }
    }
    return { data: null, error: appError }
  }
}

/**
 * Create an error handler that shows a toast notification
 * Returns a function suitable for use in catch blocks
 */
export function createErrorHandler(
  showToast: (message: string) => void,
  defaultMessage = 'An error occurred'
) {
  return (error: unknown): void => {
    const appError = toAppError(error)
    const message = appError.message || getErrorMessage(appError.code) || defaultMessage
    showToast(message)

    // Log for debugging in development
    if (import.meta.env.DEV) {
      console.error('[AppError]', appError)
    }
  }
}

/**
 * Type guard to check if a value is a repository response with an error
 */
export function hasError<T>(
  response: { success: boolean; error?: string; data?: T }
): response is { success: false; error: string; data?: undefined } {
  return !response.success && !!response.error
}
