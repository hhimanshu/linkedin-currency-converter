import type { ConversionRequest } from '../types/currency.types';

export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string>;
}

/**
 * Validate conversion request parameters from URL query string
 */
export function validateConversionRequest(
  searchParams: URLSearchParams
): { valid: true; data: ConversionRequest } | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate 'amount' parameter
  const amountStr = searchParams.get('amount');
  if (!amountStr) {
    errors.amount = 'Amount parameter is required';
  }

  const amount = amountStr ? parseFloat(amountStr) : NaN;
  if (isNaN(amount)) {
    errors.amount = 'Amount must be a valid number';
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (!isFinite(amount)) {
    errors.amount = 'Amount must be a finite number';
  }

  // Validate 'from' parameter
  const from = searchParams.get('from');
  if (!from) {
    errors.from = 'From currency parameter is required';
  } else if (!isValidCurrencyCode(from)) {
    errors.from = 'From currency must be a valid 3-letter ISO code';
  }

  // Validate 'to' parameter
  const to = searchParams.get('to');
  if (!to) {
    errors.to = 'To currency parameter is required';
  } else if (!isValidCurrencyCode(to)) {
    errors.to = 'To currency must be a valid 3-letter ISO code';
  }

  // If there are any errors, return them
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  // All validations passed
  return {
    valid: true,
    data: {
      amount: amount,
      from: from!.toUpperCase(),
      to: to!.toUpperCase(),
    },
  };
}

/**
 * Check if a string is a valid ISO currency code format
 * (3 uppercase letters)
 */
function isValidCurrencyCode(code: string): boolean {
  return /^[A-Za-z]{3}$/.test(code);
}
