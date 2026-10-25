/**
 * The Neuron response envelope.
 *
 * Wire shape (unchanged from the legacy Next.js handlers):
 *   { success, data?, error?: { message, fields? }, message?, statusCode }
 *
 * Builders are framework-free: they return `{ statusCode, body }` and leave
 * transport to the caller (NestJS response object, Fetch Response, tests).
 */

import type { ZodError } from 'zod';
import { AppError } from './errors.js';

export interface ApiErrorPayload {
  message: string;
  fields?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResult<T = unknown> {
  statusCode: number;
  body: ApiResponse<T>;
}

export function success<T>(data: T, message = 'Success', statusCode = 200): ApiResult<T> {
  return {
    statusCode,
    body: { success: true, data, message, statusCode },
  };
}

export function created<T>(data: T, message = 'Created successfully'): ApiResult<T> {
  return success(data, message, 201);
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message = 'Success',
): ApiResult<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / pageSize);
  return success(
    {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    message,
    200,
  );
}

/**
 * Error envelope. `AppError` keeps its own status and exposes its code in the
 * top-level `message` field — this oddity is part of the frozen wire contract.
 */
export function failure(error: Error | AppError | string, statusCode = 500): ApiResult {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: { message: error.message },
        message: error.code ?? 'An error occurred',
        statusCode: error.statusCode,
      },
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    statusCode,
    body: {
      success: false,
      error: { message },
      message: 'An error occurred',
      statusCode,
    },
  };
}

/**
 * 422 envelope with per-field messages.
 * Shape: { success: false, error: { message, fields }, message: 'Invalid input', statusCode: 422 }
 */
export function validationFailure(fields: Record<string, string[]>): ApiResult {
  return {
    statusCode: 422,
    body: {
      success: false,
      error: {
        message: 'Validation failed',
        fields,
      },
      message: 'Invalid input',
      statusCode: 422,
    },
  };
}

/** Flattens Zod issues into the legacy `{ field: string[] }` map. */
export function toFieldErrors(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!fields[path]) fields[path] = [];
    fields[path].push(issue.message);
  }
  return fields;
}

export function zodValidationFailure(error: ZodError): ApiResult {
  return validationFailure(toFieldErrors(error));
}
