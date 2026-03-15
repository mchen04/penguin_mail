import { describe, it, expect } from 'vitest'
import { AppError, toAppError } from '../errors'

describe('AppError', () => {
  it('creates with message and default code', () => {
    const err = new AppError('Something went wrong')
    expect(err.message).toBe('Something went wrong')
    expect(err.code).toBe('UNKNOWN_ERROR')
    expect(err.name).toBe('AppError')
  })

  it('creates with custom code', () => {
    const err = new AppError('Not found', 'NOT_FOUND')
    expect(err.code).toBe('NOT_FOUND')
  })

  it('creates with details', () => {
    const err = new AppError('Bad request', 'VALIDATION_ERROR', { field: 'email' })
    expect(err.details).toEqual({ field: 'email' })
  })

  it('creates with cause', () => {
    const cause = new Error('Original error')
    const err = new AppError('Wrapper', 'UNKNOWN_ERROR', undefined, cause)
    expect(err.cause).toBe(cause)
  })

  it('is an instance of Error', () => {
    const err = new AppError('test')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })
})

describe('toAppError', () => {
  it('returns AppError as-is', () => {
    const err = new AppError('test', 'NOT_FOUND')
    expect(toAppError(err)).toBe(err)
  })

  it('wraps Error', () => {
    const err = new Error('Something failed')
    const result = toAppError(err)
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('Something failed')
    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.cause).toBe(err)
  })

  it('wraps string', () => {
    const result = toAppError('string error')
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('string error')
  })

  it('wraps unknown types', () => {
    const result = toAppError(42)
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('An unexpected error occurred')
  })

  it('wraps null', () => {
    const result = toAppError(null)
    expect(result).toBeInstanceOf(AppError)
  })
})
