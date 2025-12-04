import type { ErrorResponse } from '../types/currency.types';

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
): Response {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return new Response(JSON.stringify(errorResponse, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Pre-built error responses for common scenarios
 */
export const ErrorResponses = {
  invalidParameters: (details: Record<string, string>) =>
    createErrorResponse(
      'INVALID_PARAMETERS',
      'One or more request parameters are invalid',
      400,
      { validationErrors: details }
    ),

  unsupportedCurrency: (currency: string) =>
    createErrorResponse(
      'UNSUPPORTED_CURRENCY',
      `Currency '${currency}' is not supported`,
      400,
      { unsupportedCurrency: currency }
    ),

  unsupportedConversion: (from: string, to: string) =>
    createErrorResponse(
      'UNSUPPORTED_CONVERSION',
      'Only USD-based conversions are supported (USD→Currency or Currency→USD)',
      400,
      { from, to, hint: 'Transitive conversions between non-USD currencies are not supported' }
    ),

  internalError: () =>
    createErrorResponse(
      'INTERNAL_ERROR',
      'An internal error occurred while processing your request',
      500
    ),
};
