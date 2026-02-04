import { Component, type ReactNode, type ErrorInfo } from 'react'
import { toAppError, type AppError } from '@/utils/errors'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  /** Section name for inline error display */
  section?: string
  /** Use inline/compact error UI instead of full-page */
  inline?: boolean
  onError?: (error: AppError, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

/**
 * Error Boundary component for graceful error handling
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error: toAppError(error) }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    const appError = toAppError(error)

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', appError)
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    }

    // Call optional error handler
    this.props.onError?.(appError, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Inline/section error UI
      if (this.props.inline) {
        const sectionName = this.props.section || 'This section'
        return (
          <div className={styles.inlineErrorContainer}>
            <svg
              className={styles.inlineErrorIcon}
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h3 className={styles.inlineErrorTitle}>{sectionName} failed to load</h3>
            <p className={styles.inlineErrorMessage}>
              {this.state.error?.message || 'An error occurred'}
            </p>
            <button className={styles.inlineRetryButton} onClick={this.handleRetry}>
              Retry
            </button>
          </div>
        )
      }

      // Default full-page error UI
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2 className={styles.errorTitle}>Something went wrong</h2>
            <p className={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {import.meta.env.DEV && this.state.error?.code && (
              <p className={styles.errorCode}>Error code: {this.state.error.code}</p>
            )}
            <button className={styles.retryButton} onClick={this.handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
