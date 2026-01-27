/**
 * API Middleware Utilities
 *
 * Provides reusable middleware functions for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Higher-order function to add authentication to API routes
 * @param handler - The API route handler to protect
 * @returns Protected API route handler
 */
export function withAuth<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req, ...args)
  }
}

/**
 * Error codes for common database errors
 */
export const DB_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'P2002',
  NOT_FOUND: 'P2025',
  FOREIGN_KEY_CONSTRAINT: 'P2003',
} as const

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Resource not found',
  DUPLICATE_SLUG: 'A resource with this slug already exists',
  INVALID_DATA: 'Invalid data provided',
  SERVER_ERROR: 'An internal server error occurred',
} as const

/**
 * Handle common Prisma errors and return appropriate responses
 * @param error - The error to handle
 * @param context - Additional context about the error
 * @returns NextResponse with appropriate error message and status
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Type guard for Prisma errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> }

    switch (prismaError.code) {
      case DB_ERROR_CODES.UNIQUE_CONSTRAINT:
        return NextResponse.json(
          { error: ERROR_MESSAGES.DUPLICATE_SLUG },
          { status: 400 }
        )

      case DB_ERROR_CODES.NOT_FOUND:
        return NextResponse.json(
          { error: ERROR_MESSAGES.NOT_FOUND },
          { status: 404 }
        )

      case DB_ERROR_CODES.FOREIGN_KEY_CONSTRAINT:
        return NextResponse.json(
          { error: 'Cannot delete resource with existing references' },
          { status: 400 }
        )
    }
  }

  // Log the error for debugging (in production, use proper logging)
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

  // Generic error response
  return NextResponse.json(
    { error: ERROR_MESSAGES.SERVER_ERROR },
    { status: 500 }
  )
}

/**
 * Validate required fields in request data
 * @param data - The request data object
 * @param requiredFields - Array of required field names
 * @returns NextResponse with error or null if validation passes
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): NextResponse | null {
  const missingFields = requiredFields.filter(field => !data[field])

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INVALID_DATA,
        details: `Missing required fields: ${missingFields.join(', ')}`
      },
      { status: 400 }
    )
  }

  return null
}
