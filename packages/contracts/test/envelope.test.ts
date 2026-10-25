import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  AppError,
  ERROR_CODES,
  created,
  failure,
  hasMinimumRole,
  isRole,
  paginated,
  success,
  toFieldErrors,
  validationFailure,
  zodValidationFailure,
} from '../src/index.js';

describe('response envelope', () => {
  it('builds the legacy success shape', () => {
    expect(success({ id: '1' })).toEqual({
      statusCode: 200,
      body: { success: true, data: { id: '1' }, message: 'Success', statusCode: 200 },
    });
  });

  it('builds a 201 created response', () => {
    const result = created({ id: '1' });
    expect(result.statusCode).toBe(201);
    expect(result.body.message).toBe('Created successfully');
  });

  it('computes pagination flags identically to the legacy helper', () => {
    const result = paginated(['a', 'b'], 22, 2, 10);
    expect(result.body.data).toEqual({
      items: ['a', 'b'],
      total: 22,
      page: 2,
      pageSize: 10,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
    expect(paginated([], 0, 1, 10).body.data).toMatchObject({
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('keeps AppError status/code semantics (code in the message field)', () => {
    const result = failure(new AppError(409, 'Already registered', 'USER_EXISTS'));
    expect(result.statusCode).toBe(409);
    expect(result.body).toEqual({
      success: false,
      error: { message: 'Already registered' },
      message: 'USER_EXISTS',
      statusCode: 409,
    });
  });

  it('falls back to a generic message for plain errors', () => {
    const result = failure(new Error('boom'), 400);
    expect(result.body).toEqual({
      success: false,
      error: { message: 'boom' },
      message: 'An error occurred',
      statusCode: 400,
    });
  });

  it('builds the 422 field map', () => {
    expect(validationFailure({ email: ['Invalid email format'] })).toEqual({
      statusCode: 422,
      body: {
        success: false,
        error: { message: 'Validation failed', fields: { email: ['Invalid email format'] } },
        message: 'Invalid input',
        statusCode: 422,
      },
    });
  });

  it('maps Zod issues to dotted paths and _root', () => {
    const parsed = z
      .object({ username: z.string().min(3, 'Too short') })
      .refine(() => false, { message: 'Global failure' })
      .safeParse({ username: 'a' });
    if (parsed.success) throw new Error('expected validation to fail');
    expect(toFieldErrors(parsed.error)).toEqual({
      username: ['Too short'],
      _root: ['Global failure'],
    });
    expect(zodValidationFailure(parsed.error).statusCode).toBe(422);
  });
});

describe('roles and error codes', () => {
  it('preserves the role hierarchy', () => {
    expect(hasMinimumRole('admin', 'curator')).toBe(true);
    expect(hasMinimumRole('user', 'contributor')).toBe(false);
    expect(hasMinimumRole('curator', 'curator')).toBe(true);
    expect(isRole('admin')).toBe(true);
    expect(isRole('superuser')).toBe(false);
  });

  it('exposes the frozen legacy error code strings', () => {
    expect(ERROR_CODES.USER_EXISTS).toBe('USER_EXISTS');
    expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
  });
});
